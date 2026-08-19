import { Sparkles } from 'lucide-react'
import { formatCurrency, type PayoffResult } from '../lib/payoff'
import { formatMonthsAsYears, type Translation } from '../lib/i18n'

interface Props {
  extraPayment: number
  onExtraPaymentChange: (value: number) => void
  sliderMax: number
  selected: PayoffResult
  baseline: PayoffResult
  currency: string
  locale: string
  t: Translation
}

export default function Simulator({
  extraPayment,
  onExtraPaymentChange,
  sliderMax,
  selected,
  baseline,
  currency,
  locale,
  t,
}: Props) {
  const monthsSaved = Math.max(0, baseline.months - selected.months)
  const interestSaved = Math.max(0, baseline.totalInterestPaid - selected.totalInterestPaid)

  return (
    <section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm dark:border-violet-900 dark:from-violet-500/10 dark:to-slate-900">
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded-lg bg-violet-500/15 p-1.5 text-violet-600 dark:text-violet-400">
          <Sparkles size={18} />
        </span>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.simulator.heading}</h2>
      </div>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t.simulator.subheading}</p>

      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {t.simulator.examplePrompt(formatCurrency(extraPayment, currency, locale))}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={sliderMax}
        step={10}
        value={Math.min(extraPayment, sliderMax)}
        onChange={(e) => onExtraPaymentChange(Number(e.target.value))}
        className="w-full accent-violet-500"
      />

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4 text-center shadow-sm dark:bg-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-400">{t.simulator.newDebtFreeDate}</p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            {selected.feasible ? selected.payoffDate.toLocaleDateString(locale, { month: 'short', year: 'numeric' }) : '—'}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 text-center shadow-sm dark:bg-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-400">{t.summary.timeSaved}</p>
          <p className="mt-1 text-lg font-bold text-violet-600 dark:text-violet-400">
            {t.simulator.monthsSaved(formatMonthsAsYears(monthsSaved, t))}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 text-center shadow-sm dark:bg-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-400">{t.summary.interestSaved}</p>
          <p className="mt-1 text-lg font-bold text-violet-600 dark:text-violet-400">
            {formatCurrency(interestSaved, currency, locale)}
          </p>
        </div>
      </div>
    </section>
  )
}
