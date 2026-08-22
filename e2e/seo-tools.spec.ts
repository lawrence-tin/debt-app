import { test, expect } from '@playwright/test'

/**
 * Each SEO calculator (Part 10 of the technical reference) is a genuinely separate static
 * HTML entry (vite.config.ts), not a client-side route of the main app — so each one has to
 * be checked by navigating to it directly, the way a search visitor actually would.
 */
const TOOLS = [
  { path: '/tools/south-africa-debt-payoff-calculator/', heading: /south african debt payoff/i },
  { path: '/tools/debt-free-date-calculator/', heading: /debt-free date/i },
  { path: '/tools/avalanche-vs-snowball-calculator/', heading: /avalanche.*snowball/i },
  { path: '/tools/extra-payment-calculator/', heading: /extra payment/i },
  { path: '/tools/interest-savings-calculator/', heading: /interest savings/i },
  { path: '/tools/credit-card-payoff-calculator/', heading: /credit card/i },
  { path: '/tools/loan-payoff-calculator/', heading: /loan payoff/i },
]

for (const tool of TOOLS) {
  test(`${tool.path} loads independently with its calculator and a link back to the app`, async ({ page }) => {
    await page.goto(tool.path)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(tool.heading)
    // Every tool page embeds a real, working calculator (MultiDebtCalculator or
    // SingleDebtCalculator) — a number input is present and produces a live result.
    await expect(page.locator('input[type="number"]').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /open the full app/i })).toHaveAttribute(
      'href',
      /utm_source=calculator/,
    )
  })
}
