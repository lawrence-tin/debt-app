import { ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react'
import { computeAffordability } from '../lib/affordability'
import { formatCurrency } from '../lib/payoff'
import type { Translation } from '../lib/i18n'

interface Props {
  monthlyIncome: number
  fixedExpenses: number
  totalMinPayment: number
  currency: string
  locale: string
  t: Translation
}

const STYLES = {
  'on-track': {
    icon: ShieldCheck,
    border: 'border-emerald-200 dark:border-emerald-900',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  'under-pressure': {
    icon: ShieldAlert,
    border: 'border-amber-200 dark:border-amber-900',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  unaffordable: {
    icon: ShieldX,
    border: 'border-rose-200 dark:border-rose-900',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
} as const

export default function Affordability({ monthlyIncome, fixedExpenses, totalMinPayment, currency, locale, t }: Props) {
  const { available, state } = computeAffordability(monthlyIncome, fixedExpenses, totalMinPayment)
  const style = STYLES[state]
  const Icon = style.icon

  const title =
    state === 'on-track' ? t.affordability.onTrackTitle : state === 'under-pressure' ? t.affordability.underPressureTitle : t.affordability.unaffordableTitle
  const desc =
    state === 'on-track' ? t.affordability.onTrackDesc : state === 'under-pressure' ? t.affordability.underPressureDesc : t.affordability.unaffordableDesc

  return (
    <section className={`rounded-2xl border p-6 shadow-sm ${style.border} ${style.bg}`}>
      <div className="mb-1 flex items-center gap-2">
        <Icon size={18} className={style.iconColor} />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.affordability.heading}</h2>
      </div>
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{t.affordability.subheading}</p>

      <div className="mb-3 flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 text-sm dark:bg-slate-900/40">
        <span className="text-slate-500 dark:text-slate-400">{t.affordability.availableLabel}</span>
        <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(available, currency, locale)}</span>
      </div>

      <p className={`font-semibold ${style.iconColor}`}>{title}</p>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{desc}</p>
      {state !== 'on-track' && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t.affordability.neutralGuidance}</p>
      )}
    </section>
  )
}
