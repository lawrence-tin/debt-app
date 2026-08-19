import { describe, expect, it } from 'vitest'
import { formatCurrency, simulatePayoff, totalMinPayment, type Debt } from './payoff'

function debt(overrides: Partial<Debt> & { id: string }): Debt {
  return {
    name: overrides.id,
    category: 'other',
    balance: 1000,
    apr: 20,
    minPayment: 50,
    ...overrides,
  }
}

describe('simulatePayoff — regression suite', () => {
  it('accrues zero interest on a zero-APR debt', () => {
    const debts = [debt({ id: 'a', balance: 600, apr: 0, minPayment: 100 })]
    const result = simulatePayoff(debts, 'avalanche', 100)
    expect(result.feasible).toBe(true)
    expect(result.totalInterestPaid).toBe(0)
    expect(result.months).toBe(6) // 600 / 100, no interest to extend it
  })

  it('accrues meaningful interest on a high-APR debt', () => {
    const debts = [debt({ id: 'a', balance: 5000, apr: 39.99, minPayment: 150 })]
    const result = simulatePayoff(debts, 'avalanche', 150)
    expect(result.feasible).toBe(true)
    expect(result.totalInterestPaid).toBeGreaterThan(0)
    // High APR relative to payment should cost noticeably more than the original balance in interest,
    // or at minimum take meaningfully longer than the interest-free case.
    expect(result.months).toBeGreaterThan(30)
  })

  it('clears a very small balance in the first month without overpaying', () => {
    const debts = [debt({ id: 'a', balance: 5, apr: 20, minPayment: 50 })]
    const result = simulatePayoff(debts, 'avalanche', 50)
    expect(result.months).toBe(1)
    expect(result.debtPayoffMonth.a).toBe(1)
    expect(result.history.at(-1)?.totalBalance).toBe(0)
  })

  it('sweeps a final fractional remainder to exactly zero instead of lingering', () => {
    // A balance that won't divide evenly against the payment, to exercise the rounding sweep.
    const debts = [debt({ id: 'a', balance: 333.33, apr: 0, minPayment: 100 })]
    const result = simulatePayoff(debts, 'avalanche', 100)
    expect(result.history.at(-1)?.totalBalance).toBe(0)
    expect(result.history.every((h) => h.totalBalance >= 0)).toBe(true)
  })

  it('does not let minimum payment exceeding the balance produce a negative balance', () => {
    const debts = [debt({ id: 'a', balance: 30, apr: 15, minPayment: 100 })]
    const result = simulatePayoff(debts, 'avalanche', 100)
    expect(result.months).toBe(1)
    expect(result.history.at(-1)?.balances.a).toBe(0)
  })

  it('can clear multiple debts in the same month', () => {
    const debts = [
      debt({ id: 'a', balance: 100, apr: 0, minPayment: 100 }),
      debt({ id: 'b', balance: 100, apr: 0, minPayment: 100 }),
    ]
    const result = simulatePayoff(debts, 'avalanche', 200)
    expect(result.debtPayoffMonth.a).toBe(1)
    expect(result.debtPayoffMonth.b).toBe(1)
  })

  it('cascades extra payment to the priority debt and speeds up the plan', () => {
    const debts = [
      debt({ id: 'a', balance: 2000, apr: 20, minPayment: 50 }),
      debt({ id: 'b', balance: 2000, apr: 10, minPayment: 50 }),
    ]
    const minOnly = simulatePayoff(debts, 'avalanche', totalMinPayment(debts))
    const withExtra = simulatePayoff(debts, 'avalanche', totalMinPayment(debts) + 200)
    expect(withExtra.months).toBeLessThan(minOnly.months)
    expect(withExtra.totalInterestPaid).toBeLessThan(minOnly.totalInterestPaid)
  })

  it('avalanche pays off the highest-APR debt first', () => {
    const debts = [
      debt({ id: 'low-apr', balance: 1000, apr: 5, minPayment: 50 }),
      debt({ id: 'high-apr', balance: 1000, apr: 30, minPayment: 50 }),
    ]
    const result = simulatePayoff(debts, 'avalanche', 300)
    expect(result.debtPayoffMonth['high-apr']).toBeLessThan(result.debtPayoffMonth['low-apr'])
  })

  it('snowball pays off the smallest-balance debt first', () => {
    const debts = [
      debt({ id: 'big', balance: 3000, apr: 20, minPayment: 50 }),
      debt({ id: 'small', balance: 300, apr: 5, minPayment: 50 }),
    ]
    const result = simulatePayoff(debts, 'snowball', 300)
    expect(result.debtPayoffMonth.small).toBeLessThan(result.debtPayoffMonth.big)
  })

  it('custom strategy follows the exact order supplied', () => {
    const debts = [
      debt({ id: 'a', balance: 1000, apr: 20, minPayment: 50 }),
      debt({ id: 'b', balance: 1000, apr: 5, minPayment: 50 }),
      debt({ id: 'c', balance: 1000, apr: 35, minPayment: 50 }),
    ]
    // Deliberately the reverse of what avalanche/snowball would pick.
    const result = simulatePayoff(debts, 'custom', 300, new Date(), ['b', 'a', 'c'])
    expect(result.debtPayoffMonth.b).toBeLessThan(result.debtPayoffMonth.a)
    expect(result.debtPayoffMonth.a).toBeLessThan(result.debtPayoffMonth.c)
  })

  it('is infeasible when the monthly budget cannot cover minimum payments', () => {
    const debts = [debt({ id: 'a', balance: 5000, apr: 20, minPayment: 200 })]
    const result = simulatePayoff(debts, 'avalanche', 50) // less than the minimum
    expect(result.feasible).toBe(false)
    expect(result.months).toBe(0)
  })

  it('is infeasible for a zero or negative monthly budget when any debt exists', () => {
    const debts = [debt({ id: 'a', balance: 1000, apr: 20, minPayment: 50 })]
    expect(simulatePayoff(debts, 'avalanche', 0).feasible).toBe(false)
  })

  it('terminates within the safety cap on long/near-stagnant repayment horizons', () => {
    // Payment barely above the interest accrued each month — a worst-case slow burn.
    const debts = [debt({ id: 'a', balance: 50000, apr: 35, minPayment: 1460 })]
    const result = simulatePayoff(debts, 'avalanche', 1460)
    expect(result.months).toBeLessThanOrEqual(600)
    expect(result.history.length).toBeLessThanOrEqual(601)
  })

  it('handles an empty debt list as trivially feasible with no months required', () => {
    const result = simulatePayoff([], 'avalanche', 0)
    expect(result.feasible).toBe(true)
    expect(result.months).toBe(0)
  })
})

describe('formatCurrency — precision and rounding', () => {
  it('rounds to whole units by default regardless of currency', () => {
    expect(formatCurrency(1234.5, 'USD', 'en-US')).toBe('$1,235')
    expect(formatCurrency(1234.4, 'USD', 'en-US')).toBe('$1,234')
  })

  it('formats a zero-decimal currency (JPY) without a decimal point', () => {
    const out = formatCurrency(1000, 'JPY', 'en-US')
    expect(out).not.toContain('.')
  })

  it('formats ZAR correctly for the South Africa-first default', () => {
    const out = formatCurrency(15000, 'ZAR', 'en-US')
    expect(out).toContain('15,000')
  })

  it('falls back gracefully for an unsupported currency code instead of throwing', () => {
    expect(() => formatCurrency(100, 'XXX_NOT_REAL', 'en-US')).not.toThrow()
  })
})
