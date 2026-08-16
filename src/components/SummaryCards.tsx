import { CalendarCheck, PiggyBank, Receipt, TrendingDown } from 'lucide-react'
import StatCard from './StatCard'
import { formatCurrency, type PayoffResult } from '../lib/payoff'
import { formatMonthsAsYears, type Translation } from '../lib/i18n'

interface Props {
  result: PayoffResult
  baseline: PayoffResult
  currency: string
  locale: string
  t: Translation
}

export default function SummaryCards({ result, baseline, currency, locale, t }: Props) {
  const interestSaved = Math.max(0, baseline.totalInterestPaid - result.totalInterestPaid)
  const monthsSaved = Math.max(0, baseline.months - result.months)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label={t.summary.debtFreeDate}
        value={
          result.feasible ? result.payoffDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' }) : '—'
        }
        hint={result.feasible ? t.summary.fromNow(formatMonthsAsYears(result.months, t)) : t.summary.increaseBudget}
        icon={<CalendarCheck size={16} />}
        accent="emerald"
      />
      <StatCard
        label={t.summary.totalInterest}
        value={result.feasible ? formatCurrency(result.totalInterestPaid, currency, locale) : '—'}
        icon={<Receipt size={16} />}
        accent="rose"
      />
      <StatCard
        label={t.summary.interestSaved}
        value={result.feasible ? formatCurrency(interestSaved, currency, locale) : '—'}
        hint={t.summary.vsMinimums}
        icon={<PiggyBank size={16} />}
        accent="sky"
      />
      <StatCard
        label={t.summary.timeSaved}
        value={result.feasible ? formatMonthsAsYears(monthsSaved, t) : '—'}
        hint={t.summary.vsMinimums}
        icon={<TrendingDown size={16} />}
        accent="amber"
      />
    </div>
  )
}
