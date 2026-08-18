import type { DebtCategory, Strategy } from '../payoff'

export type Locale = 'en' | 'es' | 'fr'

export interface Translation {
  meta: {
    /** Browser tab title. */
    documentTitle: string
  }
  app: {
    title: string
    subtitle: string
    startOver: string
    confirmReset: string
    emptyTitle: string
    emptySubtitle: string
    footer: string
  }
  budget: {
    heading: string
    monthlyIncome: string
    monthlyIncomePlaceholder: string
    otherExpenses: string
    otherExpensesPlaceholder: string
    extraToward: string
    extraHint: string
    requiredMinimums: string
    totalBudget: string
    leftOver: string
    negativeWarning: string
  }
  debts: {
    heading: string
    summary: (total: string, min: string) => string
    empty: string
    tryExample: string
    namePlaceholder: string
    balance: string
    apr: string
    minPayment: string
    category: string
    dueDay: string
    dueDayHint: string
    addNamePlaceholder: string
    addDebt: string
    cancel: string
    addAnother: string
    remove: (name: string) => string
  }
  category: Record<DebtCategory, string>
  strategy: {
    heading: string
    subheading: string
    avalancheTitle: string
    avalancheDesc: string
    snowballTitle: string
    snowballDesc: string
    customTitle: string
    customDesc: string
    saves: (amount: string) => string
    debtFreeIn: string
    interestPaid: string
    tooLow: string
  }
  strategyName: Record<Strategy, string>
  priority: {
    heading: string
    subheading: string
    moveUp: (name: string) => string
    moveDown: (name: string) => string
  }
  reminders: {
    heading: string
    dueToday: string
    dueInDays: (n: number) => string
    overdueBy: (n: number) => string
    none: string
    markPaid: string
    paidBadge: string
    undoPaid: string
  }
  report: {
    downloadButton: string
    csvDownloadButton: string
    generating: string
    title: string
    generatedOn: (date: string) => string
    strategyUsed: (strategy: string) => string
    debtsHeading: string
    payoffOrderHeading: string
    disclaimer: string
    dueDayColumn: string
  }
  scenarios: {
    heading: string
    subheading: string
    saveCurrent: string
    namePlaceholder: string
    save: string
    cancel: string
    apply: string
    delete: string
    empty: string
    extraLabel: (amount: string) => string
    strategyLabel: (strategy: string) => string
  }
  achievements: {
    heading: string
    subheading: string
    unlocked: (n: number, total: number) => string
    firstDebtTitle: string
    firstDebtDesc: string
    budgetSetTitle: string
    budgetSetDesc: string
    allStrategiesTitle: string
    allStrategiesDesc: string
    firstPaymentTitle: string
    firstPaymentDesc: string
    committedTitle: string
    committedDesc: string
    debtPaidOffTitle: string
    debtPaidOffDesc: string
    explorerTitle: string
    explorerDesc: string
    reporterTitle: string
    reporterDesc: string
    cloudSyncedTitle: string
    cloudSyncedDesc: string
    scenarioBuilderTitle: string
    scenarioBuilderDesc: string
  }
  calendar: {
    heading: string
    todayLabel: string
    prevMonth: string
    nextMonth: string
    weekdays: [string, string, string, string, string, string, string]
  }
  summary: {
    debtFreeDate: string
    fromNow: (time: string) => string
    increaseBudget: string
    totalInterest: string
    interestSaved: string
    vsMinimums: string
    timeSaved: string
  }
  chart: {
    heading: string
    subheading: (strategy: string) => string
    monthTick: (m: number) => string
    monthLabel: (m: number) => string
  }
  milestones: {
    heading: string
    payoffOrder: string
    clearedIn: (time: string) => string
    celebrate: string
  }
  currency: {
    popular: string
    all: string
    ariaLabel: string
  }
  language: {
    ariaLabel: string
  }
  time: {
    years: (n: number) => string
    months: (n: number) => string
    zero: string
  }
  auth: {
    signIn: string
    signUp: string
    signOut: string
    email: string
    password: string
    confirmPassword: string
    forgotPassword: string
    resetPassword: string
    resetPasswordBody: string
    resetPasswordSent: (email: string) => string
    noAccount: string
    hasAccount: string
    welcomeBack: string
    createAccount: string
    signInCta: string
    signUpCta: string
    sendResetLink: string
    backToSignIn: string
    close: string
    passwordMismatch: string
    passwordTooShort: string
    genericError: string
    rateLimited: string
    emailInUse: string
    invalidCredentials: string
    emailNotConfirmed: string
    invalidEmail: string
    confirmEmailSent: (email: string) => string
    syncing: string
    synced: string
  }
}
