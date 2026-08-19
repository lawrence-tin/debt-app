import { useState } from 'react'
import { ChevronDown, Info } from 'lucide-react'
import type { Translation } from '../lib/i18n'

interface Props {
  t: Translation
}

export default function AssumptionsPanel({ t }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 p-4 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <Info size={16} className="text-slate-400" />
          {t.assumptions.heading}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="space-y-1.5 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {t.assumptions.items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-slate-300 dark:text-slate-600">•</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
