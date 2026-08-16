import { useState } from 'react'
import { Plus, Trash2, CreditCard } from 'lucide-react'
import { CATEGORY_META, formatCurrency, makeId, totalBalance, totalMinPayment, type Debt, type DebtCategory } from '../lib/payoff'
import { getCurrencySymbol } from '../lib/currencies'

interface Props {
  debts: Debt[]
  currency: string
  onChange: (debts: Debt[]) => void
  onLoadSample: () => void
}

const emptyDraft = { name: '', category: 'credit-card' as DebtCategory, balance: '', apr: '', minPayment: '' }

export default function DebtsPanel({ debts, currency, onChange, onLoadSample }: Props) {
  const symbol = getCurrencySymbol(currency)
  const [draft, setDraft] = useState(emptyDraft)
  const [showForm, setShowForm] = useState(debts.length === 0)

  function updateDebt(id: string, patch: Partial<Debt>) {
    onChange(debts.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  function removeDebt(id: string) {
    onChange(debts.filter((d) => d.id !== id))
  }

  function addDebt() {
    const balance = Number(draft.balance)
    const apr = Number(draft.apr)
    const minPayment = Number(draft.minPayment)
    if (!draft.name || !(balance > 0) || !(minPayment > 0)) return
    onChange([
      ...debts,
      { id: makeId(), name: draft.name, category: draft.category, balance, apr: apr || 0, minPayment },
    ])
    setDraft(emptyDraft)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-rose-500/10 p-1.5 text-rose-500">
            <CreditCard size={18} />
          </span>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your debts</h2>
        </div>
        {debts.length > 0 && (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {formatCurrency(totalBalance(debts), currency)} total · {formatCurrency(totalMinPayment(debts), currency)}/mo min
          </span>
        )}
      </div>

      {debts.length === 0 && (
        <div className="mb-4 rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">No debts added yet.</p>
          <button
            onClick={onLoadSample}
            className="mt-3 text-sm font-medium text-emerald-600 underline decoration-emerald-400 underline-offset-4 hover:text-emerald-700 dark:text-emerald-400"
          >
            Try it with example data
          </button>
        </div>
      )}

      <ul className="space-y-3">
        {debts.map((d) => (
          <li
            key={d.id}
            className="animate-rise rounded-xl border border-slate-200 p-4 dark:border-slate-800"
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 text-xl leading-none">{CATEGORY_META[d.category].emoji}</span>
              <div className="grid flex-1 grid-cols-2 gap-3">
                <input
                  value={d.name}
                  onChange={(e) => updateDebt(d.id, { name: e.target.value })}
                  className="col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="Debt name"
                />
                <label className="text-xs text-slate-500 dark:text-slate-400">
                  Balance
                  <div className="mt-0.5 flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800">
                    <span className="mr-1 text-slate-400">{symbol}</span>
                    <input
                      type="number"
                      value={d.balance}
                      onChange={(e) => updateDebt(d.id, { balance: Number(e.target.value) || 0 })}
                      className="w-full bg-transparent py-1.5 text-sm text-slate-900 outline-none dark:text-white"
                    />
                  </div>
                </label>
                <label className="text-xs text-slate-500 dark:text-slate-400">
                  APR %
                  <input
                    type="number"
                    step="0.01"
                    value={d.apr}
                    onChange={(e) => updateDebt(d.id, { apr: Number(e.target.value) || 0 })}
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>
                <label className="text-xs text-slate-500 dark:text-slate-400">
                  Min payment
                  <div className="mt-0.5 flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800">
                    <span className="mr-1 text-slate-400">{symbol}</span>
                    <input
                      type="number"
                      value={d.minPayment}
                      onChange={(e) => updateDebt(d.id, { minPayment: Number(e.target.value) || 0 })}
                      className="w-full bg-transparent py-1.5 text-sm text-slate-900 outline-none dark:text-white"
                    />
                  </div>
                </label>
                <label className="text-xs text-slate-500 dark:text-slate-400">
                  Category
                  <select
                    value={d.category}
                    onChange={(e) => updateDebt(d.id, { category: e.target.value as DebtCategory })}
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {Object.entries(CATEGORY_META).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                onClick={() => removeDebt(d.id)}
                aria-label={`Remove ${d.name}`}
                className="mt-1 rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showForm ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
          <div className="grid grid-cols-2 gap-3">
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Name (e.g. Visa Card)"
              className="col-span-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as DebtCategory })}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.emoji} {meta.label}
                </option>
              ))}
            </select>
            <div className="flex items-center rounded-lg border border-slate-200 bg-white px-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900">
              <span className="mr-1 text-slate-400">{symbol}</span>
              <input
                type="number"
                placeholder="Balance"
                value={draft.balance}
                onChange={(e) => setDraft({ ...draft, balance: e.target.value })}
                className="w-full bg-transparent py-1.5 text-sm text-slate-900 outline-none dark:text-white"
              />
            </div>
            <input
              type="number"
              step="0.01"
              placeholder="APR %"
              value={draft.apr}
              onChange={(e) => setDraft({ ...draft, apr: e.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <div className="flex items-center rounded-lg border border-slate-200 bg-white px-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900">
              <span className="mr-1 text-slate-400">{symbol}</span>
              <input
                type="number"
                placeholder="Min payment"
                value={draft.minPayment}
                onChange={(e) => setDraft({ ...draft, minPayment: e.target.value })}
                className="w-full bg-transparent py-1.5 text-sm text-slate-900 outline-none dark:text-white"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={addDebt}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-600"
            >
              <Plus size={14} /> Add debt
            </button>
            {debts.length > 0 && (
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300"
        >
          <Plus size={14} /> Add another debt
        </button>
      )}
    </section>
  )
}
