import { test, expect } from '@playwright/test'

/**
 * Logging a payment (DebtsList.tsx) reduces the debt's real balance and records a Payment
 * (App.tsx's handleLogPayment) — this should ripple into every total derived from `debts`
 * immediately: the debt's own balance field, the debts summary line, and (once a plan
 * baseline exists to compare against) the monthly check-in's headline number.
 *
 * A plan baseline is normally only meaningful after real time has passed, so this seeds
 * localStorage directly with a baseline dated a few months back — the same approach used
 * to manually verify the check-in redesign earlier — rather than waiting on the calendar.
 */
function seededState() {
  const monthlyBalances = Array.from({ length: 13 }, (_, m) => Math.max(0, 1200 - 100 * m))
  const startedAt = new Date()
  startedAt.setMonth(startedAt.getMonth() - 3)
  return {
    debts: [{ id: 'd1', name: 'Test Card', category: 'credit-card', balance: 1150, originalBalance: 1200, apr: 0, minPayment: 100 }],
    monthlyIncome: 8000,
    fixedExpenses: 3000,
    extraPayment: 0,
    strategy: 'avalanche',
    priorityOrder: [],
    theme: 'light',
    currency: 'ZAR',
    language: 'en',
    payments: [],
    scenarios: [],
    triedStrategies: ['avalanche'],
    hasDownloadedReport: false,
    debtsPaidOffCount: 0,
    hasEditedBudget: true,
    hasExplored: false,
    hasCompletedOnboarding: true,
    planBaseline: {
      startedAt: startedAt.toISOString(),
      totalBalance: 1200,
      debtFreeDate: new Date(new Date().setMonth(new Date().getMonth() + 9)).toISOString(),
      monthlyBalances,
    },
    hasJoinedPlusWaitlist: false,
  }
}

test('logging a payment reduces the balance and updates the check-in', async ({ page }) => {
  await page.addInitScript((state) => localStorage.setItem('clearpath.v1', JSON.stringify(state)), seededState())
  await page.goto('/')

  const debtRow = page.locator('li', { has: page.locator('input[value="Test Card"]') })
  await expect(debtRow.locator('label:has-text("Balance") input')).toHaveValue('1150')

  const summary = page.getByText(/total ·/i)
  await expect(summary).toContainText('R 1 150')

  const checkIn = page.locator('section', { has: page.getByText('Your monthly check-in') })
  const heroBefore = await checkIn.locator('p.text-3xl').innerText()

  // Log a R150 payment (the minimum is prefilled but this debt has a custom amount typed in).
  await debtRow.locator('input[aria-label="Amount"]').fill('150')
  await debtRow.getByRole('button', { name: 'Log payment' }).click()

  // Balance dropped by exactly the payment amount, everywhere it's shown.
  await expect(debtRow.locator('label:has-text("Balance") input')).toHaveValue('1000')
  await expect(summary).toContainText('R 1 000')

  // The check-in's headline number reflects the newly-reduced balance too — it isn't
  // frozen at whatever it showed on first render.
  await expect(async () => {
    const heroAfter = await checkIn.locator('p.text-3xl').innerText()
    expect(heroAfter).not.toBe(heroBefore)
  }).toPass()
})

/**
 * Regression test for a real reported bug: a debt with a non-zero APR logged a payment as
 * flat subtraction (balance - amount) with no interest at all, so a R10,000 balance minus a
 * R1,000 payment landed on R9,000 — silently ignoring the APR entirely. It should land on
 * R9,100: interest for the period accrues first (payoff.ts#applyPayment), the same way
 * simulatePayoff's own month loop treats every month.
 */
test('logging a payment against an interest-bearing debt accrues that period first', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Skip to dashboard').click()

  await page.getByPlaceholder('Balance').fill('10000')
  await page.getByPlaceholder('APR %').fill('12')
  await page.getByPlaceholder('Min payment').fill('1000')
  await page.getByRole('button', { name: 'Add debt' }).click()

  await page.getByRole('button', { name: 'Log payment' }).click()

  await expect(page.locator('label:has-text("Balance") input')).toHaveValue('9100')
})

test('a payment larger than the balance is rejected, not silently clamped to zero', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Skip to dashboard').click()

  await page.getByPlaceholder('Balance').fill('1000')
  await page.getByPlaceholder('APR %').fill('12')
  await page.getByPlaceholder('Min payment').fill('100')
  await page.getByRole('button', { name: 'Add debt' }).click()

  const amountInput = page.getByLabel('Amount')
  const balanceInput = page.locator('label:has-text("Balance") input')

  await amountInput.fill('5000')
  await page.getByRole('button', { name: 'Log payment' }).click()

  await expect(page.getByText(/more than the balance/i)).toBeVisible()
  await expect(balanceInput).toHaveValue('1000') // unchanged — the payment never applied

  // Editing the amount clears the error, and a valid payment then goes through normally.
  await amountInput.fill('400')
  await expect(page.getByText(/more than the balance/i)).not.toBeVisible()
  await page.getByRole('button', { name: 'Log payment' }).click()
  await expect(balanceInput).toHaveValue('610') // 1000 * 1.01 - 400
})
