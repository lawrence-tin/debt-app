import { test, expect } from '@playwright/test'

/**
 * Returning user: everything the app tracks lives in one localStorage key
 * (clearpath.v1, see storage.ts) written on every relevant state change — a reload should
 * come back exactly as it was left, with no server round-trip required.
 */
test('a plan survives a full page reload', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Skip to dashboard').click()

  await page.getByRole('button', { name: 'Try it with example data' }).click()
  await expect(page.locator('input[value="Credit Card"]')).toBeVisible()

  // Edit the budget too, so more than just the debts list is checked for survival.
  await page.getByPlaceholder('4,500').fill('30000')

  await page.reload()

  await expect(page.locator('input[value="Credit Card"]')).toBeVisible()
  await expect(page.getByPlaceholder('4,500')).toHaveValue('30000')
})
