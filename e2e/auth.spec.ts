import { test, expect, type Page, type Route } from '@playwright/test'

/**
 * Auth/cloud sync only exists when VITE_SUPABASE_* is configured at build time (see
 * src/lib/supabase.ts and Part 3.1 of the technical reference) — this whole spec runs
 * against the `cloud` project (playwright.config.ts), a second build with dummy
 * credentials so the Sign In UI exists at all.
 *
 * Every Supabase network call is mocked at the HTTP boundary rather than hitting a real
 * project: real request/response shapes are the actual stable contract supabase-js relies
 * on, so mocking there (instead of hand-crafting the client's internal localStorage
 * session format) lets the real client library run its real logic.
 */
const USER_ID = '11111111-1111-1111-1111-111111111111'
const CLOUD_DEBT_ID = '22222222-2222-2222-2222-222222222222'

function authUser() {
  return {
    id: USER_ID,
    aud: 'authenticated',
    role: 'authenticated',
    email: 'shopper@example.com',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {},
    identities: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  }
}

async function mockSupabase(page: Page) {
  await page.route('**/dummy.supabase.co/**', async (route: Route) => {
    const req = route.request()
    const url = new URL(req.url())
    const method = req.method()

    if (url.pathname === '/auth/v1/token' && method === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: 'mock-refresh-token',
          user: authUser(),
        }),
      })
    }

    if (url.pathname === '/auth/v1/logout' && method === 'POST') {
      return route.fulfill({ status: 204, body: '' })
    }

    if (url.pathname === '/rest/v1/debts' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: CLOUD_DEBT_ID,
            name: 'Synced From Cloud',
            category: 'credit-card',
            balance: 4200,
            original_balance: 5000,
            apr: 22.5,
            min_payment: 150,
            due_day: null,
          },
        ]),
      })
    }

    if (url.pathname === '/rest/v1/settings' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          monthly_income: 20000,
          fixed_expenses: 9000,
          extra_payment: 0,
          strategy: 'avalanche',
          priority_order: [],
          currency: 'ZAR',
          language: 'en',
          theme: 'light',
          tried_strategies: ['avalanche'],
          has_downloaded_report: false,
          plan_baseline: null,
        }),
      })
    }

    if ((url.pathname === '/rest/v1/payments' || url.pathname === '/rest/v1/scenarios') && method === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    }

    // Anything else (analytics_events, etc.) — a harmless empty success so unrelated
    // best-effort calls don't generate console noise, without asserting on them.
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
}

test('sign in pulls the account\'s cloud plan down, and sign out clears it locally', async ({ page }) => {
  await mockSupabase(page)
  await page.goto('/')
  await page.getByText('Skip to dashboard').click()

  await page.getByRole('button', { name: /sign in/i }).click()
  await page.getByLabel('Email').fill('shopper@example.com')
  await page.getByLabel('Password').fill('correct-horse-battery-staple')
  await page.locator('form').getByRole('button', { name: 'Sign in' }).click()

  // The account's cloud debt appears — this is "cloud sync" actually pulling data down,
  // not just a local echo of something typed in this session.
  await expect(page.locator('input[value="Synced From Cloud"]')).toBeVisible()

  const localStateAfterSignIn = await page.evaluate(() => localStorage.getItem('clearpath.v1'))
  expect(JSON.parse(localStateAfterSignIn!).debts).toHaveLength(1)

  // Sign out — the local view of this account's data must disappear (the sign-out fix:
  // it previously stayed visible to whoever used the browser next).
  await page.getByRole('button', { name: /sign out/i }).click()

  await expect(page.locator('input[value="Synced From Cloud"]')).not.toBeVisible()
  // Sign-out also resets hasCompletedOnboarding, so the app correctly falls all the way
  // back to onboarding rather than an empty dashboard — a truer "nothing left behind".
  await expect(page.getByRole('heading', { name: /know your debt-free date/i })).toBeVisible()

  const localStateAfterSignOut = await page.evaluate(() => localStorage.getItem('clearpath.v1'))
  expect(JSON.parse(localStateAfterSignOut!).debts).toHaveLength(0)
})
