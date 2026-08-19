import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { formatCurrency, simulatePayoff, totalMinPayment, type Debt } from '../lib/payoff'

type Emphasis = 'date' | 'comparison' | 'extra' | 'interest' | 'general'

interface Props {
  emphasis: Emphasis
}

const LOCALE = 'en-ZA'
const CURRENCY = 'ZAR'

let seedCounter = 0
function seedId() {
  seedCounter += 1
  return `seed-${seedCounter}`
}

const DEFAULT_DEBTS: Debt[] = [
  { id: seedId(), name: 'Credit Card', category: 'credit-card', balance: 8000, apr: 24.99, minPayment: 400 },
  { id: seedId(), name: 'Store Account', category: 'store-account', balance: 3500, apr: 22, minPayment: 250 },
]

function monthLabel(months: number): string {
  const y = Math.floor(months / 12)
  const m = months % 12
  const parts: string[] = []
  if (y > 0) parts.push(`${y} yr${y === 1 ? '' : 's'}`)
  if (m > 0 || y === 0) parts.push(`${m} mo${m === 1 ? '' : 's'}`)
  return parts.join(' ')
}

export default function MultiDebtCalculator({ emphasis }: Props) {
  const [debts, setDebts] = useState<Debt[]>(DEFAULT_DEBTS)
  const [extraPayment, setExtraPayment] = useState(200)

  function updateDebt(id: string, patch: Partial<Debt>) {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  function addDebt() {
    setDebts((prev) => [...prev, { id: seedId(), name: 'New debt', category: 'other', balance: 1000, apr: 20, minPayment: 100 }])
  }

  function removeDebt(id: string) {
    setDebts((prev) => prev.filter((d) => d.id !== id))
  }

  const minPayment = totalMinPayment(debts)
  const budget = minPayment + extraPayment

  const avalanche = useMemo(() => simulatePayoff(debts, 'avalanche', budget), [debts, budget])
  const snowball = useMemo(() => simulatePayoff(debts, 'snowball', budget), [debts, budget])
  const minOnly = useMemo(() => simulatePayoff(debts, 'avalanche', minPayment), [debts, minPayment])

  const cheaper = avalanche.totalInterestPaid <= snowball.totalInterestPaid ? avalanche : snowball
  const monthsSaved = minOnly.feasible && cheaper.feasible ? minOnly.months - cheaper.months : 0
  const interestSaved = minOnly.feasible && cheaper.feasible ? minOnly.totalInterestPaid - cheaper.totalInterestPaid : 0
  const sliderMax = Math.max(500, Math.round(minPayment / 2 / 10) * 10 || 500)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-3">
        {debts.map((d) => (
          <div key={d.id} className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-5 dark:border-slate-800">
            <input
              value={d.name}
              onChange={(e) => updateDebt(d.id, { name: e.target.value })}
              className="col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 sm:col-span-1 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="Debt name"
            />
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800">
              <span className="mr-1 text-xs text-slate-400">R</span>
              <input
                type="number"
                value={d.balance}
                onChange={(e) => updateDebt(d.id, { balance: Number(e.target.value) || 0 })}
                className="w-full bg-transparent py-1.5 text-sm text-slate-900 outline-none dark:text-white"
                placeholder="Balance"
              />
            </div>
            <input
              type="number"
              step="0.01"
              value={d.apr}
              onChange={(e) => updateDebt(d.id, { apr: Number(e.target.value) || 0 })}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="APR %"
            />
            <div className="flex items-center gap-1">
              <div className="flex flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800">
                <span className="mr-1 text-xs text-slate-400">R</span>
                <input
                  type="number"
                  value={d.minPayment}
                  onChange={(e) => updateDebt(d.id, { minPayment: Number(e.target.value) || 0 })}
                  className="w-full bg-transparent py-1.5 text-sm text-slate-900 outline-none dark:text-white"
                  placeholder="Min payment"
                />
              </div>
              <button
                onClick={() => removeDebt(d.id)}
                aria-label={`Remove ${d.name}`}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={addDebt}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300"
        >
          <Plus size={14} /> Add another debt
        </button>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
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

      {!cheaper.feasible ? (
        <p className="mt-5 text-sm text-rose-500">
          Your minimum payments alone add up to more than this budget covers — increase the extra payment, or check
          your numbers, to see a payoff date.
        </p>
      ) : (
        <>
          {emphasis === 'date' && (
            <div className="mt-6 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 p-5 text-center text-white">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-50">Your projected debt-free date</p>
              <p className="mt-1 text-3xl font-bold">{cheaper.payoffDate.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })}</p>
              <p className="mt-1 text-sm text-emerald-50">{monthLabel(cheaper.months)} from today</p>
            </div>
          )}

          {emphasis === 'extra' && extraPayment > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4 text-center dark:border-violet-900 dark:bg-violet-500/10">
              <div>
                <p className="text-xs uppercase tracking-wide text-violet-500">Time saved</p>
                <p className="mt-1 text-2xl font-bold text-violet-700 dark:text-violet-300">{monthsSaved > 0 ? monthLabel(monthsSaved) : '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-violet-500">Interest saved</p>
                <p className="mt-1 text-2xl font-bold text-violet-700 dark:text-violet-300">
                  {interestSaved > 0 ? formatCurrency(interestSaved, CURRENCY, LOCALE) : '—'}
                </p>
              </div>
            </div>
          )}

          {emphasis === 'interest' && (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-5 text-center dark:border-rose-900 dark:bg-rose-500/10">
              <p className="text-xs font-medium uppercase tracking-wide text-rose-500">Total interest you'll pay</p>
              <p className="mt-1 text-3xl font-bold text-rose-700 dark:text-rose-300">{formatCurrency(cheaper.totalInterestPaid, CURRENCY, LOCALE)}</p>
              {extraPayment > 0 && interestSaved > 0 && (
                <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">
                  That's {formatCurrency(interestSaved, CURRENCY, LOCALE)} less than paying only the minimums.
                </p>
              )}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div
              className={`rounded-xl border p-4 ${avalanche.totalInterestPaid <= snowball.totalInterestPaid ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800'}`}
            >
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Avalanche</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Highest interest rate first</p>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Debt-free in</span>
                <span className="font-semibold text-slate-900 dark:text-white">{monthLabel(avalanche.months)}</span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Total interest</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(avalanche.totalInterestPaid, CURRENCY, LOCALE)}</span>
              </div>
            </div>
            <div
              className={`rounded-xl border p-4 ${snowball.totalInterestPaid < avalanche.totalInterestPaid ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800'}`}
            >
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Snowball</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Smallest balance first</p>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Debt-free in</span>
                <span className="font-semibold text-slate-900 dark:text-white">{monthLabel(snowball.months)}</span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Total interest</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(snowball.totalInterestPaid, CURRENCY, LOCALE)}</span>
              </div>
            </div>
          </div>

          {(emphasis === 'general' || emphasis === 'comparison') && (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4 dark:border-slate-800">
              <Stat label="Debt-free in" value={monthLabel(cheaper.months)} />
              <Stat label="Total interest" value={formatCurrency(cheaper.totalInterestPaid, CURRENCY, LOCALE)} />
              <Stat label="Time saved by paying extra" value={extraPayment > 0 && monthsSaved > 0 ? monthLabel(monthsSaved) : '—'} accent />
              <Stat
                label="Interest saved by paying extra"
                value={extraPayment > 0 && interestSaved > 0 ? formatCurrency(interestSaved, CURRENCY, LOCALE) : '—'}
                accent
              />
            </div>
          )}
        </>
      )}
    </div>
  )
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
