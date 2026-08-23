import { useState } from 'react'
import { BanknoteArrowDown, CreditCard, Trash2 } from 'lucide-react'
import {
  CATEGORY_EMOJI,
  DEBT_CATEGORIES,
  formatCurrency,
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
  /** Omit where there's no payment history yet to log against (e.g. onboarding) — hides the "Log payment" row. */
  onLogPayment?: (debtId: string, amount: number) => void
}

/**
 * The live, editable list of debts already added — kept in the results column so it can
 * grow downward on its own, without pushing the "add a debt" form (DebtsPanel, over in the
 * inputs column) further down the page every time. Every field here is directly editable,
 * and each debt has a "Log payment" action that reduces its balance (and every total that
 * depends on it) immediately, rather than just editing the number by hand.
 */
export default function DebtsList({ debts, currency, locale, t, onChange, onLogPayment }: Props) {
  const symbol = getCurrencySymbol(currency)
  const [paymentDrafts, setPaymentDrafts] = useState<Record<string, string>>({})
  const [justLogged, setJustLogged] = useState<string | null>(null)
  const [paymentErrors, setPaymentErrors] = useState<Record<string, boolean>>({})

  function updateDebt(id: string, patch: Partial<Debt>) {
    onChange(debts.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  function removeDebt(id: string) {
    onChange(debts.filter((d) => d.id !== id))
  }

  function logPayment(debt: Debt) {
    if (!onLogPayment) return
    const raw = paymentDrafts[debt.id]
    const amount = raw !== undefined && raw !== '' ? Number(raw) : debt.minPayment
    if (!(amount > 0)) return
    // A payment can never make a balance negative — reject it here rather than silently
    // clamping to zero, so the difference between "you paid this off" and "you fat-fingered
    // an extra zero" is never lost.
    if (amount > debt.balance) {
      setPaymentErrors((prev) => ({ ...prev, [debt.id]: true }))
      return
    }
    onLogPayment(debt.id, amount)
    setPaymentDrafts((prev) => ({ ...prev, [debt.id]: '' }))
    setPaymentErrors((prev) => ({ ...prev, [debt.id]: false }))
    setJustLogged(debt.id)
    setTimeout(() => setJustLogged((id) => (id === debt.id ? null : id)), 2000)
  }

  function updatePaymentDraft(debtId: string, value: string) {
    setPaymentDrafts((prev) => ({ ...prev, [debtId]: value }))
    setPaymentErrors((prev) => ({ ...prev, [debtId]: false }))
  }

  if (debts.length === 0) return null

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-rose-500/10 p-1.5 text-rose-500">
            <CreditCard size={18} />
          </span>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.debts.heading}</h2>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {t.debts.summary(
            formatCurrency(totalBalance(debts), currency, locale),
            formatCurrency(totalMinPayment(debts), currency, locale),
          )}
        </span>
      </div>

      <ul className="max-h-[36rem] space-y-3 overflow-y-auto pr-1">
        {debts.map((d) => (
          <li key={d.id} className="animate-rise rounded-xl border border-slate-200 p-4 dark:border-slate-800">
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

            {onLogPayment && d.balance > 0 && (
              <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center rounded-lg border bg-slate-50 px-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:bg-slate-800 ${
                      paymentErrors[d.id]
                        ? 'border-rose-400 ring-2 ring-rose-400 dark:border-rose-500'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="mr-1 text-slate-400">{symbol}</span>
                    <input
                      type="number"
                      placeholder={String(d.minPayment)}
                      aria-label={t.debts.paymentAmount}
                      aria-invalid={paymentErrors[d.id] ?? false}
                      value={paymentDrafts[d.id] ?? ''}
                      onChange={(e) => updatePaymentDraft(d.id, e.target.value)}
                      className="w-24 bg-transparent py-1.5 text-sm text-slate-900 outline-none dark:text-white"
                    />
                  </div>
                  <button
                    onClick={() => logPayment(d)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                  >
                    <BanknoteArrowDown size={14} /> {t.debts.logPayment}
                  </button>
                  {justLogged === d.id && (
                    <span role="status" className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {t.debts.paymentLogged(d.name)}
                    </span>
                  )}
                </div>
                {paymentErrors[d.id] && (
                  <p className="mt-1.5 text-xs font-medium text-rose-500">
                    {t.debts.paymentExceedsBalance(formatCurrency(d.balance, currency, locale))}
                  </p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
