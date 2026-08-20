import { useEffect, useRef, useState } from 'react'
import { BookOpen, Lock, MoreHorizontal, RotateCcw } from 'lucide-react'
import type { Translation } from '../lib/i18n'

interface Props {
  t: Translation
  onLearn: () => void
  /** Omit entirely (e.g. during onboarding) to hide the "Start over" item. */
  onStartOver?: () => void
}

/**
 * Consolidates the header's lower-frequency actions (Learn, the privacy trust message,
 * Start over) behind a single button, so the header row doesn't have to fit 8 separate
 * controls — which stopped fitting even at ordinary desktop widths once Learn, Plus and
 * the privacy badge were all added as top-level buttons.
 */
export default function MoreMenu({ t, onLearn, onStartOver }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on an outside click/tap or Escape. A ref-scoped listener (rather than the old
  // onBlur+setTimeout hack) can't race a later legitimate open: a click on the toggle
  // button itself is inside containerRef, so it's never mistaken for an outside click.
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

  function choose(action: () => void) {
    action()
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t.education.openLabel}
        aria-expanded={open}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-64 animate-rise overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <button
            onClick={() => choose(onLearn)}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <BookOpen size={15} className="text-slate-400" /> {t.education.openLabel}
          </button>
          <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center gap-2.5 font-medium text-slate-700 dark:text-slate-200">
              <Lock size={14} className="text-slate-400" /> {t.privacy.title}
            </div>
            <p className="mt-1.5 pl-[1.6rem] text-xs text-slate-500 dark:text-slate-400">{t.privacy.message}</p>
          </div>
          {onStartOver && (
            <button
              onClick={() => choose(onStartOver)}
              className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-3 text-left text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RotateCcw size={15} className="text-slate-400" /> {t.app.startOver}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
