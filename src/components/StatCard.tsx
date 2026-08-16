import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  hint?: string
  icon?: ReactNode
  accent?: 'emerald' | 'sky' | 'amber' | 'rose'
}

const ACCENTS: Record<NonNullable<StatCardProps['accent']>, string> = {
  emerald: 'text-emerald-500 bg-emerald-500/10',
  sky: 'text-sky-500 bg-sky-500/10',
  amber: 'text-amber-500 bg-amber-500/10',
  rose: 'text-rose-500 bg-rose-500/10',
}

export default function StatCard({ label, value, hint, icon, accent = 'emerald' }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        {icon && <span className={`rounded-lg p-1.5 ${ACCENTS[accent]}`}>{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  )
}
