import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'
import BudgetPanel from './components/BudgetPanel'
import DebtsPanel from './components/DebtsPanel'
import StrategyPicker from './components/StrategyPicker'
import PriorityList from './components/PriorityList'
import ScenarioManager from './components/ScenarioManager'
import SummaryCards from './components/SummaryCards'
import Reminders from './components/Reminders'
import PayoffCalendar from './components/PayoffCalendar'
import AchievementBadges from './components/AchievementBadges'
import Milestones from './components/Milestones'
import DebtFreeHero from './components/DebtFreeHero'
import MonthlyCheckIn from './components/MonthlyCheckIn'
import Simulator from './components/Simulator'
import Recommendation from './components/Recommendation'
import Affordability from './components/Affordability'
import AssumptionsPanel from './components/AssumptionsPanel'
import OnboardingWizard, { type OnboardingResult } from './components/OnboardingWizard'
import CurrencySelector from './components/CurrencySelector'
import LanguageSelector from './components/LanguageSelector'
import AccountMenu from './components/AccountMenu'
import AuthModal from './components/AuthModal'
import MoreMenu from './components/MoreMenu'
import EducationCenter from './components/EducationCenter'
import PricingModal from './components/PricingModal'

const PayoffChart = lazy(() => import('./components/PayoffChart'))
import ThemeToggle from './components/ThemeToggle'
import Confetti from './components/Confetti'
import { makeId, simulatePayoff, totalMinPayment, type Debt, type Strategy } from './lib/payoff'
import { captureBaseline, type PlanBaseline } from './lib/checkIn'
import { trackEvent } from './lib/analytics'
import { loadState, saveState, SAMPLE_DEBTS } from './lib/storage'
import { guessCurrencyFromLocale } from './lib/currencies'
import { guessLocaleFromBrowser, LANGUAGE_META, TRANSLATIONS, type Locale } from './lib/i18n'
import { isCloudConfigured } from './lib/supabase'
import { signOut as authSignOut, useAuth } from './lib/useAuth'
import type { Payment } from './lib/reminders'
import type { Scenario } from './lib/scenarios'
import type { AchievementSignals } from './lib/achievements'
import {
  deletePaymentRemote,
  deleteScenarioRemote,
  fetchCloudDebts,
  fetchCloudPayments,
  fetchCloudScenarios,
  fetchCloudSettings,
  insertPaymentRemote,
  insertScenarioRemote,
  syncDebtsDiff,
  upsertSettingsRemote,
  type CloudSettings,
} from './lib/cloud'

const DEFAULTS = {
  debts: [] as Debt[],
  monthlyIncome: 0,
  fixedExpenses: 0,
  extraPayment: 0,
  strategy: 'avalanche' as Strategy,
  priorityOrder: [] as string[],
  theme: 'light' as 'light' | 'dark',
}

function getInitialTheme(): 'light' | 'dark' {
  const saved = loadState()
  if (saved?.theme) return saved.theme
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

/** Appends newly-added debt ids to the end and drops removed ones, keeping existing ranks stable. */
function reconcilePriorityOrder(order: string[], debts: Debt[]): string[] {
  const debtIds = new Set(debts.map((d) => d.id))
  const kept = order.filter((id) => debtIds.has(id))
  const missing = debts.filter((d) => !order.includes(d.id)).map((d) => d.id)
  return [...kept, ...missing]
}

export default function App() {
  const saved = useMemo(() => loadState(), [])
  const [debts, setDebts] = useState<Debt[]>(saved?.debts ?? DEFAULTS.debts)
  const [monthlyIncome, setMonthlyIncome] = useState(saved?.monthlyIncome ?? DEFAULTS.monthlyIncome)
  const [fixedExpenses, setFixedExpenses] = useState(saved?.fixedExpenses ?? DEFAULTS.fixedExpenses)
  const [extraPayment, setExtraPayment] = useState(saved?.extraPayment ?? DEFAULTS.extraPayment)
  const [strategy, setStrategy] = useState<Strategy>(saved?.strategy ?? DEFAULTS.strategy)
  const [priorityOrder, setPriorityOrder] = useState<string[]>(
    reconcilePriorityOrder(saved?.priorityOrder ?? DEFAULTS.priorityOrder, saved?.debts ?? DEFAULTS.debts),
  )
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme())
  const [currency, setCurrency] = useState<string>(saved?.currency ?? guessCurrencyFromLocale())
  const [language, setLanguage] = useState<Locale>(saved?.language ?? guessLocaleFromBrowser())
  const [confettiTrigger, setConfettiTrigger] = useState(0)

  const [payments, setPayments] = useState<Payment[]>(saved?.payments ?? [])
  const [scenarios, setScenarios] = useState<Scenario[]>(saved?.scenarios ?? [])
  const [triedStrategies, setTriedStrategies] = useState<Strategy[]>(saved?.triedStrategies ?? [strategy])
  const [hasDownloadedReport, setHasDownloadedReport] = useState(saved?.hasDownloadedReport ?? false)
  const [debtsPaidOffCount, setDebtsPaidOffCount] = useState(saved?.debtsPaidOffCount ?? 0)
  const [hasEditedBudget, setHasEditedBudget] = useState(saved?.hasEditedBudget ?? false)
  const [hasExplored, setHasExplored] = useState(saved?.hasExplored ?? false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(saved?.hasCompletedOnboarding ?? false)
  const [planBaseline, setPlanBaseline] = useState<PlanBaseline | null>(saved?.planBaseline ?? null)
  const [hasJoinedPlusWaitlist, setHasJoinedPlusWaitlist] = useState(saved?.hasJoinedPlusWaitlist ?? false)

  const { user, loading: authLoading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showEducation, setShowEducation] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle')
  const cloudDebtsRef = useRef<Debt[]>(debts)
  const hydratingRef = useRef(false)
  const handledUserIdRef = useRef<string | null>(null)

  const t = TRANSLATIONS[language]
  const dateLocale = LANGUAGE_META[language].dateLocale

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    document.title = t.meta.documentTitle
    document.documentElement.lang = language
  }, [t, language])

  useEffect(() => {
    saveState({
      debts,
      monthlyIncome,
      fixedExpenses,
      extraPayment,
      strategy,
      priorityOrder,
      theme,
      currency,
      language,
      payments,
      scenarios,
      triedStrategies,
      hasDownloadedReport,
      debtsPaidOffCount,
      hasEditedBudget,
      hasExplored,
      hasCompletedOnboarding,
      planBaseline,
      hasJoinedPlusWaitlist,
    })
  }, [
    debts,
    monthlyIncome,
    fixedExpenses,
    extraPayment,
    strategy,
    priorityOrder,
    theme,
    currency,
    language,
    payments,
    scenarios,
    triedStrategies,
    hasDownloadedReport,
    debtsPaidOffCount,
    hasEditedBudget,
    hasExplored,
    hasCompletedOnboarding,
    planBaseline,
    hasJoinedPlusWaitlist,
  ])

  function currentSettings(): CloudSettings {
    return {
      monthlyIncome,
      fixedExpenses,
      extraPayment,
      strategy,
      priorityOrder,
      currency,
      language,
      theme,
      triedStrategies,
      hasDownloadedReport,
      planBaseline,
    }
  }

  // On sign-in: pull the account's cloud data down, or — for a brand-new account — push
  // whatever is already in this browser up, so nothing created while signed out is lost.
  useEffect(() => {
    if (!user) {
      handledUserIdRef.current = null
      return
    }
    if (handledUserIdRef.current === user.id) return
    handledUserIdRef.current = user.id

    let cancelled = false
    hydratingRef.current = true
    setSyncStatus('syncing')
    ;(async () => {
      try {
        const [cloudDebts, cloudSettings, cloudPayments, cloudScenarios] = await Promise.all([
          fetchCloudDebts(user.id),
          fetchCloudSettings(user.id),
          fetchCloudPayments(user.id),
          fetchCloudScenarios(user.id),
        ])
        if (cancelled) return

        if (cloudDebts.length > 0 || cloudSettings) {
          setDebts(cloudDebts)
          cloudDebtsRef.current = cloudDebts
          setPayments(cloudPayments)
          setScenarios(cloudScenarios)
          setHasCompletedOnboarding(true)
          if (cloudSettings) {
            setMonthlyIncome(cloudSettings.monthlyIncome)
            setFixedExpenses(cloudSettings.fixedExpenses)
            setExtraPayment(cloudSettings.extraPayment)
            setStrategy(cloudSettings.strategy)
            setPriorityOrder(reconcilePriorityOrder(cloudSettings.priorityOrder, cloudDebts))
            setCurrency(cloudSettings.currency)
            setLanguage(cloudSettings.language)
            setTheme(cloudSettings.theme)
            setTriedStrategies(cloudSettings.triedStrategies.length > 0 ? cloudSettings.triedStrategies : [strategy])
            setHasDownloadedReport(cloudSettings.hasDownloadedReport)
            setPlanBaseline(cloudSettings.planBaseline)
          }
        } else {
          // Fresh account: adopt whatever is currently in this browser as the starting point.
          await syncDebtsDiff(user.id, [], debts)
          await upsertSettingsRemote(user.id, currentSettings())
          await Promise.all(payments.map((p) => insertPaymentRemote(user.id, p)))
          await Promise.all(scenarios.map((s) => insertScenarioRemote(user.id, s)))
          cloudDebtsRef.current = debts
          trackEvent('account_created', user.id)
        }
        setSyncStatus('synced')
      } catch {
        setSyncStatus('idle')
      } finally {
        if (!cancelled) hydratingRef.current = false
      }
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Debounced settings sync while signed in.
  useEffect(() => {
    if (!user || hydratingRef.current) return
    const timeout = setTimeout(() => {
      setSyncStatus('syncing')
      upsertSettingsRemote(user.id, currentSettings())
        .then(() => setSyncStatus('synced'))
        .catch(() => setSyncStatus('idle'))
    }, 700)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    monthlyIncome,
    fixedExpenses,
    extraPayment,
    strategy,
    priorityOrder,
    currency,
    language,
    theme,
    triedStrategies,
    hasDownloadedReport,
    planBaseline,
  ])

  const minPayment = totalMinPayment(debts)
  const budget = minPayment + extraPayment
  const simulatorSliderMax = Math.max(500, Math.round((monthlyIncome - fixedExpenses - minPayment) / 10) * 10 || 500)

  const avalanche = useMemo(() => simulatePayoff(debts, 'avalanche', budget), [debts, budget])
  const snowball = useMemo(() => simulatePayoff(debts, 'snowball', budget), [debts, budget])
  const custom = useMemo(
    () => simulatePayoff(debts, 'custom', budget, new Date(), priorityOrder),
    [debts, budget, priorityOrder],
  )
  const baseline = useMemo(
    () => simulatePayoff(debts, strategy, minPayment, new Date(), priorityOrder),
    [debts, strategy, minPayment, priorityOrder],
  )
  const results: Record<Strategy, typeof avalanche> = { avalanche, snowball, custom }
  const selected = results[strategy]

  // Freeze "the plan you started with" the first time it becomes real, so the monthly
  // check-in always has a fixed reference point to measure "ahead"/"behind" against.
  useEffect(() => {
    if (!planBaseline && debts.length > 0 && selected.feasible && !hydratingRef.current) {
      setPlanBaseline(captureBaseline(selected))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debts.length, selected.feasible, planBaseline])

  function handleResetBaseline() {
    setPlanBaseline(captureBaseline(selected))
  }

  // Activation funnel (spec section 18) — first-party events into this project's own
  // Supabase, deduped per visitor by trackEvent itself. Covers both the guided onboarding
  // wizard (via its onStart callback below) and a returning user editing the dashboard
  // directly, since either path ends up changing this same App-level state.
  useEffect(() => {
    trackEvent('visitor', user?.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (debts.length > 0) {
      trackEvent('plan_started', user?.id)
      trackEvent('debt_added', user?.id)
    }
    if (debts.length > 0 && monthlyIncome > 0) trackEvent('plan_completed', user?.id)
    if (selected.feasible && debts.length > 0) trackEvent('saw_debt_free_date', user?.id)
  }, [debts.length, monthlyIncome, selected.feasible, user?.id])

  useEffect(() => {
    if (extraPayment > 0) trackEvent('simulator_used', user?.id)
  }, [extraPayment, user?.id])

  useEffect(() => {
    if (hasCompletedOnboarding) trackEvent('plan_saved', user?.id)
  }, [hasCompletedOnboarding, user?.id])

  function handleDebtsChange(next: Debt[]) {
    const removedPaidOff = debts.filter((d) => d.balance > 0 && !next.some((n) => n.id === d.id)).length
    if (removedPaidOff > 0) setDebtsPaidOffCount((n) => n + removedPaidOff)

    setDebts(next)
    setPriorityOrder((order) => reconcilePriorityOrder(order, next))
    if (user && !hydratingRef.current) {
      const before = cloudDebtsRef.current
      cloudDebtsRef.current = next
      setSyncStatus('syncing')
      syncDebtsDiff(user.id, before, next)
        .then(() => setSyncStatus('synced'))
        .catch(() => setSyncStatus('idle'))
    }
  }

  function handleSelectStrategy(next: Strategy) {
    setStrategy(next)
    setTriedStrategies((prev) => (prev.includes(next) ? prev : [...prev, next]))
  }

  function handleBudgetChange(patch: Partial<{ monthlyIncome: number; fixedExpenses: number; extraPayment: number }>) {
    if (patch.monthlyIncome !== undefined) setMonthlyIncome(patch.monthlyIncome)
    if (patch.fixedExpenses !== undefined) setFixedExpenses(patch.fixedExpenses)
    if (patch.extraPayment !== undefined) setExtraPayment(patch.extraPayment)
    setHasEditedBudget(true)
  }

  function handleCurrencyChange(next: string) {
    setCurrency(next)
    setHasExplored(true)
  }

  function handleLanguageChange(next: Locale) {
    setLanguage(next)
    setHasExplored(true)
  }

  function handleMarkPaid(debtId: string, period: string) {
    const payment: Payment = { id: makeId(), debtId, period, paidAt: new Date().toISOString() }
    setPayments((prev) => [...prev, payment])
    if (user) insertPaymentRemote(user.id, payment).catch(() => {})
  }

  function handleSaveScenario(scenario: Scenario) {
    setScenarios((prev) => [...prev, scenario])
    if (user) insertScenarioRemote(user.id, scenario).catch(() => {})
    trackEvent('scenario_saved', user?.id)
  }

  function handleApplyScenario(scenario: Scenario) {
    setExtraPayment(scenario.extraPayment)
    handleSelectStrategy(scenario.strategy)
    setPriorityOrder(reconcilePriorityOrder(scenario.priorityOrder, debts))
  }

  function handleDeleteScenario(id: string) {
    setScenarios((prev) => prev.filter((s) => s.id !== id))
    if (user) deleteScenarioRemote(user.id, id).catch(() => {})
  }

  async function handleSignOut() {
    await authSignOut()
    cloudDebtsRef.current = []
    setSyncStatus('idle')
  }

  function resetAll() {
    if (!confirm(t.app.confirmReset)) return
    handleDebtsChange([])
    setMonthlyIncome(DEFAULTS.monthlyIncome)
    setFixedExpenses(DEFAULTS.fixedExpenses)
    setExtraPayment(DEFAULTS.extraPayment)
    setStrategy(DEFAULTS.strategy)
    setPriorityOrder([])
    setHasCompletedOnboarding(false)
    setPlanBaseline(null)
    for (const p of payments) if (user) deletePaymentRemote(user.id, p.id).catch(() => {})
    setPayments([])
  }

  function handleOnboardingComplete(result: OnboardingResult) {
    setMonthlyIncome(result.monthlyIncome)
    setFixedExpenses(result.fixedExpenses)
    setExtraPayment(result.extraPayment)
    handleSelectStrategy(result.strategy)
    handleDebtsChange(result.debts)
    setHasEditedBudget(true)
    setHasCompletedOnboarding(true)
  }

  const achievementSignals: AchievementSignals = {
    debtCount: debts.length,
    hasEditedBudget,
    triedStrategies,
    paymentCount: payments.length,
    debtsPaidOffCount,
    hasExplored,
    hasDownloadedReport,
    isSignedIn: Boolean(user),
    scenarioCount: scenarios.length,
  }

  const showOnboarding = !authLoading && !hasCompletedOnboarding && debts.length === 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <Confetti trigger={confettiTrigger} />
      {showAuthModal && <AuthModal t={t} onClose={() => setShowAuthModal(false)} />}
      {showEducation && <EducationCenter t={t} onClose={() => setShowEducation(false)} />}
      {showPricing && (
        <PricingModal
          t={t}
          locale={dateLocale}
          currency={currency}
          hasJoined={hasJoinedPlusWaitlist}
          onJoined={() => setHasJoinedPlusWaitlist(true)}
          onClose={() => setShowPricing(false)}
        />
      )}

      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-sky-500 text-sm font-bold text-white">
              CP
            </span>
            <span className="text-lg font-semibold tracking-tight">ClearPath</span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <LanguageSelector value={language} onChange={handleLanguageChange} t={t} />
            <CurrencySelector value={currency} onChange={handleCurrencyChange} t={t} compact />
            <button
              onClick={() => setShowPricing(true)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 transition hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
            >
              <Sparkles size={13} /> {t.plus.badge}
            </button>
            <MoreMenu t={t} onLearn={() => setShowEducation(true)} onStartOver={showOnboarding ? undefined : resetAll} />
            {isCloudConfigured && (
              <AccountMenu
                user={user}
                syncStatus={syncStatus}
                t={t}
                onSignIn={() => setShowAuthModal(true)}
                onSignOut={handleSignOut}
              />
            )}
            <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
          </div>
        </div>
      </header>

      {showOnboarding ? (
        <OnboardingWizard
          currency={currency}
          locale={dateLocale}
          t={t}
          onComplete={handleOnboardingComplete}
          onSkip={() => setHasCompletedOnboarding(true)}
          onRequestAuth={() => setShowAuthModal(true)}
          onStart={() => trackEvent('plan_started', user?.id)}
        />
      ) : (
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {debts.length === 0 && (
            <div className="mb-8 animate-rise">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.app.title}</h1>
              <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">{t.app.subtitle}</p>
            </div>
          )}

          {debts.length > 0 && (
            <div className="mb-6 space-y-6">
              <DebtFreeHero debts={debts} payments={payments} result={selected} currency={currency} locale={dateLocale} t={t} />
              {planBaseline && (
                <MonthlyCheckIn
                  debts={debts}
                  baseline={planBaseline}
                  liveResult={selected}
                  currency={currency}
                  locale={dateLocale}
                  t={t}
                  onResetBaseline={handleResetBaseline}
                />
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-2">
              <BudgetPanel
                monthlyIncome={monthlyIncome}
                fixedExpenses={fixedExpenses}
                extraPayment={extraPayment}
                totalMinPayment={minPayment}
                currency={currency}
                locale={dateLocale}
                t={t}
                onChange={handleBudgetChange}
              />
              <DebtsPanel
                debts={debts}
                currency={currency}
                locale={dateLocale}
                t={t}
                onChange={handleDebtsChange}
                onLoadSample={() => handleDebtsChange(SAMPLE_DEBTS.map((d) => ({ ...d, id: makeId() })))}
              />
              {debts.length > 0 && (
                <Affordability
                  monthlyIncome={monthlyIncome}
                  fixedExpenses={fixedExpenses}
                  totalMinPayment={minPayment}
                  currency={currency}
                  locale={dateLocale}
                  t={t}
                />
              )}
              <Reminders debts={debts} payments={payments} t={t} onMarkPaid={handleMarkPaid} />
              {debts.some((d) => d.dueDay) && <PayoffCalendar debts={debts} t={t} locale={dateLocale} />}
            </div>

            <div className="space-y-6 lg:col-span-3">
              {debts.length > 0 ? (
                <>
                  <Recommendation avalanche={avalanche} snowball={snowball} currency={currency} locale={dateLocale} t={t} />
                  <Simulator
                    extraPayment={extraPayment}
                    onExtraPaymentChange={(v) => handleBudgetChange({ extraPayment: v })}
                    sliderMax={simulatorSliderMax}
                    selected={selected}
                    baseline={baseline}
                    currency={currency}
                    locale={dateLocale}
                    t={t}
                  />
                  <StrategyPicker
                    strategy={strategy}
                    onSelect={handleSelectStrategy}
                    avalanche={avalanche}
                    snowball={snowball}
                    custom={custom}
                    currency={currency}
                    locale={dateLocale}
                    t={t}
                  />
                  {strategy === 'custom' && (
                    <PriorityList debts={debts} order={custom.order} onReorder={setPriorityOrder} t={t} />
                  )}
                  <SummaryCards result={selected} baseline={baseline} currency={currency} locale={dateLocale} t={t} />
                  <Suspense
                    fallback={
                      <div className="flex h-72 items-center justify-center rounded-2xl border border-slate-200 text-sm text-slate-400 dark:border-slate-800">
                        Loading chart…
                      </div>
                    }
                  >
                    <PayoffChart
                      avalanche={avalanche}
                      snowball={snowball}
                      custom={custom}
                      strategy={strategy}
                      currency={currency}
                      locale={dateLocale}
                      t={t}
                    />
                  </Suspense>
                  <Milestones
                    debts={debts}
                    result={selected}
                    originalTotal={debts.reduce((sum, d) => sum + d.balance, 0)}
                    strategy={strategy}
                    currency={currency}
                    locale={dateLocale}
                    t={t}
                    onCelebrate={() => setConfettiTrigger((n) => n + 1)}
                    onExport={() => setHasDownloadedReport(true)}
                  />
                  <ScenarioManager
                    debts={debts}
                    scenarios={scenarios}
                    currentExtraPayment={extraPayment}
                    currentStrategy={strategy}
                    currentPriorityOrder={priorityOrder}
                    currency={currency}
                    locale={dateLocale}
                    t={t}
                    onSave={handleSaveScenario}
                    onApply={handleApplyScenario}
                    onDelete={handleDeleteScenario}
                  />
                  <AssumptionsPanel t={t} />
                </>
              ) : (
                <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
                  <div>
                    <p className="text-lg font-medium text-slate-600 dark:text-slate-300">{t.app.emptyTitle}</p>
                    <p className="mt-1 text-sm text-slate-400">{t.app.emptySubtitle}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <AchievementBadges signals={achievementSignals} t={t} />
          </div>
        </main>
      )}

      <footer className="mt-12 border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
        {t.app.footer}
      </footer>
    </div>
  )
}
