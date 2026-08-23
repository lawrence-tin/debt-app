import { test, expect } from '@playwright/test'

/**
 * BudgetPanel's income/expenses fields used to pass any typed value straight through
 * (Number(value) || 0 only catches NaN/empty, never a negative number) — a negative income
 * or expense figure would silently flow into every downstream calculation. Both fields now
 * reject a negative amount outright rather than accepting and clamping it.
 */
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.getByText('Skip to dashboard').click()
})

test('typing a negative income character by character never produces a negative value', async ({ page }) => {
  const income = page.getByPlaceholder('4,500')
  await income.pressSequentially('-5000', { delay: 20 })
  // The leading "-" can never persist long enough to combine with a digit into a real
  // negative number, so the field ends up empty rather than showing -5000.
  await expect(income).toHaveValue('')
})

test('a negative income entered in one go is rejected with a visible error', async ({ page }) => {
  const income = page.getByPlaceholder('4,500')
  await income.fill('-1200')

  await expect(income).toHaveValue('')
  await expect(page.getByText("Income can't be negative.")).toBeVisible()

  // Fixing it with a valid amount clears the error and applies normally.
  await income.fill('15000')
  await expect(income).toHaveValue('15000')
  await expect(page.getByText("Income can't be negative.")).not.toBeVisible()
})

test('a negative value for other monthly expenses is rejected the same way', async ({ page }) => {
  const expenses = page.getByPlaceholder('2,200')
  await expenses.fill('-800')

  await expect(expenses).toHaveValue('')
  await expect(page.getByText("Expenses can't be negative.")).toBeVisible()
})
