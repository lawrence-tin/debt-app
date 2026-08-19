import { supabase } from './supabase'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim())
}

/**
 * Registers interest in ClearPath Plus (Phase 6: an interest-only waitlist, per the spec's
 * own "validate willingness to pay" goal — no real billing exists yet). Not tied to a user
 * account, so this works whether or not the visitor is signed in.
 */
export async function joinPlusWaitlist(email: string, locale: string, currency: string): Promise<void> {
  if (!supabase) throw new Error('not-configured')
  const { error } = await supabase
    .from('plus_waitlist')
    .upsert({ email: email.trim().toLowerCase(), locale, currency }, { onConflict: 'email', ignoreDuplicates: true })
  if (error) throw error
}
