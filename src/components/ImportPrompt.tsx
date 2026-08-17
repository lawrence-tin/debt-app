import { CloudUpload } from 'lucide-react'
import type { Translation } from '../lib/i18n'

interface Props {
  t: Translation
  onImport: () => void
  onDiscard: () => void
}

export default function ImportPrompt({ t, onImport, onDiscard }: Props) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center dark:border-emerald-900 dark:bg-emerald-500/10">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-lg bg-emerald-500/15 p-1.5 text-emerald-600 dark:text-emerald-400">
          <CloudUpload size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.auth.importPromptTitle}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t.auth.importPromptBody}</p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={onDiscard}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          {t.auth.importNo}
        </button>
        <button
          onClick={onImport}
          className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-600"
        >
          {t.auth.importYes}
        </button>
      </div>
    </div>
  )
}
