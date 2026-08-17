import { supabase } from './supabase'
import type { Debt, DebtCategory, Strategy } from './payoff'
import type { Locale } from './i18n'

export interface CloudSettings {
  monthlyIncome: number
  fixedExpenses: number
  extraPayment: number
  strategy: Strategy
  currency: string
  language: Locale
  theme: 'light' | 'dark'
}

interface DebtRow {
  id: string
  name: string
  category: DebtCategory
  balance: number
  apr: number
  min_payment: number
}

interface SettingsRow {
  monthly_income: number
  fixed_expenses: number
  extra_payment: number
  strategy: Strategy
  currency: string
  language: Locale
  theme: 'light' | 'dark'
}

function rowToDebt(row: DebtRow): Debt {
  return { id: row.id, name: row.name, category: row.category, balance: row.balance, apr: row.apr, minPayment: row.min_payment }
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
    currency: row.currency,
    language: row.language,
    theme: row.theme,
  }
}

export async function insertDebtRemote(userId: string, debt: Debt): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('debts').insert({
    id: debt.id,
    user_id: userId,
    name: debt.name,
    category: debt.category,
    balance: debt.balance,
    apr: debt.apr,
    min_payment: debt.minPayment,
  })
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
      apr: debt.apr,
      min_payment: debt.minPayment,
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

export async function replaceAllDebtsRemote(userId: string, debts: Debt[]): Promise<void> {
  if (!supabase) return
  await supabase.from('debts').delete().eq('user_id', userId)
  if (debts.length === 0) return
  const { error } = await supabase.from('debts').insert(
    debts.map((d) => ({
      id: d.id,
      user_id: userId,
      name: d.name,
      category: d.category,
      balance: d.balance,
      apr: d.apr,
      min_payment: d.minPayment,
    })),
  )
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
      prev.minPayment !== d.minPayment
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
    currency: settings.currency,
    language: settings.language,
    theme: settings.theme,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}
