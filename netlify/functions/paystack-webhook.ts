import type { Handler } from '@netlify/functions'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
// Service role bypasses RLS — required here, since this is the ONLY place subscription
// status is allowed to change, and it must be able to write regardless of whose row it is.
// Never expose this key anywhere client-side; it lives only as a Netlify env var.
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface PaystackEvent {
  event: string
  data: {
    customer?: { customer_code?: string; email?: string }
    plan?: { plan_code?: string }
    plan_object?: { plan_code?: string }
    subscription_code?: string
    next_payment_date?: string
    metadata?: { user_id?: string } | null
  }
}

/**
 * Receives Paystack's webhook events and is the ONLY writer to public.subscriptions. Every
 * request is signature-verified before anything in the body is trusted — an unsigned or
 * mis-signed request is rejected outright, since this endpoint effectively controls who
 * gets billed access to Plus features.
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const rawBody = event.body ?? ''
  const signature = event.headers['x-paystack-signature']
  if (!signature || !isValidSignature(rawBody, signature)) {
    console.error('Paystack webhook: invalid signature')
    return { statusCode: 401, body: 'Invalid signature' }
  }

  const payload = JSON.parse(rawBody) as PaystackEvent
  const customerCode = payload.data.customer?.customer_code

  switch (payload.event) {
    case 'charge.success': {
      // First successful payment on a plan-based checkout — this is what actually creates
      // the subscription. user_id comes from the metadata paystack-init.ts set; everything
      // after this event is matched by customer_code instead, since later events
      // (subscription.create/disable, invoice.*) don't carry our metadata back.
      const userId = payload.data.metadata?.user_id
      if (!userId || !customerCode) break
      await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          status: 'active',
          paystack_customer_code: customerCode,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
      break
    }

    case 'subscription.create': {
      if (!customerCode) break
      const planCode = payload.data.plan?.plan_code ?? payload.data.plan_object?.plan_code
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          paystack_subscription_code: payload.data.subscription_code,
          plan_code: planCode,
          current_period_end: payload.data.next_payment_date,
          updated_at: new Date().toISOString(),
        })
        .eq('paystack_customer_code', customerCode)
      break
    }

    // Paystack fires this both when a subscription is fully cancelled and when it's set to
    // not renew — either way, Plus access should stop, so both map to 'cancelled'.
    case 'subscription.disable':
    case 'subscription.not_renew': {
      if (!customerCode) break
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('paystack_customer_code', customerCode)
      break
    }

    case 'invoice.payment_failed': {
      if (!customerCode) break
      await supabase
        .from('subscriptions')
        .update({ status: 'past_due', updated_at: new Date().toISOString() })
        .eq('paystack_customer_code', customerCode)
      break
    }

    // A recurring renewal charge succeeding again — reactivate in case it had lapsed to
    // past_due after a previous failed attempt, and push the period end forward.
    case 'invoice.update': {
      if (!customerCode) break
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_end: payload.data.next_payment_date,
          updated_at: new Date().toISOString(),
        })
        .eq('paystack_customer_code', customerCode)
      break
    }

    default:
      // Unhandled event types are expected and fine to ignore — Paystack sends more event
      // types than we act on.
      break
  }

  // Paystack expects a fast 200 regardless of internal handling — it retries on non-2xx.
  return { statusCode: 200, body: 'ok' }
}

function isValidSignature(rawBody: string, signature: string): boolean {
  const expected = createHmac('sha512', PAYSTACK_SECRET_KEY).update(rawBody).digest('hex')
  const expectedBuf = Buffer.from(expected, 'hex')
  const signatureBuf = Buffer.from(signature, 'hex')
  if (expectedBuf.length !== signatureBuf.length) return false
  return timingSafeEqual(expectedBuf, signatureBuf)
}
