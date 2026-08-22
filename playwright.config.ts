import { defineConfig, devices } from '@playwright/test'

/**
 * Two separate builds back this suite, because VITE_SUPABASE_* is inlined at build time
 * (see src/lib/supabase.ts) — there is no way to toggle "cloud configured" at runtime.
 *   - `standard` serves the real production build (no cloud env vars), matching what
 *     actually ships today. Everything except the auth flow runs against it.
 *   - `cloud` serves a second build with dummy Supabase credentials, so the Sign In UI
 *     exists to test against. Its network calls are mocked in the auth spec itself —
 *     nothing here ever talks to a real Supabase project.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'standard',
      testIgnore: /auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4310' },
    },
    {
      name: 'cloud',
      testMatch: /auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4311' },
    },
  ],
  webServer: [
    {
      command: 'npm run build && npx vite preview --outDir dist --port 4310 --strictPort',
      url: 'http://localhost:4310',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command:
        'VITE_SUPABASE_URL=https://dummy.supabase.co VITE_SUPABASE_ANON_KEY=dummy-anon-key npm run build -- --outDir dist-cloud && npx vite preview --outDir dist-cloud --port 4311 --strictPort',
      url: 'http://localhost:4311',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
