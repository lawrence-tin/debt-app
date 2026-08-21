import { supabase } from './supabase'
import type { Debt, DebtCategory, Strategy } from './payoff'
import type { Locale } from './i18n'
import type { Payment } from './reminders'
import type { Scenario } from './scenarios'
import type { PlanBaseline } from './checkIn'

export interface CloudSettings {
  monthlyIncome: number
  fixedExpenses: number
  extraPayment: number
  strategy: Strategy
  priorityOrder: string[]
  currency: string
  language: Locale
  theme: 'light' | 'dark'
  triedStrategies: Strategy[]
  hasDownloadedReport: boolean
  planBaseline: PlanBaseline | null
}

interface DebtRow {
  id: string
  name: string
  category: DebtCategory
  balance: number
  original_balance: number | null
  apr: number
  min_payment: number
  due_day: number | null
}

interface SettingsRow {
  monthly_income: number
  fixed_expenses: number
  extra_payment: number
  strategy: Strategy
  priority_order: string[] | null
  currency: string
  language: Locale
  theme: 'light' | 'dark'
  tried_strategies: Strategy[] | null
  has_downloaded_report: boolean | null
  plan_baseline: PlanBaseline | null
}

interface PaymentRow {
  id: string
  debt_id: string
  amount: number
  period: string
  paid_at: string
}

interface ScenarioRow {
  id: string
  name: string
  extra_payment: number
  strategy: Strategy
  priority_order: string[] | null
  created_at: string
}

function rowToDebt(row: DebtRow): Debt {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    balance: row.balance,
    originalBalance: row.original_balance ?? undefined,
    apr: row.apr,
    minPayment: row.min_payment,
    dueDay: row.due_day ?? undefined,
  }
}

function debtToRow(userId: string, debt: Debt) {
  return {
    id: debt.id,
    user_id: userId,
    name: debt.name,
    category: debt.category,
    balance: debt.balance,
    original_balance: debt.originalBalance ?? debt.balance,
    apr: debt.apr,
    min_payment: debt.minPayment,
    due_day: debt.dueDay ?? null,
  }
}

function rowToScenario(row: ScenarioRow): Scenario {
  return {
    id: row.id,
    name: row.name,
    extraPayment: row.extra_payment,
    strategy: row.strategy,
    priorityOrder: row.priority_order ?? [],
    createdAt: row.created_at,
  }
}

export async function fetchCloudDebts(userId: string): Promise<Debt[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('debts').select('*').eq('user_id', userId).order('created_at')
  if (error) throw error
  return (data as DebtRow[]).map(rowToDebt)
}

export async function fetchCloudSettings(userId: string): Promise<CloudSettings | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('settings').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  if (!data) return null
  const row = data as SettingsRow
  return {
    monthlyIncome: row.monthly_income,
    fixedExpenses: row.fixed_expenses,
    extraPayment: row.extra_payment,
    strategy: row.strategy,
    priorityOrder: row.priority_order ?? [],
    currency: row.currency,
    language: row.language,
    theme: row.theme,
    triedStrategies: row.tried_strategies ?? [],
    hasDownloadedReport: row.has_downloaded_report ?? false,
    planBaseline: row.plan_baseline ?? null,
  }
}

export async function insertDebtRemote(userId: string, debt: Debt): Promise<void> {
  if (!supabase) return
  // Upsert rather than insert: if the same debt is pushed twice concurrently (e.g. the
  // confirmation link opened in a second tab, racing the original tab's initial sync via
  // Supabase's cross-tab auth sync), this is a harmless no-op instead of a conflict error.
  const { error } = await supabase.from('debts').upsert(debtToRow(userId, debt), { onConflict: 'id' })
  if (error) throw error
}

export async function updateDebtRemote(userId: string, debt: Debt): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('debts')
    .update({
      name: debt.name,
      category: debt.category,
      balance: debt.balance,
      original_balance: debt.originalBalance ?? debt.balance,
      apr: debt.apr,
      min_payment: debt.minPayment,
      due_day: debt.dueDay ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', debt.id)
    .eq('user_id', userId)
  if (error) throw error
}

export async function deleteDebtRemote(userId: string, debtId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('debts').delete().eq('id', debtId).eq('user_id', userId)
  if (error) throw error
}

/** Diffs two debt arrays by id and pushes only the inserts/updates/deletes needed to sync `after` to the cloud. */
export async function syncDebtsDiff(userId: string, before: Debt[], after: Debt[]): Promise<void> {
  const beforeById = new Map(before.map((d) => [d.id, d]))
  const afterIds = new Set(after.map((d) => d.id))

  const ops: Promise<void>[] = []
  for (const d of after) {
    const prev = beforeById.get(d.id)
    if (!prev) {
      ops.push(insertDebtRemote(userId, d))
    } else if (
      prev.name !== d.name ||
      prev.category !== d.category ||
      prev.balance !== d.balance ||
      prev.apr !== d.apr ||
      prev.minPayment !== d.minPayment ||
      prev.dueDay !== d.dueDay
    ) {
      ops.push(updateDebtRemote(userId, d))
    }
  }
  for (const d of before) {
    if (!afterIds.has(d.id)) ops.push(deleteDebtRemote(userId, d.id))
  }
  await Promise.all(ops)
}

export async function upsertSettingsRemote(userId: string, settings: CloudSettings): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('settings').upsert({
    user_id: userId,
    monthly_income: settings.monthlyIncome,
    fixed_expenses: settings.fixedExpenses,
    extra_payment: settings.extraPayment,
    strategy: settings.strategy,
    priority_order: settings.priorityOrder,
    currency: settings.currency,
    language: settings.language,
    theme: settings.theme,
    tried_strategies: settings.triedStrategies,
    has_downloaded_report: settings.hasDownloadedReport,
    plan_baseline: settings.planBaseline,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

// --- Payments ---

export async function fetchCloudPayments(userId: string): Promise<Payment[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('payments').select('*').eq('user_id', userId)
  if (error) throw error
  return (data as PaymentRow[]).map((row) => ({
    id: row.id,
    debtId: row.debt_id,
    amount: row.amount,
    period: row.period,
    paidAt: row.paid_at,
  }))
}

export async function insertPaymentRemote(userId: string, payment: Payment): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('payments').upsert(
    {
      id: payment.id,
      user_id: userId,
      debt_id: payment.debtId,
      amount: payment.amount,
      period: payment.period,
      paid_at: payment.paidAt,
    },
    { onConflict: 'id' },
  )
  if (error) throw error
}

export async function deletePaymentRemote(userId: string, paymentId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('payments').delete().eq('id', paymentId).eq('user_id', userId)
  if (error) throw error
}

// --- Scenarios ---

export async function fetchCloudScenarios(userId: string): Promise<Scenario[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('scenarios').select('*').eq('user_id', userId).order('created_at')
  if (error) throw error
  return (data as ScenarioRow[]).map(rowToScenario)
}

export async function insertScenarioRemote(userId: string, scenario: Scenario): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('scenarios').upsert(
    {
      id: scenario.id,
      user_id: userId,
      name: scenario.name,
      extra_payment: scenario.extraPayment,
      strategy: scenario.strategy,
      priority_order: scenario.priorityOrder,
      created_at: scenario.createdAt,
    },
    { onConflict: 'id' },
  )
  if (error) throw error
}

export async function deleteScenarioRemote(userId: string, scenarioId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('scenarios').delete().eq('id', scenarioId).eq('user_id', userId)
  if (error) throw error
}
