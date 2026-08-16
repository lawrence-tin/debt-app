import type { Debt, Strategy } from './payoff'

export interface AppState {
  debts: Debt[]
  monthlyIncome: number
  fixedExpenses: number
  extraPayment: number
  strategy: Strategy
  theme: 'light' | 'dark'
  currency: string
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
  { id: 'sample-1', name: 'Visa Card', category: 'credit-card', balance: 4200, apr: 24.99, minPayment: 120 },
  { id: 'sample-2', name: 'Student Loan', category: 'student-loan', balance: 18500, apr: 5.5, minPayment: 210 },
  { id: 'sample-3', name: 'Car Loan', category: 'auto-loan', balance: 9800, apr: 7.2, minPayment: 260 },
  { id: 'sample-4', name: 'Store Card', category: 'credit-card', balance: 1150, apr: 27.99, minPayment: 45 },
]
