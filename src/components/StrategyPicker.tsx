import { Flame, Snowflake } from 'lucide-react'
import { formatCurrency, type PayoffResult, type Strategy } from '../lib/payoff'
import { formatMonthsAsYears, type Translation } from '../lib/i18n'

interface Props {
  strategy: Strategy
  onSelect: (s: Strategy) => void
  avalanche: PayoffResult
  snowball: PayoffResult
  currency: string
  locale: string
  t: Translation
}

export default function StrategyPicker({ strategy, onSelect, avalanche, snowball, currency, locale, t }: Props) {
  const cheaper: Strategy = avalanche.totalInterestPaid <= snowball.totalInterestPaid ? 'avalanche' : 'snowball'
  const savings = Math.abs(avalanche.totalInterestPaid - snowball.totalInterestPaid)

  const cards: { key: Strategy; title: string; desc: string; icon: React.ReactNode; result: PayoffResult }[] = [
    {
      key: 'avalanche',
      title: t.strategy.avalancheTitle,
      desc: t.strategy.avalancheDesc,
      icon: <Flame size={18} />,
      result: avalanche,
    },
    {
      key: 'snowball',
      title: t.strategy.snowballTitle,
      desc: t.strategy.snowballDesc,
      icon: <Snowflake size={18} />,
      result: snowball,
    },
  ]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">{t.strategy.heading}</h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t.strategy.subheading}</p>

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
                  {t.strategy.saves(formatCurrency(savings, currency, locale))}
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
                    <dt className="text-[11px] uppercase tracking-wide text-slate-400">{t.strategy.debtFreeIn}</dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-100">
                      {formatMonthsAsYears(result.months, t)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-slate-400">{t.strategy.interestPaid}</dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-100">
                      {formatCurrency(result.totalInterestPaid, currency, locale)}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-sm font-medium text-rose-500">{t.strategy.tooLow}</p>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
