import { CalendarClock, RotateCcw } from 'lucide-react'
import { computeCheckIn, type PlanBaseline } from '../lib/checkIn'
import { formatCurrency, monthAtProgress, totalBalance, type Debt, type PayoffResult } from '../lib/payoff'
import { formatMonthsAsYears, type Translation } from '../lib/i18n'

interface Props {
  debts: Debt[]
  baseline: PlanBaseline
  liveResult: PayoffResult
  currency: string
  locale: string
  t: Translation
  onResetBaseline: () => void
}

const STATUS_COLOR: Record<string, string> = {
  ahead: 'text-emerald-700 dark:text-emerald-400',
  behind: 'text-amber-700 dark:text-amber-400',
  'on-track': 'text-slate-800 dark:text-slate-100',
  'debt-free': 'text-emerald-700 dark:text-emerald-400',
  'too-soon': 'text-slate-600 dark:text-slate-300',
}

export default function MonthlyCheckIn({ debts, baseline, liveResult, currency, locale, t, onResetBaseline }: Props) {
  const checkIn = computeCheckIn(baseline, debts, liveResult)
  const since = checkIn.startedAt.toLocaleDateString(locale, { month: 'long', year: 'numeric' })

  function handleReset() {
    if (confirm(t.checkIn.confirmResetBaseline)) onResetBaseline()
  }

  // Next near-term win, measured from today's balance rather than lifetime progress —
  // same convention as the Milestones panel, so the two never disagree with each other.
  const nextMilestoneMonth = monthAtProgress(liveResult, totalBalance(debts), 0.25)
  const nextMilestoneDate = nextMilestoneMonth !== null ? new Date() : null
  if (nextMilestoneDate && nextMilestoneMonth !== null) nextMilestoneDate.setMonth(nextMilestoneDate.getMonth() + nextMilestoneMonth)

  return (
    <section className="rounded-2xl border border-sky-200 bg-sky-50 p-6 shadow-sm dark:border-sky-900 dark:bg-sky-500/10">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-lg bg-sky-500/20 p-1.5 text-sky-700 dark:text-sky-400">
          <CalendarClock size={18} />
        </span>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.checkIn.heading}</h2>
      </div>

      {checkIn.status === 'debt-free' ? (
        <p className={`text-sm font-semibold ${STATUS_COLOR['debt-free']}`}>{t.checkIn.debtFree}</p>
      ) : checkIn.status === 'too-soon' ? (
        <p className={`text-sm ${STATUS_COLOR['too-soon']}`}>{t.checkIn.tooSoon(since)}</p>
      ) : (
        <div className="space-y-1.5 text-sm">
          <p className={`font-medium ${STATUS_COLOR[checkIn.status]}`}>
            {checkIn.status === 'ahead'
              ? t.checkIn.reducedAhead(
                  formatCurrency(Math.max(0, checkIn.actualReduced), currency, locale),
                  since,
                  formatCurrency(Math.abs(checkIn.differenceAmount), currency, locale),
                )
              : checkIn.status === 'behind'
                ? t.checkIn.reducedBehind(
                    formatCurrency(Math.max(0, checkIn.actualReduced), currency, locale),
                    since,
                    formatCurrency(Math.abs(checkIn.differenceAmount), currency, locale),
                  )
                : t.checkIn.reducedOnTrack(formatCurrency(Math.max(0, checkIn.actualReduced), currency, locale), since)}
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            {checkIn.dateShiftMonths < 0
              ? t.checkIn.dateEarlier(formatMonthsAsYears(Math.abs(checkIn.dateShiftMonths), t))
              : checkIn.dateShiftMonths > 0
                ? t.checkIn.dateLater(formatMonthsAsYears(checkIn.dateShiftMonths, t))
                : t.checkIn.dateUnchanged}
          </p>
          {nextMilestoneDate && (
            <p className="text-slate-500 dark:text-slate-400">
              {t.checkIn.nextMilestone(25, nextMilestoneDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' }))}
            </p>
          )}
          {checkIn.status === 'behind' && <p className="text-amber-700 dark:text-amber-400">{t.checkIn.behindNudge}</p>}
        </div>
      )}

      <button
        onClick={handleReset}
        className="mt-3 inline-flex items-center gap-1 text-xs text-slate-400 underline decoration-slate-300 underline-offset-2 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
      >
        <RotateCcw size={11} /> {t.checkIn.resetBaseline}
      </button>
    </section>
  )
}
