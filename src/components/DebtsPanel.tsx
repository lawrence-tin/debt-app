import { useState } from 'react'
import { Plus, Trash2, CreditCard } from 'lucide-react'
import {
  CATEGORY_EMOJI,
  DEBT_CATEGORIES,
  formatCurrency,
  makeId,
  totalBalance,
  totalMinPayment,
  type Debt,
  type DebtCategory,
} from '../lib/payoff'
import { getCurrencySymbol } from '../lib/currencies'
import type { Translation } from '../lib/i18n'

interface Props {
  debts: Debt[]
  currency: string
  locale: string
  t: Translation
  onChange: (debts: Debt[]) => void
  onLoadSample: () => void
}

const emptyDraft = { name: '', category: 'credit-card' as DebtCategory, balance: '', apr: '', minPayment: '', dueDay: '' }

export default function DebtsPanel({ debts, currency, locale, t, onChange, onLoadSample }: Props) {
  const symbol = getCurrencySymbol(currency)
  const [draft, setDraft] = useState(emptyDraft)
  const [showForm, setShowForm] = useState(debts.length === 0)
  const [showError, setShowError] = useState(false)

  function updateDraft(patch: Partial<typeof emptyDraft>) {
    setDraft((d) => ({ ...d, ...patch }))
    setShowError(false)
  }

  function updateDebt(id: string, patch: Partial<Debt>) {
    onChange(debts.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  function removeDebt(id: string) {
    onChange(debts.filter((d) => d.id !== id))
  }

  const nameInvalid = showError && !draft.name
  const balanceInvalid = showError && !(Number(draft.balance) > 0)
  const minPaymentInvalid = showError && !(Number(draft.minPayment) > 0)
  const invalidRing = 'ring-2 ring-rose-400 border-rose-400 dark:border-rose-500'

  function addDebt() {
    const balance = Number(draft.balance)
    const apr = Number(draft.apr)
    const minPayment = Number(draft.minPayment)
    const dueDay = Number(draft.dueDay)
    if (!draft.name || !(balance > 0) || !(minPayment > 0)) {
      setShowError(true)
      return
    }
    onChange([
      ...debts,
      {
        id: makeId(),
        name: draft.name,
        category: draft.category,
        balance,
        originalBalance: balance,
        apr: apr || 0,
        minPayment,
        dueDay: dueDay >= 1 && dueDay <= 31 ? dueDay : undefined,
      },
    ])
    setDraft(emptyDraft)
    setShowError(false)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-rose-500/10 p-1.5 text-rose-500">
            <CreditCard size={18} />
          </span>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.debts.heading}</h2>
        </div>
        {debts.length > 0 && (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {t.debts.summary(
              formatCurrency(totalBalance(debts), currency, locale),
              formatCurrency(totalMinPayment(debts), currency, locale),
            )}
          </span>
        )}
      </div>

      {debts.length === 0 && (
        <div className="mb-4 rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.debts.empty}</p>
          <button
            onClick={onLoadSample}
            className="mt-3 text-sm font-medium text-emerald-600 underline decoration-emerald-400 underline-offset-4 hover:text-emerald-700 dark:text-emerald-400"
          >
            {t.debts.tryExample}
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
              <span className="mt-1 text-xl leading-none">{CATEGORY_EMOJI[d.category]}</span>
              <div className="grid flex-1 grid-cols-2 gap-3">
                <input
                  value={d.name}
                  onChange={(e) => updateDebt(d.id, { name: e.target.value })}
                  className="col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder={t.debts.namePlaceholder}
                />
                <label className="text-xs text-slate-500 dark:text-slate-400">
                  {t.debts.balance}
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
                  {t.debts.apr}
                  <input
                    type="number"
                    step="0.01"
                    value={d.apr}
                    onChange={(e) => updateDebt(d.id, { apr: Number(e.target.value) || 0 })}
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>
                <label className="text-xs text-slate-500 dark:text-slate-400">
                  {t.debts.minPayment}
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
                <label className="text-xs text-slate-500 dark:text-slate-400" title={t.debts.dueDayHint}>
                  {t.debts.dueDay}
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={d.dueDay ?? ''}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      updateDebt(d.id, { dueDay: v >= 1 && v <= 31 ? v : undefined })
                    }}
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>
                <label className="col-span-2 text-xs text-slate-500 dark:text-slate-400">
                  {t.debts.category}
                  <select
                    value={d.category}
                    onChange={(e) => updateDebt(d.id, { category: e.target.value as DebtCategory })}
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {DEBT_CATEGORIES.map((key) => (
                      <option key={key} value={key}>
                        {t.category[key]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                onClick={() => removeDebt(d.id)}
                aria-label={t.debts.remove(d.name)}
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
              onChange={(e) => updateDraft({ name: e.target.value })}
              placeholder={t.debts.addNamePlaceholder}
              aria-invalid={nameInvalid}
              className={`col-span-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${nameInvalid ? invalidRing : ''}`}
            />
            <select
              value={draft.category}
              onChange={(e) => updateDraft({ category: e.target.value as DebtCategory })}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {DEBT_CATEGORIES.map((key) => (
                <option key={key} value={key}>
                  {CATEGORY_EMOJI[key]} {t.category[key]}
                </option>
              ))}
            </select>
            <div
              className={`flex items-center rounded-lg border border-slate-200 bg-white px-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 ${balanceInvalid ? invalidRing : ''}`}
            >
              <span className="mr-1 text-slate-400">{symbol}</span>
              <input
                type="number"
                placeholder={t.debts.balance}
                value={draft.balance}
                onChange={(e) => updateDraft({ balance: e.target.value })}
                aria-invalid={balanceInvalid}
                className="w-full bg-transparent py-1.5 text-sm text-slate-900 outline-none dark:text-white"
              />
            </div>
            <input
              type="number"
              step="0.01"
              placeholder={t.debts.apr}
              value={draft.apr}
              onChange={(e) => updateDraft({ apr: e.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <div
              className={`flex items-center rounded-lg border border-slate-200 bg-white px-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 ${minPaymentInvalid ? invalidRing : ''}`}
            >
              <span className="mr-1 text-slate-400">{symbol}</span>
              <input
                type="number"
                placeholder={t.debts.minPayment}
                value={draft.minPayment}
                onChange={(e) => updateDraft({ minPayment: e.target.value })}
                aria-invalid={minPaymentInvalid}
                className="w-full bg-transparent py-1.5 text-sm text-slate-900 outline-none dark:text-white"
              />
            </div>
            <input
              type="number"
              min={1}
              max={31}
              placeholder={t.debts.dueDay}
              title={t.debts.dueDayHint}
              value={draft.dueDay}
              onChange={(e) => updateDraft({ dueDay: e.target.value })}
              className="col-span-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          {showError && <p className="mt-2 text-xs font-medium text-rose-500">{t.debts.addValidation}</p>}
          <div className="mt-3 flex gap-2">
            <button
              onClick={addDebt}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-600"
            >
              <Plus size={14} /> {t.debts.addDebt}
            </button>
            {debts.length > 0 && (
              <button
                onClick={() => {
                  setShowForm(false)
                  setShowError(false)
                }}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {t.debts.cancel}
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300"
        >
          <Plus size={14} /> {t.debts.addAnother}
        </button>
      )}
    </section>
  )
}
