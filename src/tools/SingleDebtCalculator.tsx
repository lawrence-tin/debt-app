import { useMemo, useState } from 'react'
import { formatCurrency, simulatePayoff, type Debt } from '../lib/payoff'

interface Props {
  /** e.g. "Credit card" vs "Loan" — used in field labels only. */
  debtLabel: string
  defaultBalance: number
  defaultApr: number
  defaultMinPayment: number
}

const LOCALE = 'en-ZA'
const CURRENCY = 'ZAR'

export default function SingleDebtCalculator({ debtLabel, defaultBalance, defaultApr, defaultMinPayment }: Props) {
  const [balance, setBalance] = useState(String(defaultBalance))
  const [apr, setApr] = useState(String(defaultApr))
  const [minPayment, setMinPayment] = useState(String(defaultMinPayment))
  const [extraPayment, setExtraPayment] = useState(0)

  const debt: Debt = useMemo(
    () => ({
      id: 'single',
      name: debtLabel,
      category: 'other',
      balance: Number(balance) || 0,
      apr: Number(apr) || 0,
      minPayment: Number(minPayment) || 0,
    }),
    [balance, apr, minPayment, debtLabel],
  )

  const baseline = useMemo(() => simulatePayoff([debt], 'avalanche', debt.minPayment), [debt])
  const withExtra = useMemo(
    () => simulatePayoff([debt], 'avalanche', debt.minPayment + extraPayment),
    [debt, extraPayment],
  )

  const sliderMax = Math.max(500, Math.round(debt.balance / 20 / 10) * 10 || 500)
  const monthsSaved = baseline.feasible && withExtra.feasible ? baseline.months - withExtra.months : 0
  const interestSaved = baseline.feasible && withExtra.feasible ? baseline.totalInterestPaid - withExtra.totalInterestPaid : 0

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600 dark:text-slate-300">{debtLabel} balance</span>
          <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800">
            <span className="mr-1 text-slate-400">R</span>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full bg-transparent text-slate-900 outline-none dark:text-white"
            />
          </div>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600 dark:text-slate-300">Interest rate (APR %)</span>
          <input
            type="number"
            step="0.01"
            value={apr}
            onChange={(e) => setApr(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600 dark:text-slate-300">Minimum payment</span>
          <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800">
            <span className="mr-1 text-slate-400">R</span>
            <input
              type="number"
              value={minPayment}
              onChange={(e) => setMinPayment(e.target.value)}
              className="w-full bg-transparent text-slate-900 outline-none dark:text-white"
            />
          </div>
        </label>
      </div>

      <div className="mt-5">
        <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          Extra payment per month: {formatCurrency(extraPayment, CURRENCY, LOCALE)}
        </label>
        <input
          type="range"
          min={0}
          max={sliderMax}
          step={10}
          value={extraPayment}
          onChange={(e) => setExtraPayment(Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-4 dark:border-slate-800">
        <Stat label="Debt-free in" value={withExtra.feasible ? monthLabel(withExtra.months) : '—'} />
        <Stat label="Total interest" value={withExtra.feasible ? formatCurrency(withExtra.totalInterestPaid, CURRENCY, LOCALE) : '—'} />
        <Stat
          label="Time saved"
          value={extraPayment > 0 && monthsSaved > 0 ? monthLabel(monthsSaved) : '—'}
          accent
        />
        <Stat
          label="Interest saved"
          value={extraPayment > 0 && interestSaved > 0 ? formatCurrency(interestSaved, CURRENCY, LOCALE) : '—'}
          accent
        />
      </div>
      {!withExtra.feasible && debt.balance > 0 && (
        <p className="mt-3 text-xs text-rose-500">
          That minimum payment isn't enough to cover the interest on this balance — increase it to see a payoff date.
        </p>
      )}
    </div>
  )
}

function monthLabel(months: number): string {
  const y = Math.floor(months / 12)
  const m = months % 12
  const parts: string[] = []
  if (y > 0) parts.push(`${y} yr${y === 1 ? '' : 's'}`)
  if (m > 0 || y === 0) parts.push(`${m} mo${m === 1 ? '' : 's'}`)
  return parts.join(' ')
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-bold ${accent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  )
}
