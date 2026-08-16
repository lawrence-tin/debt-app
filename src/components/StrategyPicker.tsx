import { Flame, Snowflake } from 'lucide-react'
import { formatCurrency, formatMonthsAsYears, type PayoffResult, type Strategy } from '../lib/payoff'

interface Props {
  strategy: Strategy
  onSelect: (s: Strategy) => void
  avalanche: PayoffResult
  snowball: PayoffResult
  currency: string
}

export default function StrategyPicker({ strategy, onSelect, avalanche, snowball, currency }: Props) {
  const cheaper: Strategy = avalanche.totalInterestPaid <= snowball.totalInterestPaid ? 'avalanche' : 'snowball'
  const savings = Math.abs(avalanche.totalInterestPaid - snowball.totalInterestPaid)

  const cards: { key: Strategy; title: string; desc: string; icon: React.ReactNode; result: PayoffResult }[] = [
    {
      key: 'avalanche',
      title: 'Avalanche',
      desc: 'Highest interest rate first — mathematically the cheapest.',
      icon: <Flame size={18} />,
      result: avalanche,
    },
    {
      key: 'snowball',
      title: 'Snowball',
      desc: 'Smallest balance first — quick wins keep you motivated.',
      icon: <Snowflake size={18} />,
      result: snowball,
    },
  ]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">Choose your strategy</h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Both use every dollar of your budget — they just target debts in a different order.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map(({ key, title, desc, icon, result }) => {
          const active = strategy === key
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`relative rounded-xl border p-4 text-left transition ${
                active
                  ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
              }`}
            >
              {key === cheaper && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Saves {formatCurrency(savings, currency)}
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className={active ? 'text-emerald-500' : 'text-slate-400'}>{icon}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{title}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{desc}</p>
              {result.feasible ? (
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-slate-400">Debt-free in</dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-100">
                      {formatMonthsAsYears(result.months)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-slate-400">Interest paid</dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-100">
                      {formatCurrency(result.totalInterestPaid, currency)}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-sm font-medium text-rose-500">Budget too low to cover minimums</p>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
