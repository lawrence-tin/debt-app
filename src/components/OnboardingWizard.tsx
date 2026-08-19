import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Calculator, Lock, PartyPopper } from 'lucide-react'
import DebtsPanel from './DebtsPanel'
import StrategyPicker from './StrategyPicker'
import Simulator from './Simulator'
import {
  formatCurrency,
  makeId,
  simulatePayoff,
  totalBalance,
  totalMinPayment,
  type Debt,
  type Strategy,
} from '../lib/payoff'
import { formatMonthsAsYears, type Translation } from '../lib/i18n'
import { getCurrencySymbol } from '../lib/currencies'
import { SAMPLE_DEBTS } from '../lib/storage'

type Step = 'welcome' | 'income' | 'expenses' | 'debts' | 'calculating' | 'reveal' | 'compare' | 'optimize' | 'commit'

const STEPS: Step[] = ['welcome', 'income', 'expenses', 'debts', 'calculating', 'reveal', 'compare', 'optimize', 'commit']

export interface OnboardingResult {
  monthlyIncome: number
  fixedExpenses: number
  extraPayment: number
  debts: Debt[]
  strategy: Strategy
}

interface Props {
  currency: string
  locale: string
  t: Translation
  onComplete: (result: OnboardingResult) => void
  onSkip: () => void
  onRequestAuth: () => void
}

export default function OnboardingWizard({ currency, locale, t, onComplete, onSkip, onRequestAuth }: Props) {
  const [step, setStep] = useState<Step>('welcome')
  const [income, setIncome] = useState('')
  const [expenses, setExpenses] = useState('')
  const [debts, setDebts] = useState<Debt[]>([])
  const [strategy, setStrategy] = useState<Strategy>('avalanche')
  const [extraPayment, setExtraPayment] = useState(0)
  const symbol = getCurrencySymbol(currency)

  const monthlyIncome = Number(income) || 0
  const fixedExpenses = Number(expenses) || 0
  const minPayment = totalMinPayment(debts)
  const budget = minPayment + extraPayment

  const avalanche = useMemo(() => simulatePayoff(debts, 'avalanche', budget), [debts, budget])
  const snowball = useMemo(() => simulatePayoff(debts, 'snowball', budget), [debts, budget])
  const custom = useMemo(() => simulatePayoff(debts, 'custom', budget), [debts, budget])
  const baseline = useMemo(() => simulatePayoff(debts, strategy, minPayment), [debts, strategy, minPayment])
  const results: Record<Strategy, ReturnType<typeof simulatePayoff>> = { avalanche, snowball, custom }
  const selected = results[strategy]

  const sliderMax = Math.max(500, Math.round((monthlyIncome - fixedExpenses - minPayment) / 10) * 10 || 500)

  // Auto-advance the brief "calculating" beat.
  useEffect(() => {
    if (step !== 'calculating') return
    const timer = setTimeout(() => setStep('reveal'), 1300)
    return () => clearTimeout(timer)
  }, [step])

  const stepIndex = STEPS.indexOf(step)

  function goBack() {
    const prevIndex = Math.max(0, stepIndex - 1)
    setStep(STEPS[prevIndex] === 'calculating' ? STEPS[Math.max(0, prevIndex - 1)] : STEPS[prevIndex])
  }

  function commit() {
    onComplete({ monthlyIncome, fixedExpenses, extraPayment, debts, strategy })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {step !== 'welcome' && step !== 'calculating' && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-400">
            <span>{t.onboarding.stepOf(stepIndex, STEPS.length - 2)}</span>
            <button onClick={onSkip} className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600 dark:hover:text-slate-300">
              {t.onboarding.skipToDashboard}
            </button>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 transition-all"
              style={{ width: `${(stepIndex / (STEPS.length - 2)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {step === 'welcome' && (
        <div className="animate-rise text-center">
          <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 text-2xl font-bold text-white">
            CP
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            {t.onboarding.welcomeTitle}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-slate-500 dark:text-slate-400">{t.onboarding.welcomeSubtitle}</p>
          <div className="mx-auto mt-5 flex max-w-sm items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
            <Lock size={14} className="mt-0.5 shrink-0 text-slate-400" />
            <p>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{t.privacy.title}</span> {t.privacy.message}
            </p>
          </div>
          <button
            onClick={() => setStep('income')}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            {t.onboarding.getStarted} <ArrowRight size={16} />
          </button>
          <div>
            <button
              onClick={onSkip}
              className="mt-4 text-xs text-slate-400 underline decoration-slate-300 underline-offset-2 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {t.onboarding.skipToDashboard}
            </button>
          </div>
        </div>
      )}

      {step === 'income' && (
        <StepCard title={t.onboarding.incomeTitle} subtitle={t.onboarding.incomeSubtitle}>
          <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-lg focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800">
            <span className="mr-2 text-slate-400">{symbol}</span>
            <input
              type="number"
              autoFocus
              min={0}
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder={t.budget.monthlyIncomePlaceholder}
              className="w-full bg-transparent text-slate-900 outline-none dark:text-white"
            />
          </div>
          <WizardNav onBack={goBack} onNext={() => setStep('expenses')} nextDisabled={!(monthlyIncome > 0)} t={t} />
        </StepCard>
      )}

      {step === 'expenses' && (
        <StepCard title={t.onboarding.expensesTitle} subtitle={t.onboarding.expensesSubtitle}>
          <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-lg focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800">
            <span className="mr-2 text-slate-400">{symbol}</span>
            <input
              type="number"
              autoFocus
              min={0}
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
              placeholder={t.budget.otherExpensesPlaceholder}
              className="w-full bg-transparent text-slate-900 outline-none dark:text-white"
            />
          </div>
          <WizardNav onBack={goBack} onNext={() => setStep('debts')} t={t} />
        </StepCard>
      )}

      {step === 'debts' && (
        <div className="animate-rise">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.onboarding.debtsTitle}</h2>
          <p className="mt-1 mb-5 text-slate-500 dark:text-slate-400">{t.onboarding.debtsSubtitle}</p>
          <DebtsPanel
            debts={debts}
            currency={currency}
            locale={locale}
            t={t}
            onChange={setDebts}
            onLoadSample={() => setDebts(SAMPLE_DEBTS.map((d) => ({ ...d, id: makeId() })))}
          />
          {debts.length === 0 && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">{t.onboarding.debtsNeedOne}</p>}
          <WizardNav
            onBack={goBack}
            onNext={() => setStep('calculating')}
            nextLabel={t.onboarding.debtsContinue}
            nextDisabled={debts.length === 0}
            t={t}
          />
        </div>
      )}

      {step === 'calculating' && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Calculator size={40} className="mb-4 animate-pulse text-emerald-500" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t.onboarding.calculatingTitle}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.onboarding.calculatingSubtitle}</p>
        </div>
      )}

      {step === 'reveal' && (
        <div className="animate-rise text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            {t.onboarding.revealTitle}
          </p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            {selected.feasible ? selected.payoffDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' }) : '—'}
          </p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{t.onboarding.revealSubtitle}</p>
          <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs uppercase tracking-wide text-slate-400">{t.hero.debtRemaining}</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {formatCurrency(totalBalance(debts), currency, locale)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs uppercase tracking-wide text-slate-400">{t.summary.totalInterest}</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {selected.feasible ? formatCurrency(selected.totalInterestPaid, currency, locale) : '—'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setStep('compare')}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            {t.onboarding.revealContinue} <ArrowRight size={16} />
          </button>
        </div>
      )}

      {step === 'compare' && (
        <div className="animate-rise">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.onboarding.compareTitle}</h2>
          <p className="mt-1 mb-5 text-slate-500 dark:text-slate-400">{t.onboarding.compareSubtitle}</p>
          <StrategyPicker
            strategy={strategy}
            onSelect={setStrategy}
            avalanche={avalanche}
            snowball={snowball}
            custom={custom}
            currency={currency}
            locale={locale}
            t={t}
          />
          <WizardNav onBack={goBack} onNext={() => setStep('optimize')} t={t} />
        </div>
      )}

      {step === 'optimize' && (
        <div className="animate-rise">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.onboarding.optimizeTitle}</h2>
          <p className="mt-1 mb-5 text-slate-500 dark:text-slate-400">{t.onboarding.optimizeSubtitle}</p>
          <Simulator
            extraPayment={extraPayment}
            onExtraPaymentChange={setExtraPayment}
            sliderMax={sliderMax}
            selected={selected}
            baseline={baseline}
            currency={currency}
            locale={locale}
            t={t}
          />
          <WizardNav onBack={goBack} onNext={() => setStep('commit')} t={t} />
        </div>
      )}

      {step === 'commit' && (
        <div className="animate-rise text-center">
          <PartyPopper size={36} className="mx-auto mb-4 text-emerald-500" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.onboarding.commitTitle}</h2>
          <p className="mx-auto mt-2 max-w-sm text-slate-500 dark:text-slate-400">{t.onboarding.commitSubtitle}</p>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            {selected.feasible
              ? `${formatMonthsAsYears(selected.months, t)} · ${formatCurrency(selected.totalInterestPaid, currency, locale)}`
              : null}
          </p>
          <div className="mt-8 flex flex-col items-center gap-2">
            <button
              onClick={commit}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
            >
              {t.onboarding.goToDashboard} <ArrowRight size={16} />
            </button>
            <button
              onClick={() => {
                commit()
                onRequestAuth()
              }}
              className="text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {t.onboarding.commitAccount}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StepCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="animate-rise">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-1 mb-5 text-slate-500 dark:text-slate-400">{subtitle}</p>
      {children}
    </div>
  )
}

function WizardNav({
  onBack,
  onNext,
  nextDisabled,
  nextLabel,
  t,
}: {
  onBack: () => void
  onNext: () => void
  nextDisabled?: boolean
  nextLabel?: string
  t: Translation
}) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft size={15} /> {t.onboarding.back}
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {nextLabel ?? t.onboarding.next} <ArrowRight size={15} />
      </button>
    </div>
  )
}
