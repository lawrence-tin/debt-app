import { useState } from 'react'
import { Plus, CreditCard } from 'lucide-react'
import { CATEGORY_EMOJI, DEBT_CATEGORIES, makeId, type Debt, type DebtCategory } from '../lib/payoff'
import { getCurrencySymbol } from '../lib/currencies'
import type { Translation } from '../lib/i18n'

interface Props {
  debts: Debt[]
  currency: string
  t: Translation
  onChange: (debts: Debt[]) => void
  onLoadSample: () => void
}

const emptyDraft = { name: '', category: 'credit-card' as DebtCategory, balance: '', apr: '', minPayment: '', dueDay: '' }

/**
 * Just the "add a debt" form now — the growing list of already-added debts lives in
 * DebtsList, over in the results column. Keeping this form on its own means it stays put
 * at a fixed size as you add debts, instead of getting pushed further down the page by an
 * ever-extending list sitting right underneath it.
 */
export default function DebtsPanel({ debts, currency, t, onChange, onLoadSample }: Props) {
  const symbol = getCurrencySymbol(currency)
  const [draft, setDraft] = useState(emptyDraft)
  const [showError, setShowError] = useState(false)

  function updateDraft(patch: Partial<typeof emptyDraft>) {
    setDraft((d) => ({ ...d, ...patch }))
    setShowError(false)
  }

  const balanceInvalid = showError && !(Number(draft.balance) > 0)
  const minPaymentInvalid = showError && !(Number(draft.minPayment) > 0)
  const invalidRing = 'ring-2 ring-rose-400 border-rose-400 dark:border-rose-500'

  function addDebt() {
    const balance = Number(draft.balance)
    const apr = Number(draft.apr)
    const minPayment = Number(draft.minPayment)
    const dueDay = Number(draft.dueDay)
    if (!(balance > 0) || !(minPayment > 0)) {
      setShowError(true)
      return
    }
    // Name is optional — picking a category is enough to identify the debt if the
    // user doesn't want to type a custom nickname for it.
    const name = draft.name.trim() || t.category[draft.category]
    onChange([
      ...debts,
      {
        id: makeId(),
        name,
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
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-lg bg-rose-500/10 p-1.5 text-rose-500">
          <CreditCard size={18} />
        </span>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.debts.addHeading}</h2>
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

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="grid grid-cols-2 gap-3">
          <input
            value={draft.name}
            onChange={(e) => updateDraft({ name: e.target.value })}
            placeholder={t.debts.addNamePlaceholder}
            className="col-span-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
        <button
          onClick={addDebt}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-600"
        >
          <Plus size={14} /> {debts.length === 0 ? t.debts.addDebt : t.debts.addAnother}
        </button>
      </div>
    </section>
  )
}
