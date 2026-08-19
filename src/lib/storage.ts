import type { Debt, Strategy } from './payoff'
import type { Locale } from './i18n'
import type { Payment } from './reminders'
import type { Scenario } from './scenarios'
import type { PlanBaseline } from './checkIn'

export interface AppState {
  debts: Debt[]
  monthlyIncome: number
  fixedExpenses: number
  extraPayment: number
  strategy: Strategy
  /** Debt ids in user-chosen payoff order, used when strategy === 'custom'. */
  priorityOrder: string[]
  theme: 'light' | 'dark'
  currency: string
  language: Locale
  payments: Payment[]
  scenarios: Scenario[]
  /** Achievement-tracking signals. */
  triedStrategies: Strategy[]
  hasDownloadedReport: boolean
  debtsPaidOffCount: number
  hasEditedBudget: boolean
  hasExplored: boolean
  hasCompletedOnboarding: boolean
  /** Frozen reference point the monthly check-in measures "ahead"/"behind" against. */
  planBaseline: PlanBaseline | null
  /** Local-only: whether this browser already joined the ClearPath Plus interest waitlist. */
  hasJoinedPlusWaitlist: boolean
}

const KEY = 'clearpath.v1'

export function loadState(): Partial<AppState> | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as Partial<AppState>
  } catch {
    return null
  }
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // storage unavailable (e.g. private mode) — fail silently
  }
}

export const SAMPLE_DEBTS: Debt[] = [
  { id: 'sample-1', name: 'Credit Card', category: 'credit-card', balance: 4200, originalBalance: 5000, apr: 24.99, minPayment: 120, dueDay: 5 },
  { id: 'sample-2', name: 'Student Loan', category: 'student-loan', balance: 18500, originalBalance: 20000, apr: 5.5, minPayment: 210, dueDay: 15 },
  { id: 'sample-3', name: 'Vehicle Finance', category: 'auto-loan', balance: 9800, originalBalance: 12000, apr: 7.2, minPayment: 260, dueDay: 1 },
  { id: 'sample-4', name: 'Store Account', category: 'store-account', balance: 1150, originalBalance: 1800, apr: 27.99, minPayment: 45, dueDay: 22 },
]
