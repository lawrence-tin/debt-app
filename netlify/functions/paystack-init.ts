import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

// Server-side only — never exposed to the client. Set as Netlify environment variables.
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!
const PAYSTACK_PLAN_CODE = process.env.PAYSTACK_PLAN_CODE!
// Same values the client uses (VITE_-prefixed), just read without the Vite build step here.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!

/**
 * Starts a ClearPath Plus checkout: verifies the caller's Supabase session, then asks
 * Paystack for a hosted checkout URL for the R79/month plan and returns it for the client
 * to redirect to. Runs server-side so PAYSTACK_SECRET_KEY never reaches the browser.
 *
 * Does not touch the database — the subscriptions row only gets written once Paystack
 * actually confirms payment, via paystack-webhook.ts. This function only starts checkout.
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const authHeader = event.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Missing auth token' }) }
  }
  const token = authHeader.slice('Bearer '.length)

  // Verify the token against Supabase itself, rather than trusting anything the client
  // sends — this is the only way the function knows who's actually asking.
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData.user?.email) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid session' }) }
  }
  const user = userData.user

  const origin = event.headers.origin ?? `https://${event.headers.host}`

  const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: user.email,
      plan: PAYSTACK_PLAN_CODE,
      currency: 'ZAR',
      callback_url: `${origin}/?plus=success`,
      // Echoed back on the charge.success webhook — how paystack-webhook.ts knows which
      // Supabase user this payment belongs to.
      metadata: { user_id: user.id },
    }),
  })

  const paystackData = (await paystackRes.json()) as {
    status: boolean
    data?: { authorization_url: string }
    message?: string
  }

  if (!paystackRes.ok || !paystackData.status || !paystackData.data) {
    console.error('Paystack initialize failed:', paystackData.message)
    return { statusCode: 502, body: JSON.stringify({ error: 'Could not start checkout' }) }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ authorization_url: paystackData.data.authorization_url }),
  }
}
