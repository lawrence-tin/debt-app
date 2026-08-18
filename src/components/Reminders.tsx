import { Bell } from 'lucide-react'
import { CATEGORY_EMOJI, type Debt } from '../lib/payoff'
import { buildReminders } from '../lib/reminders'
import type { Translation } from '../lib/i18n'

interface Props {
  debts: Debt[]
  t: Translation
  /** Only show debts due within this many days. */
  horizonDays?: number
}

export default function Reminders({ debts, t, horizonDays = 14 }: Props) {
  const reminders = buildReminders(debts).filter((r) => r.daysUntilDue <= horizonDays)
  if (reminders.length === 0) return null

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-lg bg-amber-500/10 p-1.5 text-amber-500">
          <Bell size={18} />
        </span>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.reminders.heading}</h2>
      </div>
      <ul className="space-y-2">
        {reminders.map(({ debt, daysUntilDue }) => {
          const urgent = daysUntilDue <= 3
          return (
            <li
              key={debt.id}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                urgent
                  ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-500/10'
                  : 'border-slate-100 dark:border-slate-800'
              }`}
            >
              <span className="text-lg leading-none">{CATEGORY_EMOJI[debt.category]}</span>
              <span className="flex-1 truncate font-medium text-slate-800 dark:text-slate-100">{debt.name}</span>
              <span className={urgent ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}>
                {daysUntilDue === 0 ? t.reminders.dueToday : t.reminders.dueInDays(daysUntilDue)}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
