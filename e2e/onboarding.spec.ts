import { test, expect } from '@playwright/test'

/**
 * New user: welcome -> income -> expenses -> add a debt -> see the projection ->
 * compare strategies -> try the simulator -> land on the dashboard with the plan saved.
 * Covers the full guided path a first-time visitor takes end to end.
 */
test('a new user can complete onboarding and reach the dashboard with their plan', async ({ page }) => {
  await page.goto('/')

  // Welcome
  await expect(page.getByRole('heading', { name: /know your debt-free date/i })).toBeVisible()
  await page.getByRole('button', { name: 'Get started' }).click()

  // Income
  await expect(page.getByRole('heading', { name: /what's your monthly income/i })).toBeVisible()
  await page.locator('input[type="number"]').fill('25000')
  await page.getByRole('button', { name: 'Continue' }).click()

  // Expenses
  await expect(page.getByRole('heading', { name: /essential monthly expenses/i })).toBeVisible()
  await page.locator('input[type="number"]').fill('12000')
  await page.getByRole('button', { name: 'Continue' }).click()

  // Debts — the "continue" step button starts disabled until at least one is added
  await expect(page.getByRole('heading', { name: /now, add what you owe/i })).toBeVisible()
  const continueBtn = page.getByRole('button', { name: 'Calculate my plan' })
  await expect(continueBtn).toBeDisabled()

  await page.getByPlaceholder('Balance').fill('8000')
  await page.getByPlaceholder('Min payment').fill('400')
  await page.getByRole('button', { name: 'Add debt' }).click()

  await expect(continueBtn).toBeEnabled()
  await continueBtn.click()

  // Calculating -> auto-advances to the reveal
  await expect(page.getByText(/your projected debt-free date is/i)).toBeVisible({ timeout: 5000 })
  await page.getByRole('button', { name: 'See my options' }).click()

  // Compare strategies — the wizard's own heading and StrategyPicker's embedded heading
  // both happen to read "Choose your strategy", so assert on the wizard's unique subtitle.
  await expect(page.getByText(/each strategy pays off the same debts/i)).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()

  // Optimize — the extra-payment simulator
  await expect(page.getByRole('heading', { name: /want to get there faster/i })).toBeVisible()
  const slider = page.locator('input[type="range"]')
  await slider.fill('500')
  await page.getByRole('button', { name: 'Continue' }).click()

  // Commit — land on the dashboard
  await expect(page.getByRole('heading', { name: "You're all set." })).toBeVisible()
  await page.getByRole('button', { name: 'Go to my dashboard' }).click()

  // The dashboard now shows the debt that was added during onboarding, and the plan
  // survived the transition out of the wizard.
  await expect(page.getByText('Your debts')).toBeVisible()
  await expect(page.locator('input[value="8000"]')).toBeVisible()
})
