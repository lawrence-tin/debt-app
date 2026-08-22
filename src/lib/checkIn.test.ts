import { describe, expect, it } from 'vitest'
import { captureBaseline, computeCheckIn } from './checkIn'
import { simulatePayoff, type Debt } from './payoff'

function debt(overrides: Partial<Debt> & { id: string }): Debt {
  return { name: overrides.id, category: 'other', balance: 1000, apr: 20, minPayment: 50, ...overrides }
}

describe('captureBaseline', () => {
  it('freezes the starting balance, payoff date and monthly trajectory', () => {
    const debts = [debt({ id: 'a', balance: 1200, apr: 0, minPayment: 100 })]
    const result = simulatePayoff(debts, 'avalanche', 100, new Date('2026-01-01'))
    const baseline = captureBaseline(result, new Date('2026-01-01'))
    expect(baseline.totalBalance).toBe(1200)
    expect(baseline.debtFreeDate).toBe(result.payoffDate.toISOString())
    expect(baseline.monthlyBalances[0]).toBe(1200)
    expect(baseline.monthlyBalances.at(-1)).toBe(0)
  })

  it('stores an empty debtFreeDate when the plan is infeasible at capture time', () => {
    const debts = [debt({ id: 'a', balance: 1000, apr: 20, minPayment: 200 })]
    const result = simulatePayoff(debts, 'avalanche', 50) // below minimum required
    const baseline = captureBaseline(result)
    expect(baseline.debtFreeDate).toBe('')
  })
})

describe('computeCheckIn', () => {
  it('reports "too-soon" on the same day the baseline was captured', () => {
    const debts = [debt({ id: 'a', balance: 1200, apr: 0, minPayment: 100 })]
    const start = new Date('2026-01-15')
    const result = simulatePayoff(debts, 'avalanche', 100, start)
    const baseline = captureBaseline(result, start)
    const checkIn = computeCheckIn(baseline, debts, result, start)
    expect(checkIn.status).toBe('too-soon')
    expect(checkIn.monthsElapsed).toBe(0)
  })

  it('reports "ahead" when the user paid down more than the frozen plan expected by now', () => {
    const debts = [debt({ id: 'a', balance: 1200, apr: 0, minPayment: 100 })]
    const start = new Date('2026-01-01')
    const baselineResult = simulatePayoff(debts, 'avalanche', 100, start)
    const baseline = captureBaseline(baselineResult, start)

    // Two months later, the user has paid down faster than the R100/mo plan required.
    const now = new Date('2026-03-01')
    const paidDownDebts = [debt({ id: 'a', balance: 700, apr: 0, minPayment: 100 })]
    const liveResult = simulatePayoff(paidDownDebts, 'avalanche', 100, now)
    const checkIn = computeCheckIn(baseline, paidDownDebts, liveResult, now)

    expect(checkIn.monthsElapsed).toBe(2)
    expect(checkIn.status).toBe('ahead')
    expect(checkIn.differenceAmount).toBeGreaterThan(0)
    // The baseline (R100/mo, no interest) expected R200 reduced after 2 months; the plan
    // paid down R500, so actualReduced - expectedReduced should equal differenceAmount.
    expect(checkIn.expectedReduced).toBeCloseTo(200, 5)
    expect(checkIn.actualReduced - checkIn.expectedReduced).toBeCloseTo(checkIn.differenceAmount, 5)
  })

  it('reports "behind" when the user has paid down less than the frozen plan expected', () => {
    const debts = [debt({ id: 'a', balance: 1200, apr: 0, minPayment: 100 })]
    const start = new Date('2026-01-01')
    const baselineResult = simulatePayoff(debts, 'avalanche', 100, start)
    const baseline = captureBaseline(baselineResult, start)

    // Two months later, almost nothing has been paid down.
    const now = new Date('2026-03-01')
    const laggingDebts = [debt({ id: 'a', balance: 1150, apr: 0, minPayment: 100 })]
    const liveResult = simulatePayoff(laggingDebts, 'avalanche', 100, now)
    const checkIn = computeCheckIn(baseline, laggingDebts, liveResult, now)

    expect(checkIn.status).toBe('behind')
    expect(checkIn.differenceAmount).toBeLessThan(0)
  })

  it('reports "on-track" for a difference inside the rounding dead-zone', () => {
    const debts = [debt({ id: 'a', balance: 1200, apr: 0, minPayment: 100 })]
    const start = new Date('2026-01-01')
    const baselineResult = simulatePayoff(debts, 'avalanche', 100, start)
    const baseline = captureBaseline(baselineResult, start)

    const now = new Date('2026-02-01')
    // Baseline expects 1100 after one month; land essentially on the money.
    const onTrackDebts = [debt({ id: 'a', balance: 1100, apr: 0, minPayment: 100 })]
    const liveResult = simulatePayoff(onTrackDebts, 'avalanche', 100, now)
    const checkIn = computeCheckIn(baseline, onTrackDebts, liveResult, now)

    expect(checkIn.status).toBe('on-track')
  })

  it('reports "debt-free" once every debt in the plan is cleared', () => {
    const debts = [debt({ id: 'a', balance: 500, apr: 0, minPayment: 100 })]
    const start = new Date('2026-01-01')
    const baselineResult = simulatePayoff(debts, 'avalanche', 100, start)
    const baseline = captureBaseline(baselineResult, start)

    const now = new Date('2026-06-01')
    const paidOffDebts = [debt({ id: 'a', balance: 0, apr: 0, minPayment: 100 })]
    const liveResult = simulatePayoff(paidOffDebts, 'avalanche', 100, now)
    const checkIn = computeCheckIn(baseline, paidOffDebts, liveResult, now)

    expect(checkIn.status).toBe('debt-free')
  })

  it('reports a negative dateShiftMonths when the projected debt-free date moved earlier', () => {
    const debts = [debt({ id: 'a', balance: 1200, apr: 0, minPayment: 100 })]
    const start = new Date('2026-01-01')
    const baselineResult = simulatePayoff(debts, 'avalanche', 100, start) // 12 months, payoff ~2027-01
    const baseline = captureBaseline(baselineResult, start)

    // Paid down well ahead of schedule and now finishes sooner from today.
    const now = new Date('2026-04-01')
    const aheadDebts = [debt({ id: 'a', balance: 200, apr: 0, minPayment: 100 })]
    const liveResult = simulatePayoff(aheadDebts, 'avalanche', 100, now)
    const checkIn = computeCheckIn(baseline, aheadDebts, liveResult, now)

    expect(checkIn.dateShiftMonths).toBeLessThan(0)
  })
})
