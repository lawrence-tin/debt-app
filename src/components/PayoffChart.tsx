import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency, type PayoffResult, type Strategy } from '../lib/payoff'
import type { Translation } from '../lib/i18n'

interface Props {
  avalanche: PayoffResult
  snowball: PayoffResult
  strategy: Strategy
  currency: string
  locale: string
  t: Translation
}

export default function PayoffChart({ avalanche, snowball, strategy, currency, locale, t }: Props) {
  const maxMonth = Math.max(avalanche.history.at(-1)?.month ?? 0, snowball.history.at(-1)?.month ?? 0)

  const data = Array.from({ length: maxMonth + 1 }, (_, month) => {
    const a = avalanche.history.find((h) => h.month === month)
    const s = snowball.history.find((h) => h.month === month)
    const lastA = [...avalanche.history].reverse().find((h) => h.month <= month)
    const lastS = [...snowball.history].reverse().find((h) => h.month <= month)
    return {
      month,
      avalanche: a?.totalBalance ?? lastA?.totalBalance ?? 0,
      snowball: s?.totalBalance ?? lastS?.totalBalance ?? 0,
    }
  })

  const avalancheLabel = t.strategyName.avalanche
  const snowballLabel = t.strategyName.snowball

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">{t.chart.heading}</h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        {t.chart.subheading(strategy === 'avalanche' ? avalancheLabel : snowballLabel)}
      </p>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="fillAvalanche" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillSnowball" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <XAxis
              dataKey="month"
              tickFormatter={(m) => t.chart.monthTick(m)}
              stroke="currentColor"
              className="text-xs text-slate-400"
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatCurrency(v, currency, locale)}
              stroke="currentColor"
              className="text-xs text-slate-400"
              tickLine={false}
              width={70}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(Number(value) || 0, currency, locale),
                name === 'avalanche' ? avalancheLabel : snowballLabel,
              ]}
              labelFormatter={(m) => t.chart.monthLabel(Number(m) || 0)}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
            />
            <Legend
              formatter={(value) => (value === 'avalanche' ? avalancheLabel : snowballLabel)}
              wrapperStyle={{ fontSize: 13 }}
            />
            <Area
              type="monotone"
              dataKey="avalanche"
              stroke="#10b981"
              strokeWidth={strategy === 'avalanche' ? 2.5 : 1.5}
              strokeOpacity={strategy === 'avalanche' ? 1 : 0.5}
              fill="url(#fillAvalanche)"
            />
            <Area
              type="monotone"
              dataKey="snowball"
              stroke="#0ea5e9"
              strokeWidth={strategy === 'snowball' ? 2.5 : 1.5}
              strokeOpacity={strategy === 'snowball' ? 1 : 0.5}
              fill="url(#fillSnowball)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
