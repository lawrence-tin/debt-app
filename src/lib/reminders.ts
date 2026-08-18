import type { Debt } from './payoff'

export interface Payment {
  id: string
  debtId: string
  /** Billing period this payment covers, as 'YYYY-MM'. */
  period: string
  paidAt: string
}

export interface DueReminder {
  debt: Debt
  dueDate: Date
  period: string
  /** Negative = overdue by that many days, 0 = due today, positive = due in that many days. */
  daysUntilDue: number
  overdue: boolean
}

export function periodKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function clampToMonth(year: number, month: number, day: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return new Date(year, month, Math.min(day, lastDay))
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function isPaidForPeriod(payments: Payment[], debtId: string, period: string): boolean {
  return payments.some((p) => p.debtId === debtId && p.period === period)
}

/**
 * Builds one reminder per debt with a due day, resolving whether the current billing
 * cycle is still open (upcoming/overdue) or already paid (in which case the next
 * cycle's date is shown instead).
 */
export function buildReminders(debts: Debt[], payments: Payment[], from: Date = new Date()): DueReminder[] {
  const today = startOfDay(from)

  return debts
    .filter((d): d is Debt & { dueDay: number } => Boolean(d.dueDay) && d.balance > 0)
    .map((debt) => {
      const thisCycleDue = clampToMonth(today.getFullYear(), today.getMonth(), debt.dueDay)
      const thisCyclePeriod = periodKey(thisCycleDue)
      const cycleIsOpen = thisCycleDue <= today

      let dueDate = thisCycleDue
      let period = thisCyclePeriod

      if (!cycleIsOpen || isPaidForPeriod(payments, debt.id, thisCyclePeriod)) {
        // Either this month's due date hasn't arrived yet, or it has and was already
        // paid — either way the next actionable date is next month's cycle, unless
        // this month's is still both open and unpaid (handled by the branch below).
        if (isPaidForPeriod(payments, debt.id, thisCyclePeriod)) {
          const next = clampToMonth(today.getFullYear(), today.getMonth() + 1, debt.dueDay)
          dueDate = next
          period = periodKey(next)
        }
      }

      const daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / 86_400_000)
      return { debt, dueDate, period, daysUntilDue, overdue: daysUntilDue < 0 }
    })
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
}
