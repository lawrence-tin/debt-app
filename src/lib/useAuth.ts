import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export interface AuthState {
  user: User | null
  /** True while the initial session is being resolved on page load. */
  loading: boolean
}

/** Tracks the current Supabase auth session. No-ops (always signed out) when cloud sync isn't configured. */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  return { user, loading }
}

export async function signUp(email: string, password: string) {
  if (!supabase) throw new Error('Cloud sync is not configured.')
  return supabase.auth.signUp({ email, password })
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Cloud sync is not configured.')
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function sendPasswordReset(email: string) {
  if (!supabase) throw new Error('Cloud sync is not configured.')
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
  })
}
