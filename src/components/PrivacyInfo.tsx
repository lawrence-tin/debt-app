import { useEffect, useRef, useState } from 'react'
import { Lock } from 'lucide-react'
import type { Translation } from '../lib/i18n'

interface Props {
  t: Translation
}

/**
 * A standalone header icon button (not folded into a "More" menu — see MoreMenu's git
 * history for why hiding actions behind a disclosure widget is worth avoiding) that makes
 * the app's local-first architecture visible as an ongoing product feature. Opens a small
 * popover on click so it's reachable by tap on touch devices, not just hover.
 */
export default function PrivacyInfo({ t }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Same ref-scoped outside-click pattern as MoreMenu: a click on the toggle button is
  // inside containerRef, so it's never mistaken for an outside click, and there's no timer
  // that could race a later legitimate open.
  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t.privacy.badge}
        aria-expanded={open}
        title={t.privacy.badge}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <Lock size={15} />
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
