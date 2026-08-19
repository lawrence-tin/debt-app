import { Lightbulb } from 'lucide-react'
import { formatCurrency, type PayoffResult } from '../lib/payoff'
import type { Translation } from '../lib/i18n'

interface Props {
  avalanche: PayoffResult
  snowball: PayoffResult
  currency: string
  locale: string
  t: Translation
}

export default function Recommendation({ avalanche, snowball, currency, locale, t }: Props) {
  if (!avalanche.feasible || !snowball.feasible) return null

  const diff = avalanche.totalInterestPaid - snowball.totalInterestPaid
  const cheaper = diff <= 0 ? 'avalanche' : 'snowball'
  const amount = Math.abs(diff)
  const isEqual = amount < 1

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm dark:border-amber-900 dark:bg-amber-500/10">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-lg bg-amber-500/20 p-1.5 text-amber-600 dark:text-amber-400">
          <Lightbulb size={18} />
        </span>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.recommendation.heading}</h2>
      </div>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
        {isEqual
          ? t.recommendation.equal
          : t.recommendation.saves(
              t.strategyName[cheaper],
              formatCurrency(amount, currency, locale),
              t.strategyName[cheaper === 'avalanche' ? 'snowball' : 'avalanche'],
            )}
      </p>
      {!isEqual && (
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
          {cheaper === 'avalanche' ? t.recommendation.reasoningAvalanche : t.recommendation.reasoningSnowball}
        </p>
      )}
      <p className="mt-3 text-xs italic text-slate-500 dark:text-slate-400">{t.recommendation.disclaimer}</p>
    </section>
  )
}
