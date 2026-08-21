import type { DebtCategory, Strategy } from '../payoff'

export type Locale = 'en' | 'zu' | 'af'

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
    /** Heading over the "add a debt" form now that it lives in its own place, separate from the list. */
    addHeading: string
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
    addValidation: string
    cancel: string
    addAnother: string
    remove: (name: string) => string
    /** Button that logs a payment against a debt's balance (distinct from Reminders' due-date "mark paid"). */
    logPayment: string
    paymentAmount: string
    paymentLogged: (name: string) => string
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
  language: {
    ariaLabel: string
  }
  time: {
    years: (n: number) => string
    months: (n: number) => string
    zero: string
  }
  hero: {
    debtRemaining: string
    progress: (percent: number) => string
    paymentTarget: string
    paidThisMonth: string
    nextMilestoneLabel: string
  }
  simulator: {
    heading: string
    subheading: string
    examplePrompt: (amount: string) => string
    monthsSaved: (n: string) => string
    newDebtFreeDate: string
  }
  recommendation: {
    heading: string
    saves: (cheaper: string, amount: string, other: string) => string
    equal: string
    reasoningAvalanche: string
    reasoningSnowball: string
    disclaimer: string
  }
  affordability: {
    heading: string
    subheading: string
    availableLabel: string
    onTrackTitle: string
    onTrackDesc: string
    underPressureTitle: string
    underPressureDesc: string
    unaffordableTitle: string
    unaffordableDesc: string
    neutralGuidance: string
  }
  assumptions: {
    heading: string
    items: [string, string, string, string, string, string]
  }
  privacy: {
    badge: string
    title: string
    message: string
  }
  plus: {
    badge: string
    heading: string
    subheading: string
    previewNote: string
    monthly: string
    annual: string
    perMonth: string
    perYear: string
    saveBadge: (percent: number) => string
    freeTitle: string
    freePrice: string
    freeFeatures: [string, string, string]
    plusTitle: string
    plusFeatures: [string, string, string, string, string]
    emailPlaceholder: string
    notifyButton: string
    joining: string
    joinedTitle: string
    joinedBody: string
    errorGeneric: string
    errorInvalidEmail: string
    notConfigured: string
    closeLabel: string
  }
  education: {
    openLabel: string
    heading: string
    subheading: string
    closeLabel: string
    topics: {
      avalancheVsSnowball: { title: string; body: [string, string, string, string] }
      apr: { title: string; body: [string, string, string] }
      minimumPayments: { title: string; body: [string, string, string] }
      extraPayments: { title: string; body: [string, string, string] }
      consolidation: { title: string; body: [string, string, string] }
      debtReview: { title: string; body: [string, string, string] }
      affordability: { title: string; body: [string, string, string] }
      emergencyBuffer: { title: string; body: [string, string, string] }
    }
  }
  onboarding: {
    stepOf: (step: number, total: number) => string
    back: string
    next: string
    skipToDashboard: string
    welcomeTitle: string
    welcomeSubtitle: string
    getStarted: string
    incomeTitle: string
    incomeSubtitle: string
    expensesTitle: string
    expensesSubtitle: string
    debtsTitle: string
    debtsSubtitle: string
    debtsContinue: string
    debtsNeedOne: string
    calculatingTitle: string
    calculatingSubtitle: string
    revealTitle: string
    revealSubtitle: string
    revealContinue: string
    compareTitle: string
    compareSubtitle: string
    optimizeTitle: string
    optimizeSubtitle: string
    commitTitle: string
    commitSubtitle: string
    commitLocal: string
    commitAccount: string
    goToDashboard: string
  }
  checkIn: {
    heading: string
    tooSoon: (date: string) => string
    reducedAhead: (reduced: string, since: string, ahead: string) => string
    reducedBehind: (reduced: string, since: string, behind: string) => string
    reducedOnTrack: (reduced: string, since: string) => string
    debtFree: string
    dateEarlier: (months: string) => string
    dateLater: (months: string) => string
    dateUnchanged: string
    nextMilestone: (percent: number, when: string) => string
    behindNudge: string
    resetBaseline: string
    confirmResetBaseline: string
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
