import { useState } from 'react'
import { Wallet } from 'lucide-react'
import { formatCurrency } from '../lib/payoff'
import { getCurrencySymbol } from '../lib/currencies'
import type { Translation } from '../lib/i18n'

interface Props {
  monthlyIncome: number
  fixedExpenses: number
  extraPayment: number
  totalMinPayment: number
  currency: string
  locale: string
  t: Translation
  onChange: (patch: Partial<{ monthlyIncome: number; fixedExpenses: number; extraPayment: number }>) => void
}

export default function BudgetPanel({
  monthlyIncome,
  fixedExpenses,
  extraPayment,
  totalMinPayment,
  currency,
  locale,
  t,
  onChange,
}: Props) {
  const totalDebtBudget = totalMinPayment + extraPayment
  const leftover = monthlyIncome - fixedExpenses - totalDebtBudget
  const symbol = getCurrencySymbol(currency)

  const [incomeError, setIncomeError] = useState(false)
  const [expensesError, setExpensesError] = useState(false)

  // A negative amount is rejected outright rather than accepted and clamped: the field
  // simply never updates (so a typed "-" can't persist past the digit that makes the
  // number negative), and pasting a negative value in one go surfaces the error below.
  function handleIncomeChange(raw: string) {
    const parsed = Number(raw)
    if (parsed < 0) {
      setIncomeError(true)
      return
    }
    setIncomeError(false)
    onChange({ monthlyIncome: parsed || 0 })
  }

  function handleExpensesChange(raw: string) {
    const parsed = Number(raw)
    if (parsed < 0) {
      setExpensesError(true)
      return
    }
    setExpensesError(false)
    onChange({ fixedExpenses: parsed || 0 })
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-lg bg-sky-500/10 p-1.5 text-sky-500">
          <Wallet size={18} />
        </span>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.budget.heading}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="col-span-1 text-sm">
          <span className="mb-1 block font-medium text-slate-600 dark:text-slate-300">{t.budget.monthlyIncome}</span>
          <div
            className={`flex items-center rounded-lg border bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:bg-slate-800 ${
              incomeError ? 'border-rose-400 ring-2 ring-rose-400 dark:border-rose-500' : 'border-slate-300 dark:border-slate-700'
            }`}
          >
            <span className="mr-1 text-slate-400">{symbol}</span>
            <input
              type="number"
              min={0}
              value={monthlyIncome || ''}
              aria-invalid={incomeError}
              onChange={(e) => handleIncomeChange(e.target.value)}
              className="w-full bg-transparent text-slate-900 outline-none dark:text-white"
              placeholder={t.budget.monthlyIncomePlaceholder}
            />
          </div>
          {incomeError && <p className="mt-1 text-xs font-medium text-rose-500">{t.budget.negativeIncomeError}</p>}
        </label>

        <label className="col-span-1 text-sm">
          <span className="mb-1 block font-medium text-slate-600 dark:text-slate-300">{t.budget.otherExpenses}</span>
          <div
            className={`flex items-center rounded-lg border bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:bg-slate-800 ${
              expensesError ? 'border-rose-400 ring-2 ring-rose-400 dark:border-rose-500' : 'border-slate-300 dark:border-slate-700'
            }`}
          >
            <span className="mr-1 text-slate-400">{symbol}</span>
            <input
              type="number"
              min={0}
              value={fixedExpenses || ''}
              aria-invalid={expensesError}
              onChange={(e) => handleExpensesChange(e.target.value)}
              className="w-full bg-transparent text-slate-900 outline-none dark:text-white"
              placeholder={t.budget.otherExpensesPlaceholder}
            />
          </div>
          {expensesError && <p className="mt-1 text-xs font-medium text-rose-500">{t.budget.negativeExpensesError}</p>}
        </label>
      </div>

      <dl className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-slate-400">{t.budget.requiredMinimums}</dt>
          <dd className="font-medium text-slate-800 dark:text-slate-100">
            {formatCurrency(totalMinPayment, currency, locale)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-slate-400">{t.budget.extraToward}</dt>
          <dd className="font-medium text-slate-800 dark:text-slate-100">
            {formatCurrency(extraPayment, currency, locale)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-slate-400">{t.budget.totalBudget}</dt>
          <dd className="font-semibold text-slate-900 dark:text-white">
            {formatCurrency(totalDebtBudget, currency, locale)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
          <dt className="text-slate-500 dark:text-slate-400">{t.budget.leftOver}</dt>
          <dd className={`font-semibold ${leftover < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {formatCurrency(leftover, currency, locale)}
          </dd>
        </div>
      </dl>
      {leftover < 0 && <p className="mt-2 text-xs text-rose-500">{t.budget.negativeWarning}</p>}
      <p className="mt-2 text-xs text-slate-400">{t.simulator.heading} ↓</p>
    </section>
  )
}
