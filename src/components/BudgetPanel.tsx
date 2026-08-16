import { Wallet } from 'lucide-react'
import { formatCurrency } from '../lib/payoff'

interface Props {
  monthlyIncome: number
  fixedExpenses: number
  extraPayment: number
  totalMinPayment: number
  onChange: (patch: Partial<{ monthlyIncome: number; fixedExpenses: number; extraPayment: number }>) => void
}

export default function BudgetPanel({
  monthlyIncome,
  fixedExpenses,
  extraPayment,
  totalMinPayment,
  onChange,
}: Props) {
  const totalDebtBudget = totalMinPayment + extraPayment
  const leftover = monthlyIncome - fixedExpenses - totalDebtBudget
  const sliderMax = Math.max(500, Math.round((monthlyIncome - fixedExpenses - totalMinPayment) / 10) * 10 || 500)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-lg bg-sky-500/10 p-1.5 text-sky-500">
          <Wallet size={18} />
        </span>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Income &amp; budget</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="col-span-1 text-sm">
          <span className="mb-1 block font-medium text-slate-600 dark:text-slate-300">Monthly income</span>
          <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800">
            <span className="mr-1 text-slate-400">$</span>
            <input
              type="number"
              min={0}
              value={monthlyIncome || ''}
              onChange={(e) => onChange({ monthlyIncome: Number(e.target.value) || 0 })}
              className="w-full bg-transparent text-slate-900 outline-none dark:text-white"
              placeholder="4,500"
            />
          </div>
        </label>

        <label className="col-span-1 text-sm">
          <span className="mb-1 block font-medium text-slate-600 dark:text-slate-300">Other monthly expenses</span>
          <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800">
            <span className="mr-1 text-slate-400">$</span>
            <input
              type="number"
              min={0}
              value={fixedExpenses || ''}
              onChange={(e) => onChange({ fixedExpenses: Number(e.target.value) || 0 })}
              className="w-full bg-transparent text-slate-900 outline-none dark:text-white"
              placeholder="2,200"
            />
          </div>
        </label>
      </div>

      <div className="mt-5">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Extra toward debt each month</span>
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(extraPayment)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={sliderMax}
          step={10}
          value={Math.min(extraPayment, sliderMax)}
          onChange={(e) => onChange({ extraPayment: Number(e.target.value) })}
          className="w-full accent-emerald-500"
        />
        <p className="mt-1 text-xs text-slate-400">On top of your required minimum payments.</p>
      </div>

      <dl className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-slate-400">Required minimums</dt>
          <dd className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(totalMinPayment)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-slate-400">Total monthly debt budget</dt>
          <dd className="font-semibold text-slate-900 dark:text-white">{formatCurrency(totalDebtBudget)}</dd>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
          <dt className="text-slate-500 dark:text-slate-400">Left over</dt>
          <dd className={`font-semibold ${leftover < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {formatCurrency(leftover)}
          </dd>
        </div>
      </dl>
      {leftover < 0 && (
        <p className="mt-2 text-xs text-rose-500">
          Your budget is running negative — reduce the extra payment or lower other expenses.
        </p>
      )}
    </section>
  )
}
