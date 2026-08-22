import { CalendarClock, Equal, RotateCcw, TrendingDown, TrendingUp } from 'lucide-react'
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

const BAR_COLOR: Record<string, string> = {
  ahead: 'bg-emerald-500',
  behind: 'bg-amber-500',
  'on-track': 'bg-sky-500',
}

/** Percent of the baseline's starting balance a reduced amount represents, clamped to a sane 0–100 bar width. */
function pct(reduced: number, baselineTotal: number): number {
  if (baselineTotal <= 0) return 0
  return Math.max(0, Math.min(100, (reduced / baselineTotal) * 100))
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

  // The hero number is always the most flattering-but-honest one available: the ahead/behind
  // gap when there is one, or the total reduced so far when there isn't (still worth seeing).
  const heroAmount = checkIn.status === 'on-track' ? checkIn.actualReduced : Math.abs(checkIn.differenceAmount)
  const heroLabel =
    checkIn.status === 'ahead' ? t.checkIn.heroLabelAhead : checkIn.status === 'behind' ? t.checkIn.heroLabelBehind : t.checkIn.heroLabelOnTrack
  const HeroIcon = checkIn.status === 'ahead' ? TrendingUp : checkIn.status === 'behind' ? TrendingDown : Equal

  return (
    <section className="rounded-2xl border border-sky-200 bg-sky-50 p-6 shadow-sm dark:border-sky-900 dark:bg-sky-500/10">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-lg bg-sky-500/20 p-1.5 text-sky-700 dark:text-sky-400">
          <CalendarClock size={18} />
        </span>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.checkIn.heading}</h2>
      </div>

      {checkIn.status === 'debt-free' ? (
        <p className={`text-xl font-bold ${STATUS_COLOR['debt-free']}`}>{t.checkIn.debtFree}</p>
      ) : checkIn.status === 'too-soon' ? (
        <p className={`text-sm ${STATUS_COLOR['too-soon']}`}>{t.checkIn.tooSoon(since)}</p>
      ) : (
        <div>
          <div className="flex items-center gap-2">
            <HeroIcon size={22} className={STATUS_COLOR[checkIn.status]} />
            <p className={`text-3xl font-bold tracking-tight tabular-nums ${STATUS_COLOR[checkIn.status]}`}>
              {formatCurrency(heroAmount, currency, locale)}
            </p>
          </div>
          <p className={`mt-0.5 text-sm font-medium ${STATUS_COLOR[checkIn.status]}`}>{heroLabel}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {t.checkIn.sinceCaption(since, formatMonthsAsYears(checkIn.monthsElapsed, t))}
          </p>

          {baseline.totalBalance > 0 && (
            <div className="mt-4 space-y-2.5">
              <div>
                <div className="mb-1 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{t.checkIn.expectedLabel}</span>
                  <span className="tabular-nums">{formatCurrency(checkIn.expectedReduced, currency, locale)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/70 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-slate-400 dark:bg-slate-500"
                    style={{ width: `${pct(checkIn.expectedReduced, baseline.totalBalance)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{t.checkIn.actualLabel}</span>
                  <span className={`tabular-nums font-medium ${STATUS_COLOR[checkIn.status]}`}>
                    {formatCurrency(checkIn.actualReduced, currency, locale)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/70 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${BAR_COLOR[checkIn.status]}`}
                    style={{ width: `${pct(checkIn.actualReduced, baseline.totalBalance)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 space-y-1 text-sm">
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
