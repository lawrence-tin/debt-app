import { useState } from 'react'
import { Calculator, ChevronDown, Flame, Layers, Percent, PiggyBank, Scale, TrendingUp, Wallet, X } from 'lucide-react'
import type { Translation } from '../lib/i18n'

interface Props {
  t: Translation
  onClose: () => void
}

type TopicKey = keyof Translation['education']['topics']

const TOPIC_ORDER: TopicKey[] = [
  'avalancheVsSnowball',
  'apr',
  'minimumPayments',
  'extraPayments',
  'consolidation',
  'debtReview',
  'affordability',
  'emergencyBuffer',
]

const TOPIC_ICON: Record<TopicKey, typeof Flame> = {
  avalancheVsSnowball: Flame,
  apr: Percent,
  minimumPayments: Wallet,
  extraPayments: TrendingUp,
  consolidation: Layers,
  debtReview: Scale,
  affordability: Calculator,
  emergencyBuffer: PiggyBank,
}

export default function EducationCenter({ t, onClose }: Props) {
  const [openTopic, setOpenTopic] = useState<TopicKey | null>(TOPIC_ORDER[0])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-2xl animate-rise overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.education.heading}</h2>
            <p className="mt-0.5 max-w-md text-xs text-slate-500 dark:text-slate-400">{t.education.subheading}</p>
          </div>
          <button
            onClick={onClose}
            aria-label={t.education.closeLabel}
            className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        <div className="divide-y divide-slate-100 px-2 dark:divide-slate-800">
          {TOPIC_ORDER.map((key) => {
            const topic = t.education.topics[key]
            const Icon = TOPIC_ICON[key]
            const isOpen = openTopic === key
            return (
              <div key={key}>
                <button
                  onClick={() => setOpenTopic(isOpen ? null : key)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left"
                >
                  <span className="rounded-lg bg-slate-100 p-1.5 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <Icon size={16} />
                  </span>
                  <span className="flex-1 font-medium text-slate-900 dark:text-white">{topic.title}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="animate-rise space-y-2 px-4 pb-5 pl-[3.25rem] text-sm text-slate-600 dark:text-slate-300">
                    {topic.body.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
