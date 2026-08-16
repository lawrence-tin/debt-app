export type DebtCategory =
  | 'credit-card'
  | 'student-loan'
  | 'auto-loan'
  | 'personal-loan'
  | 'medical'
  | 'other'

export interface Debt {
  id: string
  name: string
  category: DebtCategory
  balance: number
  apr: number // annual percentage rate, e.g. 22.99
  minPayment: number
}

export type Strategy = 'avalanche' | 'snowball'

export interface MonthSnapshot {
  month: number
  totalBalance: number
  balances: Record<string, number>
}

export interface PayoffResult {
  strategy: Strategy
  feasible: boolean
  months: number
  totalInterestPaid: number
  totalPaid: number
  payoffDate: Date
  history: MonthSnapshot[]
  /** month index (1-based) each debt hits zero */
  debtPayoffMonth: Record<string, number>
  order: string[]
}

const MAX_MONTHS = 600 // 50-year safety cap

function getOrder(debts: Debt[], strategy: Strategy): string[] {
  const active = debts.filter((d) => d.balance > 0)
  const sorted =
    strategy === 'avalanche'
      ? [...active].sort((a, b) => b.apr - a.apr || a.balance - b.balance)
      : [...active].sort((a, b) => a.balance - b.balance || b.apr - a.apr)
  return sorted.map((d) => d.id)
}

export function totalMinPayment(debts: Debt[]): number {
  return debts.reduce((sum, d) => sum + d.minPayment, 0)
}

export function totalBalance(debts: Debt[]): number {
  return debts.reduce((sum, d) => sum + d.balance, 0)
}

/**
 * Simulates a month-by-month debt payoff plan.
 * `monthlyBudget` is the total amount available each month across all debts
 * (minimum payments + any extra). Extra beyond minimums cascades to debts
 * in priority order (avalanche = highest APR first, snowball = smallest
 * balance first), freeing up minimums to snowball onto the next target as
 * each debt is cleared.
 */
export function simulatePayoff(
  debts: Debt[],
  strategy: Strategy,
  monthlyBudget: number,
  startDate: Date = new Date(),
): PayoffResult {
  const order = getOrder(debts, strategy)
  const minRequired = totalMinPayment(debts)
  const feasible = debts.length === 0 || monthlyBudget >= minRequired - 0.01

  const working = debts.map((d) => ({ ...d }))
  const debtPayoffMonth: Record<string, number> = {}
  const history: MonthSnapshot[] = [
    {
      month: 0,
      totalBalance: totalBalance(working),
      balances: Object.fromEntries(working.map((d) => [d.id, d.balance])),
    },
  ]

  let month = 0
  let totalInterestPaid = 0
  let totalPaid = 0

  if (feasible) {
    while (working.some((d) => d.balance > 0.005) && month < MAX_MONTHS) {
      month++

      for (const d of working) {
        if (d.balance > 0) {
          const interest = d.balance * (d.apr / 100 / 12)
          d.balance += interest
          totalInterestPaid += interest
        }
      }

      let budgetLeft = monthlyBudget
      for (const d of working) {
        if (d.balance > 0) {
          const pay = Math.min(d.minPayment, d.balance)
          d.balance -= pay
          budgetLeft -= pay
          totalPaid += pay
        }
      }

      for (const id of order) {
        if (budgetLeft <= 0.005) break
        const d = working.find((x) => x.id === id)
        if (d && d.balance > 0.005) {
          const pay = Math.min(budgetLeft, d.balance)
          d.balance -= pay
          budgetLeft -= pay
          totalPaid += pay
        }
      }

      for (const d of working) {
        if (d.balance <= 0.005) {
          d.balance = 0
          if (debtPayoffMonth[d.id] === undefined) debtPayoffMonth[d.id] = month
        }
      }

      history.push({
        month,
        totalBalance: totalBalance(working),
        balances: Object.fromEntries(working.map((d) => [d.id, d.balance])),
      })
    }
  }

  const payoffDate = new Date(startDate)
  payoffDate.setMonth(payoffDate.getMonth() + month)

  return {
    strategy,
    feasible,
    months: month,
    totalInterestPaid,
    totalPaid,
    payoffDate,
    history,
    debtPayoffMonth,
    order,
  }
}

/** Finds the first month where the remaining balance drops to/below a fraction of the original total. */
export function monthAtProgress(result: PayoffResult, originalTotal: number, fraction: number): number | null {
  const target = originalTotal * (1 - fraction)
  const snap = result.history.find((h) => h.totalBalance <= target + 0.005)
  return snap ? snap.month : null
}

export function formatCurrency(value: number, currencyCode: string = 'USD', maximumFractionDigits = 0): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits,
    }).format(value)
  } catch {
    // Unknown/unsupported currency code — fall back to a plain number with the code as suffix.
    return `${value.toLocaleString('en-US', { maximumFractionDigits })} ${currencyCode}`
  }
}

export function formatMonthsAsYears(months: number): string {
  if (months <= 0) return '0 months'
  const y = Math.floor(months / 12)
  const m = months % 12
  const parts: string[] = []
  if (y > 0) parts.push(`${y} yr${y > 1 ? 's' : ''}`)
  if (m > 0) parts.push(`${m} mo${m > 1 ? 's' : ''}`)
  return parts.join(' ') || '0 months'
}

export const CATEGORY_META: Record<DebtCategory, { label: string; emoji: string }> = {
  'credit-card': { label: 'Credit Card', emoji: '💳' },
  'student-loan': { label: 'Student Loan', emoji: '🎓' },
  'auto-loan': { label: 'Auto Loan', emoji: '🚗' },
  'personal-loan': { label: 'Personal Loan', emoji: '🏦' },
  medical: { label: 'Medical', emoji: '🩺' },
  other: { label: 'Other', emoji: '📄' },
}

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}
