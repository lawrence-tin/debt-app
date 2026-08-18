import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { CATEGORY_EMOJI, type Debt } from '../lib/payoff'
import type { Translation } from '../lib/i18n'

interface Props {
  debts: Debt[]
  t: Translation
  locale: string
}

export default function PayoffCalendar({ debts, t, locale }: Props) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const today = new Date()
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = new Date(year, month, 1).getDay()

  const debtsByDay = new Map<number, Debt[]>()
  for (const d of debts) {
    if (!d.dueDay || d.balance <= 0) continue
    const day = Math.min(d.dueDay, daysInMonth)
    debtsByDay.set(day, [...(debtsByDay.get(day) ?? []), d])
  }

  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const monthLabel = cursor.toLocaleDateString(locale, { month: 'long', year: 'numeric' })

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-sky-500/10 p-1.5 text-sky-500">
            <CalendarDays size={18} />
          </span>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.calendar.heading}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            aria-label={t.calendar.prevMonth}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[9rem] text-center text-sm font-medium capitalize text-slate-700 dark:text-slate-200">
            {monthLabel}
          </span>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            aria-label={t.calendar.nextMonth}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {t.calendar.weekdays.map((wd) => (
          <div key={wd} className="pb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            {wd}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          const dayDebts = debtsByDay.get(day) ?? []
          return (
            <div
              key={day}
              className={`flex min-h-16 flex-col items-center gap-0.5 rounded-lg border p-1 text-xs ${
                isToday
                  ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10'
                  : 'border-slate-100 dark:border-slate-800'
              }`}
            >
              <span className={`text-[11px] ${isToday ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {day}
              </span>
              <div className="flex flex-wrap justify-center gap-0.5">
                {dayDebts.slice(0, 3).map((d) => (
                  <span key={d.id} title={d.name} className="leading-none">
                    {CATEGORY_EMOJI[d.category]}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
