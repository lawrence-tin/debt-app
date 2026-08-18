import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency, type PayoffResult, type Strategy } from '../lib/payoff'
import type { Translation } from '../lib/i18n'

interface Props {
  avalanche: PayoffResult
  snowball: PayoffResult
  custom: PayoffResult
  strategy: Strategy
  currency: string
  locale: string
  t: Translation
}

const SERIES_COLOR: Record<Strategy, string> = {
  avalanche: '#10b981',
  snowball: '#0ea5e9',
  custom: '#a855f7',
}

export default function PayoffChart({ avalanche, snowball, custom, strategy, currency, locale, t }: Props) {
  const results: Record<Strategy, PayoffResult> = { avalanche, snowball, custom }
  const maxMonth = Math.max(...Object.values(results).map((r) => r.history.at(-1)?.month ?? 0))

  const data = Array.from({ length: maxMonth + 1 }, (_, month) => {
    const point: { month: number } & Partial<Record<Strategy, number>> = { month }
    for (const key of Object.keys(results) as Strategy[]) {
      const snap = results[key].history.find((h) => h.month === month)
      const last = [...results[key].history].reverse().find((h) => h.month <= month)
      point[key] = snap?.totalBalance ?? last?.totalBalance ?? 0
    }
    return point
  })

  const label = (s: Strategy) => t.strategyName[s]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">{t.chart.heading}</h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t.chart.subheading(label(strategy))}</p>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <defs>
              {(Object.keys(results) as Strategy[]).map((key) => (
                <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SERIES_COLOR[key]} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={SERIES_COLOR[key]} stopOpacity={0} />
                </linearGradient>
              ))}
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
              formatter={(value, name) => [formatCurrency(Number(value) || 0, currency, locale), label(name as Strategy)]}
              labelFormatter={(m) => t.chart.monthLabel(Number(m) || 0)}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
            />
            <Legend formatter={(value) => label(value as Strategy)} wrapperStyle={{ fontSize: 13 }} />
            {(Object.keys(results) as Strategy[]).map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={SERIES_COLOR[key]}
                strokeWidth={strategy === key ? 2.5 : 1.5}
                strokeOpacity={strategy === key ? 1 : 0.4}
                fill={`url(#fill-${key})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
