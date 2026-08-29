import { supabase } from './supabase'

export type InviteStatus = 'pending' | 'accepted'

export interface PlanInvite {
  id: string
  ownerId: string
  /** Denormalized at invite time — see schema.sql's comment on the column for why (there's
   *  no safe way to look up a stranger's email from ownerId alone under RLS). */
  ownerEmail: string
  memberId: string | null
  invitedEmail: string
  status: InviteStatus
  createdAt: string
}

interface PlanMemberRow {
  id: string
  owner_id: string
  owner_email: string
  member_id: string | null
  invited_email: string
  status: InviteStatus
  created_at: string
}

function rowToInvite(row: PlanMemberRow): PlanInvite {
  return {
    id: row.id,
    ownerId: row.owner_id,
    ownerEmail: row.owner_email,
    memberId: row.member_id,
    invitedEmail: row.invited_email,
    status: row.status,
    createdAt: row.created_at,
  }
}

/** Invites this user has sent as a plan owner (any status) — lets them see what's pending
 *  vs already accepted, and revoke either. */
export async function fetchSentInvites(ownerId: string): Promise<PlanInvite[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('plan_members').select('*').eq('owner_id', ownerId).order('created_at')
  if (error) throw error
  return (data as PlanMemberRow[]).map(rowToInvite)
}

/** Pending invites addressed to this user's email, waiting for them to accept — RLS already
 *  restricts this to rows actually meant for the caller, this filter is just for clarity. */
export async function fetchIncomingInvites(email: string): Promise<PlanInvite[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('plan_members')
    .select('*')
    .eq('invited_email', email.toLowerCase())
    .eq('status', 'pending')
  if (error) throw error
  return (data as PlanMemberRow[]).map(rowToInvite)
}

/** Plans this user has accepted access to, as a member (not the owner) — each one is a
 *  shared plan they can view/manage alongside their own. */
export async function fetchAcceptedMemberships(memberId: string): Promise<PlanInvite[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('plan_members')
    .select('*')
    .eq('member_id', memberId)
    .eq('status', 'accepted')
  if (error) throw error
  return (data as PlanMemberRow[]).map(rowToInvite)
}

/** Sends a shared-plan invite. Only succeeds if the caller's own subscription is active, and
 *  ownerEmail actually matches the caller's own — both enforced by RLS
 *  (plan_members_insert_if_subscribed), not just this function, so this is a real security
 *  boundary, not just a UI nicety. */
export async function inviteToSharedPlan(ownerId: string, ownerEmail: string, invitedEmail: string): Promise<void> {
  if (!supabase) throw new Error('not-configured')
  const { error } = await supabase.from('plan_members').insert({
    owner_id: ownerId,
    owner_email: ownerEmail,
    invited_email: invitedEmail.trim().toLowerCase(),
  })
  if (error) throw error
}

/** Accepts an invite addressed to the caller's own email — RLS only allows updating a row
 *  matching the caller's own email, and only allows setting member_id to the caller's own
 *  id, so this can't be used to claim someone else's invite. */
export async function acceptInvite(inviteId: string, memberId: string): Promise<void> {
  if (!supabase) throw new Error('not-configured')
  const { error } = await supabase
    .from('plan_members')
    .update({ member_id: memberId, status: 'accepted' })
    .eq('id', inviteId)
  if (error) throw error
}

/** Revokes a sent invite (as owner) or leaves a shared plan (as member) — both are just a
 *  delete of the same row, and RLS allows either side to do it. */
export async function removePlanMember(inviteId: string): Promise<void> {
  if (!supabase) throw new Error('not-configured')
  const { error } = await supabase.from('plan_members').delete().eq('id', inviteId)
  if (error) throw error
}
