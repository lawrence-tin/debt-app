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
    saves: (amount: string) => string
    debtFreeIn: string
    interestPaid: string
    tooLow: string
  }
  strategyName: Record<Strategy, string>
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
    importPromptTitle: string
    importPromptBody: string
    importYes: string
    importNo: string
  }
}
