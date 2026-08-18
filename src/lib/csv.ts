import type { Debt } from './payoff'
import type { Translation } from './i18n'

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function toCsv(rows: (string | number)[][]): string {
  return rows.map((row) => row.map((cell) => escapeCsvField(String(cell))).join(',')).join('\r\n')
}

/** Builds a CSV of the current debts (opens directly in Excel, Numbers, Sheets, etc.) and triggers a download. */
export function downloadDebtsCsv(debts: Debt[], t: Translation) {
  const header = [t.debts.namePlaceholder, t.debts.category, t.debts.balance, t.debts.apr, t.debts.minPayment, t.report.dueDayColumn]
  const rows = debts.map((d) => [d.name, t.category[d.category], d.balance, d.apr, d.minPayment, d.dueDay ?? ''])
  const csv = '﻿' + toCsv([header, ...rows]) // BOM so Excel detects UTF-8 correctly

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'clearpath-debts.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
