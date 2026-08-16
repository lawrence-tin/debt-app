import { PartyPopper } from 'lucide-react'
import { CATEGORY_META, formatMonthsAsYears, monthAtProgress, type Debt, type PayoffResult } from '../lib/payoff'

interface Props {
  debts: Debt[]
  result: PayoffResult
  originalTotal: number
  onCelebrate: () => void
}

const CHECKPOINTS = [0.25, 0.5, 0.75, 1]

export default function Milestones({ debts, result, originalTotal, onCelebrate }: Props) {
  const payoffOrder = [...debts]
    .filter((d) => result.debtPayoffMonth[d.id] !== undefined)
    .sort((a, b) => result.debtPayoffMonth[a.id] - result.debtPayoffMonth[b.id])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Milestones on the way to $0</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CHECKPOINTS.map((fraction) => {
          const month = monthAtProgress(result, originalTotal, fraction)
          const reached = month !== null
          return (
            <div
              key={fraction}
              className={`rounded-xl border p-3 text-center ${
                reached
                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-500/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <p className="text-xl font-bold text-slate-900 dark:text-white">{fraction * 100}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {reached ? formatMonthsAsYears(month!) : '—'}
              </p>
            </div>
          )
        })}
      </div>

      {payoffOrder.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Payoff order</h3>
          <ol className="space-y-2">
            {payoffOrder.map((d, i) => (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {i + 1}
                </span>
                <span>{CATEGORY_META[d.category].emoji}</span>
                <span className="flex-1 font-medium text-slate-800 dark:text-slate-100">{d.name}</span>
                <span className="text-slate-500 dark:text-slate-400">
                  cleared in {formatMonthsAsYears(result.debtPayoffMonth[d.id])}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {result.feasible && result.months > 0 && (
        <button
          onClick={onCelebrate}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          <PartyPopper size={16} /> Celebrate future debt-free you
        </button>
      )}
    </section>
  )
}
