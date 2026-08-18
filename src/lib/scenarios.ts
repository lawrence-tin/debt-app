import { simulatePayoff, totalMinPayment, type Debt, type PayoffResult, type Strategy } from './payoff'

export interface Scenario {
  id: string
  name: string
  extraPayment: number
  strategy: Strategy
  priorityOrder: string[]
  createdAt: string
}

export interface ScenarioWithResult extends Scenario {
  result: PayoffResult
}

/** Simulates each saved scenario against the current debts, for side-by-side comparison. */
export function evaluateScenarios(scenarios: Scenario[], debts: Debt[]): ScenarioWithResult[] {
  const minPayment = totalMinPayment(debts)
  return scenarios.map((scenario) => ({
    ...scenario,
    result: simulatePayoff(debts, scenario.strategy, minPayment + scenario.extraPayment, new Date(), scenario.priorityOrder),
  }))
}
