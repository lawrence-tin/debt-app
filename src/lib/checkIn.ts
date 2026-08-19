import { totalBalance, type Debt, type PayoffResult } from './payoff'

/**
 * A frozen snapshot of "the plan you started with" — captured once, the first time a
 * user has a feasible plan, and never silently rewritten as they edit debts or budget
 * afterwards. Everything the monthly check-in reports ("ahead of plan", "your debt-free
 * date moved forward") is measured against this fixed reference point.
 */
export interface PlanBaseline {
  startedAt: string // ISO date
  totalBalance: number
  /** ISO date of the projected payoff at capture time, or '' if the plan wasn't feasible. */
  debtFreeDate: string
  /** Projected total balance at each month index (0 = start) from the baseline simulation. */
  monthlyBalances: number[]
}

// 30 years of months is far beyond any realistic payoff horizon; keeps the stored
// baseline small regardless of the engine's 600-month safety cap.
const HISTORY_CAP = 360

export function captureBaseline(result: PayoffResult, now: Date = new Date()): PlanBaseline {
  return {
    startedAt: now.toISOString(),
    totalBalance: result.history[0]?.totalBalance ?? 0,
    debtFreeDate: result.feasible ? result.payoffDate.toISOString() : '',
    monthlyBalances: result.history.slice(0, HISTORY_CAP + 1).map((h) => h.totalBalance),
  }
}

export type CheckInStatus = 'ahead' | 'on-track' | 'behind' | 'debt-free' | 'too-soon'

export interface CheckIn {
  status: CheckInStatus
  startedAt: Date
  monthsElapsed: number
  actualReduced: number
  /** actualReduced minus what the frozen baseline plan expected to have reduced by now. */
  differenceAmount: number
  /** Months the live projected debt-free date has shifted vs the baseline's. Negative = earlier/better. */
  dateShiftMonths: number
  baselineDebtFreeDate: Date | null
  liveDebtFreeDate: Date | null
}

function monthsBetween(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
}

export function computeCheckIn(baseline: PlanBaseline, debts: Debt[], liveResult: PayoffResult, now: Date = new Date()): CheckIn {
  const startedAt = new Date(baseline.startedAt)
  const monthsElapsed = Math.max(0, monthsBetween(startedAt, now))
  const currentBalance = totalBalance(debts)
  const actualReduced = baseline.totalBalance - currentBalance

  const expectedIndex = Math.min(monthsElapsed, baseline.monthlyBalances.length - 1)
  const expectedBalance = baseline.monthlyBalances[expectedIndex] ?? baseline.totalBalance
  const expectedReduced = baseline.totalBalance - expectedBalance
  const differenceAmount = actualReduced - expectedReduced

  const baselineDebtFreeDate = baseline.debtFreeDate ? new Date(baseline.debtFreeDate) : null
  const liveDebtFreeDate = liveResult.feasible ? liveResult.payoffDate : null
  const dateShiftMonths =
    baselineDebtFreeDate && liveDebtFreeDate ? monthsBetween(baselineDebtFreeDate, liveDebtFreeDate) : 0

  // A small dead-zone avoids "ahead by R3" noise from rounding reading as a false signal.
  const deadZone = Math.max(baseline.totalBalance * 0.005, 5)

  let status: CheckInStatus
  if (debts.length > 0 && currentBalance <= 0.005) status = 'debt-free'
  else if (monthsElapsed === 0) status = 'too-soon'
  else if (differenceAmount > deadZone) status = 'ahead'
  else if (differenceAmount < -deadZone) status = 'behind'
  else status = 'on-track'

  return {
    status,
    startedAt,
    monthsElapsed,
    actualReduced,
    differenceAmount,
    dateShiftMonths,
    baselineDebtFreeDate,
    liveDebtFreeDate,
  }
}
