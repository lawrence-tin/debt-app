import { isCloudConfigured, supabase } from './supabase'

const VISITOR_ID_KEY = 'clearpath.visitor_id'
const FIRED_KEY = 'clearpath.analytics_fired'

/**
 * The funnel from spec section 18:
 * Visitor -> Started plan -> Added debt -> Completed plan -> Saw debt-free date ->
 * Ran scenario -> Saved plan/account -> Returned after 30 days -> Paid subscription.
 *
 * "Returned after 30 days" isn't a discrete event — it's computed from repeated
 * 'visitor' events against the same visitor_id over time (see analytics-queries.md).
 * "Paid subscription" has no event yet: there's no real billing to fire it from until
 * that ships (see plus_interest as the closest current proxy — waitlist interest).
 */
export type FunnelEvent =
  | 'visitor'
  | 'plan_started'
  | 'debt_added'
  | 'plan_completed'
  | 'saw_debt_free_date'
  | 'simulator_used'
  | 'scenario_saved'
  | 'plan_saved'
  | 'account_created'
  | 'plus_interest'

/** Anonymous, durable, client-generated id — not the auth user id — so funnel steps can be
 *  attributed before someone ever signs in. Survives "Start over" (same visitor, new plan). */
function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(VISITOR_ID_KEY, id)
    }
    return id
  } catch {
    return 'unknown'
  }
}

function getFired(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(FIRED_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function markFired(event: string) {
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify({ ...getFired(), [event]: true }))
  } catch {
    // storage unavailable — fail silently, same as the rest of this app's local persistence
  }
}

/**
 * Logs a funnel event to this project's own Supabase — first-party only, nothing sent to
 * any third-party analytics vendor. Every event except 'visitor' fires at most once per
 * browser (funnel steps count distinct visitors reached, not repeat occurrences); 'visitor'
 * fires every session so return-visit rate can be measured. Best-effort: analytics must
 * never surface an error to the user or affect app behavior.
 */
export function trackEvent(event: FunnelEvent, userId?: string | null): void {
  if (!isCloudConfigured || !supabase) return
  if (event !== 'visitor') {
    if (getFired()[event]) return
    markFired(event)
  }
  const client = supabase
  void (async () => {
    try {
      await client.from('analytics_events').insert({ visitor_id: getVisitorId(), user_id: userId ?? null, event })
    } catch {
      // best-effort — never let analytics break the app
    }
  })()
}
