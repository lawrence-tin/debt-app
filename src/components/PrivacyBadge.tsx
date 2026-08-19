import { useState } from 'react'
import { Lock } from 'lucide-react'
import type { Translation } from '../lib/i18n'

interface Props {
  t: Translation
}

/**
 * Makes the app's local-first architecture visible as an ongoing product feature, not just
 * a one-time onboarding line — a small always-present badge a user can check at any point,
 * not only during their first session.
 */
export default function PrivacyBadge({ t }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <Lock size={12} />
        <span className="hidden sm:inline">{t.privacy.badge}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 animate-rise rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <p className="font-semibold text-slate-900 dark:text-white">{t.privacy.title}</p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">{t.privacy.message}</p>
        </div>
      )}
    </div>
  )
}
