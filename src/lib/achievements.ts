import type { Strategy } from './payoff'

export type AchievementId =
  | 'firstDebt'
  | 'budgetSet'
  | 'allStrategies'
  | 'firstPayment'
  | 'committed'
  | 'debtPaidOff'
  | 'explorer'
  | 'reporter'
  | 'cloudSynced'
  | 'scenarioBuilder'

export const ACHIEVEMENT_IDS: AchievementId[] = [
  'firstDebt',
  'budgetSet',
  'allStrategies',
  'firstPayment',
  'committed',
  'debtPaidOff',
  'explorer',
  'reporter',
  'cloudSynced',
  'scenarioBuilder',
]

export const ACHIEVEMENT_EMOJI: Record<AchievementId, string> = {
  firstDebt: '🎯',
  budgetSet: '📝',
  allStrategies: '🧭',
  firstPayment: '💳',
  committed: '🔥',
  debtPaidOff: '🎉',
  explorer: '🌍',
  reporter: '📄',
  cloudSynced: '☁️',
  scenarioBuilder: '🔮',
}

export interface AchievementSignals {
  debtCount: number
  hasEditedBudget: boolean
  triedStrategies: Strategy[]
  paymentCount: number
  debtsPaidOffCount: number
  hasExplored: boolean
  hasDownloadedReport: boolean
  isSignedIn: boolean
  scenarioCount: number
}

const ALL_STRATEGIES: Strategy[] = ['avalanche', 'snowball', 'custom']

export function computeEarnedAchievements(signals: AchievementSignals): Record<AchievementId, boolean> {
  return {
    firstDebt: signals.debtCount > 0,
    budgetSet: signals.hasEditedBudget,
    allStrategies: ALL_STRATEGIES.every((s) => signals.triedStrategies.includes(s)),
    firstPayment: signals.paymentCount > 0,
    committed: signals.paymentCount >= 3,
    debtPaidOff: signals.debtsPaidOffCount > 0,
    explorer: signals.hasExplored,
    reporter: signals.hasDownloadedReport,
    cloudSynced: signals.isSignedIn,
    scenarioBuilder: signals.scenarioCount > 0,
  }
}
