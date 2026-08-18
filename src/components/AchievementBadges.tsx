import { Award } from 'lucide-react'
import {
  ACHIEVEMENT_EMOJI,
  ACHIEVEMENT_IDS,
  computeEarnedAchievements,
  type AchievementId,
  type AchievementSignals,
} from '../lib/achievements'
import type { Translation } from '../lib/i18n'

interface Props {
  signals: AchievementSignals
  t: Translation
}

type AchievementCopyKey = Exclude<keyof Translation['achievements'], 'heading' | 'subheading' | 'unlocked'>

const COPY_KEY: Record<AchievementId, { title: AchievementCopyKey; desc: AchievementCopyKey }> = {
  firstDebt: { title: 'firstDebtTitle', desc: 'firstDebtDesc' },
  budgetSet: { title: 'budgetSetTitle', desc: 'budgetSetDesc' },
  allStrategies: { title: 'allStrategiesTitle', desc: 'allStrategiesDesc' },
  firstPayment: { title: 'firstPaymentTitle', desc: 'firstPaymentDesc' },
  committed: { title: 'committedTitle', desc: 'committedDesc' },
  debtPaidOff: { title: 'debtPaidOffTitle', desc: 'debtPaidOffDesc' },
  explorer: { title: 'explorerTitle', desc: 'explorerDesc' },
  reporter: { title: 'reporterTitle', desc: 'reporterDesc' },
  cloudSynced: { title: 'cloudSyncedTitle', desc: 'cloudSyncedDesc' },
  scenarioBuilder: { title: 'scenarioBuilderTitle', desc: 'scenarioBuilderDesc' },
}

export default function AchievementBadges({ signals, t }: Props) {
  const earned = computeEarnedAchievements(signals)
  const unlockedCount = ACHIEVEMENT_IDS.filter((id) => earned[id]).length

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-amber-500/10 p-1.5 text-amber-500">
            <Award size={18} />
          </span>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.achievements.heading}</h2>
        </div>
        <span className="text-xs font-medium text-slate-400">
          {t.achievements.unlocked(unlockedCount, ACHIEVEMENT_IDS.length)}
        </span>
      </div>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t.achievements.subheading}</p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {ACHIEVEMENT_IDS.map((id) => {
          const unlocked = earned[id]
          const { title, desc } = COPY_KEY[id]
          return (
            <div
              key={id}
              title={`${t.achievements[title]} — ${t.achievements[desc]}`}
              className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition ${
                unlocked
                  ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-500/10'
                  : 'border-slate-100 opacity-40 grayscale dark:border-slate-800'
              }`}
            >
              <span className="text-2xl leading-none">{ACHIEVEMENT_EMOJI[id]}</span>
              <span className="text-[11px] font-medium leading-tight text-slate-700 dark:text-slate-200">
                {t.achievements[title]}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
