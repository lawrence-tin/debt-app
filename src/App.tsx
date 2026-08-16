import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import BudgetPanel from './components/BudgetPanel'
import DebtsPanel from './components/DebtsPanel'
import StrategyPicker from './components/StrategyPicker'
import SummaryCards from './components/SummaryCards'
import Milestones from './components/Milestones'
import CurrencySelector from './components/CurrencySelector'

const PayoffChart = lazy(() => import('./components/PayoffChart'))
import ThemeToggle from './components/ThemeToggle'
import Confetti from './components/Confetti'
import { simulatePayoff, totalBalance, totalMinPayment, type Debt, type Strategy } from './lib/payoff'
import { loadState, saveState, SAMPLE_DEBTS } from './lib/storage'
import { guessCurrencyFromLocale } from './lib/currencies'

const DEFAULTS = {
  debts: [] as Debt[],
  monthlyIncome: 4500,
  fixedExpenses: 2200,
  extraPayment: 150,
  strategy: 'avalanche' as Strategy,
  theme: 'light' as 'light' | 'dark',
}

function getInitialTheme(): 'light' | 'dark' {
  const saved = loadState()
  if (saved?.theme) return saved.theme
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

export default function App() {
  const saved = useMemo(() => loadState(), [])
  const [debts, setDebts] = useState<Debt[]>(saved?.debts ?? DEFAULTS.debts)
  const [monthlyIncome, setMonthlyIncome] = useState(saved?.monthlyIncome ?? DEFAULTS.monthlyIncome)
  const [fixedExpenses, setFixedExpenses] = useState(saved?.fixedExpenses ?? DEFAULTS.fixedExpenses)
  const [extraPayment, setExtraPayment] = useState(saved?.extraPayment ?? DEFAULTS.extraPayment)
  const [strategy, setStrategy] = useState<Strategy>(saved?.strategy ?? DEFAULTS.strategy)
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme())
  const [currency, setCurrency] = useState<string>(saved?.currency ?? guessCurrencyFromLocale())
  const [confettiTrigger, setConfettiTrigger] = useState(0)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    saveState({ debts, monthlyIncome, fixedExpenses, extraPayment, strategy, theme, currency })
  }, [debts, monthlyIncome, fixedExpenses, extraPayment, strategy, theme, currency])

  const minPayment = totalMinPayment(debts)
  const originalTotal = totalBalance(debts)
  const budget = minPayment + extraPayment

  const avalanche = useMemo(() => simulatePayoff(debts, 'avalanche', budget), [debts, budget])
  const snowball = useMemo(() => simulatePayoff(debts, 'snowball', budget), [debts, budget])
  const baseline = useMemo(() => simulatePayoff(debts, strategy, minPayment), [debts, strategy, minPayment])
  const selected = strategy === 'avalanche' ? avalanche : snowball

  function resetAll() {
    if (!confirm('Clear all your data and start fresh?')) return
    setDebts([])
    setMonthlyIncome(DEFAULTS.monthlyIncome)
    setFixedExpenses(DEFAULTS.fixedExpenses)
    setExtraPayment(DEFAULTS.extraPayment)
    setStrategy(DEFAULTS.strategy)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <Confetti trigger={confettiTrigger} />

      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-sky-500 text-sm font-bold text-white">
              CP
            </span>
            <span className="text-lg font-semibold tracking-tight">ClearPath</span>
          </div>
          <div className="flex items-center gap-2">
            <CurrencySelector value={currency} onChange={setCurrency} compact />
            <button
              onClick={resetAll}
              className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700 sm:inline-flex dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <RotateCcw size={13} /> Start over
            </button>
            <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 animate-rise">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Plan your path to debt-free.</h1>
          <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
            Add what you owe, tell us what you can put toward it each month, and ClearPath builds a real, personalized
            payoff plan — no spreadsheet required.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <BudgetPanel
              monthlyIncome={monthlyIncome}
              fixedExpenses={fixedExpenses}
              extraPayment={extraPayment}
              totalMinPayment={minPayment}
              currency={currency}
              onChange={(patch) => {
                if (patch.monthlyIncome !== undefined) setMonthlyIncome(patch.monthlyIncome)
                if (patch.fixedExpenses !== undefined) setFixedExpenses(patch.fixedExpenses)
                if (patch.extraPayment !== undefined) setExtraPayment(patch.extraPayment)
              }}
            />
            <DebtsPanel
              debts={debts}
              currency={currency}
              onChange={setDebts}
              onLoadSample={() => setDebts(SAMPLE_DEBTS)}
            />
          </div>

          <div className="space-y-6 lg:col-span-3">
            {debts.length > 0 ? (
              <>
                <StrategyPicker
                  strategy={strategy}
                  onSelect={setStrategy}
                  avalanche={avalanche}
                  snowball={snowball}
                  currency={currency}
                />
                <SummaryCards result={selected} baseline={baseline} currency={currency} />
                <Suspense
                  fallback={
                    <div className="flex h-72 items-center justify-center rounded-2xl border border-slate-200 text-sm text-slate-400 dark:border-slate-800">
                      Loading chart…
                    </div>
                  }
                >
                  <PayoffChart avalanche={avalanche} snowball={snowball} strategy={strategy} currency={currency} />
                </Suspense>
                <Milestones
                  debts={debts}
                  result={selected}
                  originalTotal={originalTotal}
                  onCelebrate={() => setConfettiTrigger((n) => n + 1)}
                />
              </>
            ) : (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
                <div>
                  <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
                    Add a debt to see your personalized plan.
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Your debt-free date, total interest, and milestones will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
        ClearPath is a planning tool for educational purposes and stores your data only in this browser — nothing is
        sent to a server.
      </footer>
    </div>
  )
}
