import { LogOut, UserRound } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Translation } from '../lib/i18n'

interface Props {
  user: User | null
  syncStatus: 'idle' | 'syncing' | 'synced'
  t: Translation
  onSignIn: () => void
  onSignOut: () => void
}

export default function AccountMenu({ user, syncStatus, t, onSignIn, onSignOut }: Props) {
  if (!user) {
    return (
      <button
        onClick={onSignIn}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300"
      >
        <UserRound size={13} /> {t.auth.signIn}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden flex-col items-end leading-tight sm:flex">
        <span className="max-w-[160px] truncate text-xs font-medium text-slate-600 dark:text-slate-300">
          {user.email}
        </span>
        {syncStatus !== 'idle' && (
          <span className="text-[10px] text-slate-400">
            {syncStatus === 'syncing' ? t.auth.syncing : t.auth.synced}
          </span>
        )}
      </div>
      <button
        onClick={onSignOut}
        aria-label={t.auth.signOut}
        title={t.auth.signOut}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-rose-500 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <LogOut size={14} />
      </button>
    </div>
  )
}
