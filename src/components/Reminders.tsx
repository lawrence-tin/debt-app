import { Bell, Check } from 'lucide-react'
import { CATEGORY_EMOJI, type Debt } from '../lib/payoff'
import { buildReminders, type Payment } from '../lib/reminders'
import type { Translation } from '../lib/i18n'

interface Props {
  debts: Debt[]
  payments: Payment[]
  t: Translation
  onMarkPaid: (debtId: string, period: string) => void
  /** Only show upcoming (non-overdue) debts due within this many days. */
  horizonDays?: number
}

export default function Reminders({ debts, payments, t, onMarkPaid, horizonDays = 14 }: Props) {
  const reminders = buildReminders(debts, payments).filter((r) => r.overdue || r.daysUntilDue <= horizonDays)
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
        {reminders.map(({ debt, daysUntilDue, overdue, period }) => {
          const urgent = overdue || daysUntilDue <= 3
          return (
            <li
              key={debt.id}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                overdue
                  ? 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-500/10'
                  : urgent
                    ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-500/10'
                    : 'border-slate-100 dark:border-slate-800'
              }`}
            >
              <span className="text-lg leading-none">{CATEGORY_EMOJI[debt.category]}</span>
              <span className="flex-1 truncate font-medium text-slate-800 dark:text-slate-100">{debt.name}</span>
              <span
                className={
                  overdue
                    ? 'font-semibold text-rose-600 dark:text-rose-400'
                    : urgent
                      ? 'font-semibold text-amber-600 dark:text-amber-400'
                      : 'text-slate-500 dark:text-slate-400'
                }
              >
                {overdue
                  ? t.reminders.overdueBy(Math.abs(daysUntilDue))
                  : daysUntilDue === 0
                    ? t.reminders.dueToday
                    : t.reminders.dueInDays(daysUntilDue)}
              </span>
              <button
                onClick={() => onMarkPaid(debt.id, period)}
                title={t.reminders.markPaid}
                aria-label={`${t.reminders.markPaid}: ${debt.name}`}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-xs font-medium text-slate-500 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
              >
                <Check size={12} />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
