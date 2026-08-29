import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

export type SubscriptionStatus = 'inactive' | 'active' | 'cancelled' | 'past_due'

async function fetchStatus(userId: string): Promise<SubscriptionStatus> {
  if (!supabase) return 'inactive'
  const { data } = await supabase.from('subscriptions').select('status').eq('user_id', userId).maybeSingle()
  return (data?.status as SubscriptionStatus | undefined) ?? 'inactive'
}

/** Tracks whether the current user has an active ClearPath Plus subscription. No-ops
 *  (always inactive) when cloud sync isn't configured or nobody's signed in. Exposes
 *  `refetch` for the moment right after returning from Paystack checkout — the webhook that
 *  actually activates the subscription can take a few seconds to land, so the caller
 *  handling `?plus=success` needs to re-check rather than rely on this effect alone (which
 *  only re-runs when `userId` itself changes). */
export function useSubscription(userId: string | undefined): {
  status: SubscriptionStatus
  loading: boolean
  refetch: () => Promise<void>
} {
  const [status, setStatus] = useState<SubscriptionStatus>('inactive')
  const [loading, setLoading] = useState(Boolean(userId))

  useEffect(() => {
    if (!supabase || !userId) {
      setStatus('inactive')
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchStatus(userId).then((s) => {
      if (cancelled) return
      setStatus(s)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  const refetch = useCallback(async () => {
    if (!userId) return
    setStatus(await fetchStatus(userId))
  }, [userId])

  return { status, loading, refetch }
}

/**
 * Starts a ClearPath Plus checkout: asks the paystack-init Netlify Function for a hosted
 * checkout URL (using the current Supabase session to prove who's asking), then redirects
 * the browser there. Throws if there's no active session or the function call fails —
 * callers should catch and show a translated error rather than let this throw unhandled.
 */
export async function startPlusCheckout(): Promise<void> {
  if (!supabase) throw new Error('not-configured')
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error('not-signed-in')

  const res = await fetch('/.netlify/functions/paystack-init', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  if (!res.ok) throw new Error('checkout-failed')
  const data = (await res.json()) as { authorization_url?: string }
  if (!data.authorization_url) throw new Error('checkout-failed')

  window.location.href = data.authorization_url
}
