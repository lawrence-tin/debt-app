import { CalendarCheck, PiggyBank, Receipt, TrendingDown } from 'lucide-react'
import StatCard from './StatCard'
import { formatCurrency, formatMonthsAsYears, type PayoffResult } from '../lib/payoff'

interface Props {
  result: PayoffResult
  baseline: PayoffResult
  currency: string
}

export default function SummaryCards({ result, baseline, currency }: Props) {
  const interestSaved = Math.max(0, baseline.totalInterestPaid - result.totalInterestPaid)
  const monthsSaved = Math.max(0, baseline.months - result.months)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Debt-free date"
        value={
          result.feasible
            ? result.payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : '—'
        }
        hint={result.feasible ? formatMonthsAsYears(result.months) + ' from now' : 'Increase your budget'}
        icon={<CalendarCheck size={16} />}
        accent="emerald"
      />
      <StatCard
        label="Total interest paid"
        value={result.feasible ? formatCurrency(result.totalInterestPaid, currency) : '—'}
        icon={<Receipt size={16} />}
        accent="rose"
      />
      <StatCard
        label="Interest saved by paying extra"
        value={result.feasible ? formatCurrency(interestSaved, currency) : '—'}
        hint="vs. paying only the minimums"
        icon={<PiggyBank size={16} />}
        accent="sky"
      />
      <StatCard
        label="Time saved"
        value={result.feasible ? formatMonthsAsYears(monthsSaved) : '—'}
        hint="vs. paying only the minimums"
        icon={<TrendingDown size={16} />}
        accent="amber"
      />
    </div>
  )
}
