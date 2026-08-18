import { ChevronDown, ChevronUp, ListOrdered } from 'lucide-react'
import { CATEGORY_EMOJI, type Debt } from '../lib/payoff'
import type { Translation } from '../lib/i18n'

interface Props {
  debts: Debt[]
  order: string[]
  onReorder: (order: string[]) => void
  t: Translation
}

export default function PriorityList({ debts, order, onReorder, t }: Props) {
  const byId = new Map(debts.map((d) => [d.id, d]))
  const ranked = order.map((id) => byId.get(id)).filter((d): d is Debt => Boolean(d))

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= ranked.length) return
    const next = [...ranked.map((d) => d.id)]
    ;[next[index], next[target]] = [next[target], next[index]]
    onReorder(next)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded-lg bg-violet-500/10 p-1.5 text-violet-500">
          <ListOrdered size={18} />
        </span>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.priority.heading}</h2>
      </div>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t.priority.subheading}</p>

      <ol className="space-y-2">
        {ranked.map((d, i) => (
          <li
            key={d.id}
            className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {i + 1}
            </span>
            <span className="text-lg leading-none">{CATEGORY_EMOJI[d.category]}</span>
            <span className="flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100">{d.name}</span>
            <div className="flex gap-1">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={t.priority.moveUp(d.name)}
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === ranked.length - 1}
                aria-label={t.priority.moveDown(d.name)}
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
