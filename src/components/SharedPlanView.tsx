import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import SummaryCards from './SummaryCards'
import DebtsList from './DebtsList'
import {
  fetchCloudDebts,
  fetchCloudSettings,
  fetchCloudPayments,
  insertPaymentRemote,
  syncDebtsDiff,
  type CloudSettings,
} from '../lib/cloud'
import { applyPayment, makeId, simulatePayoff, totalMinPayment, type Debt } from '../lib/payoff'
import { periodKey, type Payment } from '../lib/reminders'
import type { Translation } from '../lib/i18n'

interface Props {
  t: Translation
  /** The viewer's own date-formatting locale (e.g. from LANGUAGE_META) — dates/currency
   *  here should match whoever's looking at the screen, not the plan owner's preferences. */
  locale: string
  ownerId: string
  ownerEmail: string
  onBack: () => void
}

/**
 * A self-contained read/manage view for a shared plan — deliberately its own component with
 * its own local state, rather than repointing the main App's state at a different user_id.
 * The main app's hydration effect has real "push whatever's in this browser up" logic on
 * first load (see App.tsx), which must never run against someone else's account; keeping
 * this fully separate makes that impossible by construction rather than by careful gating.
 */
export default function SharedPlanView({ t, locale, ownerId, ownerEmail, onBack }: Props) {
  const [loading, setLoading] = useState(true)
  const [debts, setDebts] = useState<Debt[]>([])
  const [settings, setSettings] = useState<CloudSettings | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([fetchCloudDebts(ownerId), fetchCloudSettings(ownerId), fetchCloudPayments(ownerId)]).then(
      ([cloudDebts, cloudSettings, cloudPayments]) => {
        if (cancelled) return
        setDebts(cloudDebts)
        setSettings(cloudSettings)
        setPayments(cloudPayments)
        setLoading(false)
      },
    )
    return () => {
      cancelled = true
    }
  }, [ownerId])

  const currency = settings?.currency ?? 'ZAR'
  const strategy = settings?.strategy ?? 'avalanche'
  const priorityOrder = useMemo(() => settings?.priorityOrder ?? [], [settings?.priorityOrder])
  const budget = totalMinPayment(debts) + (settings?.extraPayment ?? 0)

  const selected = useMemo(
    () => simulatePayoff(debts, strategy, budget, new Date(), priorityOrder),
    [debts, strategy, budget, priorityOrder],
  )
  const baseline = useMemo(
    () => simulatePayoff(debts, strategy, totalMinPayment(debts), new Date(), priorityOrder),
    [debts, strategy, priorityOrder],
  )

  function handleDebtsChange(next: Debt[]) {
    const before = debts
    setDebts(next)
    syncDebtsDiff(ownerId, before, next).catch(() => {
      // Best-effort, same as the main app's own sync — a failed push here doesn't lose the
      // local edit, it just won't have round-tripped to the owner's account yet.
    })
  }

  function handleLogPayment(debtId: string, amount: number) {
    if (!(amount > 0)) return
    const debt = debts.find((d) => d.id === debtId)
    if (!debt) return
    const period = periodKey(new Date())
    const accrueInterest = !payments.some((p) => p.debtId === debtId && p.period === period)
    const newBalance = applyPayment(debt, amount, accrueInterest)
    handleDebtsChange(debts.map((d) => (d.id === debtId ? { ...d, balance: newBalance } : d)))

    const payment: Payment = { id: makeId(), debtId, amount, period, paidAt: new Date().toISOString() }
    setPayments((prev) => [...prev, payment])
    insertPaymentRemote(ownerId, payment).catch(() => {})
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft size={15} /> {t.sharedPlan.backButton}
        </button>
        <h1 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">{t.sharedPlan.viewTitle(ownerEmail)}</h1>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">{t.sharedPlan.loadingPlan}</span>
          </div>
        ) : debts.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">{t.sharedPlan.emptyDebts}</p>
        ) : (
          <div className="space-y-6">
            <SummaryCards result={selected} baseline={baseline} currency={currency} locale={locale} t={t} />
            <DebtsList debts={debts} currency={currency} locale={locale} t={t} onChange={handleDebtsChange} onLogPayment={handleLogPayment} />
          </div>
        )}
      </div>
    </div>
  )
}
