import type { Debt } from './payoff'

export interface DueReminder {
  debt: Debt
  /** 0 = due today, otherwise days until the next due date (always the next upcoming occurrence). */
  daysUntilDue: number
  dueDate: Date
}

/**
 * Resolves the next occurrence of `dueDay` (1-31) on/after `from`. Days beyond a given
 * month's length (e.g. 31 in February) clamp to that month's last day.
 */
export function nextDueDate(dueDay: number, from: Date = new Date()): Date {
  const clampToMonth = (year: number, month: number) => {
    const lastDay = new Date(year, month + 1, 0).getDate()
    return new Date(year, month, Math.min(dueDay, lastDay))
  }

  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  let candidate = clampToMonth(today.getFullYear(), today.getMonth())
  if (candidate < today) {
    candidate = clampToMonth(today.getFullYear(), today.getMonth() + 1)
  }
  return candidate
}

/** Builds a due-date reminder for every debt that has `dueDay` set, soonest first. */
export function buildReminders(debts: Debt[], from: Date = new Date()): DueReminder[] {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  return debts
    .filter((d): d is Debt & { dueDay: number } => Boolean(d.dueDay) && d.balance > 0)
    .map((debt) => {
      const dueDate = nextDueDate(debt.dueDay, from)
      const daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / 86_400_000)
      return { debt, daysUntilDue, dueDate }
    })
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
}
