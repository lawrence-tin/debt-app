import { resolve } from 'node:path'
import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // Playwright owns e2e/ (its own `test`/`expect` globals, run via `npm run test:e2e`) —
    // without this, Vitest's default glob picks those files up too and fails immediately,
    // since they aren't valid Vitest test files.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname,'index.html'),
        // Free standalone SEO calculators (product spec section 17) — each is a real,
        // separate static HTML page (not a client-side route) so it ships with its own
        // <title>/meta tags baked in at build time, for crawlers and social previews.
        debtFreeDate: resolve(import.meta.dirname,'tools/debt-free-date-calculator/index.html'),
        creditCardPayoff: resolve(import.meta.dirname,'tools/credit-card-payoff-calculator/index.html'),
        avalancheVsSnowball: resolve(import.meta.dirname,'tools/avalanche-vs-snowball-calculator/index.html'),
        extraPayment: resolve(import.meta.dirname,'tools/extra-payment-calculator/index.html'),
        interestSavings: resolve(import.meta.dirname,'tools/interest-savings-calculator/index.html'),
        loanPayoff: resolve(import.meta.dirname,'tools/loan-payoff-calculator/index.html'),
        saDebtPayoff: resolve(import.meta.dirname,'tools/south-africa-debt-payoff-calculator/index.html'),
      },
    },
  },
})
