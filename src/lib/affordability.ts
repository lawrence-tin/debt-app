export type AffordabilityState = 'on-track' | 'under-pressure' | 'unaffordable'

export interface AffordabilityResult {
  /** Income left after essential expenses, before any debt payments. */
  available: number
  /** Share of that amount already committed to minimum debt payments (0-1+). */
  minimumShare: number
  state: AffordabilityState
}

/**
 * A neutral, educational read on how much of the user's budget their debts already
 * consume — not a legal or professional over-indebtedness determination.
 */
export function computeAffordability(
  monthlyIncome: number,
  fixedExpenses: number,
  totalMinPayment: number,
): AffordabilityResult {
  const available = monthlyIncome - fixedExpenses
  const minimumShare = available > 0 ? totalMinPayment / available : Infinity

  let state: AffordabilityState
  if (available <= 0 || totalMinPayment > available) {
    state = 'unaffordable'
  } else if (minimumShare > 0.7) {
    state = 'under-pressure'
  } else {
    state = 'on-track'
  }

  return { available, minimumShare, state }
}
