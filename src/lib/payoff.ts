export type DebtCategory =
  | 'credit-card'
  | 'personal-loan'
  | 'auto-loan' // labeled "Vehicle Finance" — South African terminology
  | 'store-account'
  | 'overdraft'
  | 'home-loan'
  | 'student-loan'
  | 'medical'
  | 'family-friend'
  | 'other'

export interface Debt {
  id: string
  name: string
  category: DebtCategory
  balance: number
  apr: number // annual percentage rate, e.g. 22.99
  minPayment: number
  /** Day of the month (1-31) the payment is due. Optional — powers reminders. */
  dueDay?: number
  /** Balance at the moment this debt was first added — the baseline real progress is measured against. */
  originalBalance?: number
}

/** Real (not projected) progress made on a set of debts, from each one's originalBalance to its current balance. */
export function realProgress(debts: Debt[]): { paidOff: number; original: number; percent: number } {
  let paidOff = 0
  let original = 0
  for (const d of debts) {
    const start = d.originalBalance ?? d.balance
    original += start
    paidOff += Math.max(0, start - d.balance)
  }
  const percent = original > 0 ? Math.round((paidOff / original) * 100) : 0
  return { paidOff, original, percent }
}

export type Strategy = 'avalanche' | 'snowball' | 'custom'

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

function getOrder(debts: Debt[], strategy: Strategy, customOrder: string[] = []): string[] {
  const active = debts.filter((d) => d.balance > 0)
  if (strategy === 'custom') {
    const activeIds = new Set(active.map((d) => d.id))
    const ranked = customOrder.filter((id) => activeIds.has(id))
    const unranked = active.filter((d) => !customOrder.includes(d.id)).map((d) => d.id)
    return [...ranked, ...unranked]
  }
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
 * Reduces a debt's balance by a real payment. If this is the first payment logged against
 * the debt for its current billing period, one month's interest is accrued first — the same
 * accrual simulatePayoff's own month loop applies — so the payment comes off what was
 * actually owed by the time it was made, not just whatever the balance happened to read
 * when it was last edited. A second (or third) payment within the same period skips
 * re-accruing interest, since a real billing cycle charges interest once per cycle no
 * matter how many payments land in it.
 */
export function applyPayment(debt: Debt, amount: number, accrueInterest: boolean): number {
  const owedBeforePayment = accrueInterest ? debt.balance * (1 + debt.apr / 100 / 12) : debt.balance
  return Math.max(0, owedBeforePayment - amount)
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
  customOrder: string[] = [],
): PayoffResult {
  const order = getOrder(debts, strategy, customOrder)
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

export function formatCurrency(
  value: number,
  currencyCode: string = 'USD',
  locale: string = 'en-US',
  maximumFractionDigits = 0,
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits,
    }).format(value)
  } catch {
    // Unknown/unsupported currency code — fall back to a plain number with the code as suffix.
    return `${value.toLocaleString(locale, { maximumFractionDigits })} ${currencyCode}`
  }
}

/** Emoji shown next to each debt category; human-readable labels live in the i18n translations. */
export const CATEGORY_EMOJI: Record<DebtCategory, string> = {
  'credit-card': '💳',
  'personal-loan': '🏦',
  'auto-loan': '🚗',
  'store-account': '🛍️',
  overdraft: '🏧',
  'home-loan': '🏠',
  'student-loan': '🎓',
  medical: '🩺',
  'family-friend': '🤝',
  other: '📄',
}

export const DEBT_CATEGORIES: DebtCategory[] = Object.keys(CATEGORY_EMOJI) as DebtCategory[]

/** Generates a v4 UUID — also used as the primary key when a debt is synced to the cloud. */
export function makeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  // Fallback for environments without crypto.randomUUID (older browsers).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
