import { test, expect } from '@playwright/test'

/**
 * Milestones.tsx's two export actions (Part 5.19) — both are lazy/dynamic in the PDF's
 * case (jsPDF is only ever loaded once actually requested) and both trigger a real browser
 * download rather than opening a new tab or a preview.
 */
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.getByText('Skip to dashboard').click()
  await page.getByRole('button', { name: 'Try it with example data' }).click()
  await expect(page.locator('input[value="Credit Card"]')).toBeVisible()
})

test('downloads a PDF payoff report', async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download report (PDF)' }).click(),
  ])
  expect(download.suggestedFilename()).toBe('clearpath-debt-report.pdf')
})

test('downloads a CSV of every debt', async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export debts (CSV)' }).click(),
  ])
  expect(download.suggestedFilename()).toBe('clearpath-debts.csv')

  const csvPath = await download.path()
  const fs = await import('node:fs/promises')
  const contents = await fs.readFile(csvPath!, 'utf-8')
  // BOM-prefixed (report.ts) so Excel detects UTF-8 correctly, then one row per sample debt.
  expect(contents).toContain('Credit Card')
  expect(contents).toContain('Student Loan')
})
