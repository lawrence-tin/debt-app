import { CalendarHeart } from 'lucide-react'
import { formatCurrency, realProgress, type Debt, type PayoffResult } from '../lib/payoff'
import { formatMonthsAsYears, type Translation } from '../lib/i18n'
import { monthlyPaymentCount, type Payment } from '../lib/reminders'

interface Props {
  debts: Debt[]
  payments: Payment[]
  result: PayoffResult
  currency: string
  locale: string
  t: Translation
}

export default function DebtFreeHero({ debts, payments, result, currency, locale, t }: Props) {
  const progress = realProgress(debts)
  const remaining = debts.reduce((sum, d) => sum + d.balance, 0)
  const { target, paid } = monthlyPaymentCount(debts, payments)

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-500 via-emerald-500 to-sky-500 p-7 text-white shadow-sm dark:border-slate-800">
      <div className="flex items-center gap-2 text-emerald-50">
        <CalendarHeart size={18} />
        <span className="text-sm font-medium uppercase tracking-wide">{t.summary.debtFreeDate}</span>
      </div>
      <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        {result.feasible ? result.payoffDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' }) : '—'}
      </p>
      <p className="mt-1 text-sm text-emerald-50">
        {result.feasible ? t.summary.fromNow(formatMonthsAsYears(result.months, t)) : t.summary.increaseBudget}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/20 pt-5 sm:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-50">{t.hero.debtRemaining}</p>
          <p className="mt-1 text-lg font-semibold">{formatCurrency(remaining, currency, locale)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-50">{t.hero.progress(progress.percent)}</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, progress.percent)}%` }} />
          </div>
        </div>
        {target > 0 && (
          <>
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-50">{t.hero.paymentTarget}</p>
              <p className="mt-1 text-lg font-semibold">{target}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-50">{t.hero.paidThisMonth}</p>
              <p className="mt-1 text-lg font-semibold">
                {paid} / {target}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
