import { useEffect, useState } from 'react'
import { Loader2, Mail, UserPlus, Users, X } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import {
  acceptInvite,
  fetchAcceptedMemberships,
  fetchIncomingInvites,
  fetchSentInvites,
  inviteToSharedPlan,
  removePlanMember,
  type PlanInvite,
} from '../lib/planMembers'
import { isValidEmail } from '../lib/waitlist'
import type { SubscriptionStatus } from '../lib/billing'
import type { Translation } from '../lib/i18n'

interface Props {
  t: Translation
  user: User
  subscriptionStatus: SubscriptionStatus
  onClose: () => void
  /** Opens the read/manage view for a shared plan the user has accepted access to. */
  onViewPlan: (ownerId: string, ownerEmail: string) => void
}

/**
 * Manages ClearPath Plus shared plans from both sides at once: sending/revoking invites as
 * an owner (only possible with an active subscription — enforced by RLS, this UI just
 * reflects that), and accepting/leaving plans as an invited member. A single modal rather
 * than two separate ones since most people will only ever be on one side of this, and
 * showing both makes it obvious which one applies to them.
 */
export default function SharedPlanModal({ t, user, subscriptionStatus, onClose, onViewPlan }: Props) {
  const [sent, setSent] = useState<PlanInvite[]>([])
  const [incoming, setIncoming] = useState<PlanInvite[]>([])
  const [accepted, setAccepted] = useState<PlanInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isPlus = subscriptionStatus === 'active'

  async function reload() {
    const [sentInvites, incomingInvites, acceptedMemberships] = await Promise.all([
      fetchSentInvites(user.id),
      user.email ? fetchIncomingInvites(user.email) : Promise.resolve([]),
      fetchAcceptedMemberships(user.id),
    ])
    setSent(sentInvites)
    setIncoming(incomingInvites)
    setAccepted(acceptedMemberships)
    setLoading(false)
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!isValidEmail(email)) {
      setError(t.sharedPlan.errorInvalidEmail)
      return
    }
    setInviting(true)
    try {
      await inviteToSharedPlan(user.id, user.email ?? '', email)
      setEmail('')
      await reload()
    } catch {
      setError(t.sharedPlan.errorGeneric)
    } finally {
      setInviting(false)
    }
  }

  async function handleAccept(invite: PlanInvite) {
    setError(null)
    setBusyId(invite.id)
    try {
      await acceptInvite(invite.id, user.id)
      await reload()
    } catch {
      setError(t.sharedPlan.errorGeneric)
    } finally {
      setBusyId(null)
    }
  }

  async function handleRemove(invite: PlanInvite) {
    setError(null)
    setBusyId(invite.id)
    try {
      await removePlanMember(invite.id)
      await reload()
    } catch {
      setError(t.sharedPlan.errorGeneric)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg animate-rise overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-violet-500/15 p-1.5 text-violet-600 dark:text-violet-400">
              <Users size={18} />
            </span>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.sharedPlan.heading}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label={t.sharedPlan.closeLabel}
            className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-6 text-slate-400">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : (
            <>
              {/* Inviting, as an owner */}
              <section>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t.sharedPlan.inviteHeading}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.sharedPlan.inviteDescription}</p>

                {!isPlus ? (
                  <p className="mt-3 rounded-xl border border-violet-200 bg-violet-50 p-3 text-xs text-violet-800 dark:border-violet-900 dark:bg-violet-500/10 dark:text-violet-300">
                    {t.sharedPlan.requiresPlus}
                  </p>
                ) : (
                  <form onSubmit={handleInvite} className="mt-3 flex gap-2">
                    <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-violet-500 dark:border-slate-700 dark:bg-slate-800">
                      <Mail size={14} className="text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.sharedPlan.emailPlaceholder}
                        className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={inviting}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
                    >
                      {inviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                      {inviting ? t.sharedPlan.inviting : t.sharedPlan.inviteButton}
                    </button>
                  </form>
                )}

                {sent.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {sent.map((invite) => (
                      <li
                        key={invite.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-800"
                      >
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-200">{invite.invitedEmail}</p>
                          <p className="text-slate-400">
                            {invite.status === 'accepted' ? t.sharedPlan.statusAccepted : t.sharedPlan.statusPending}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemove(invite)}
                          disabled={busyId === invite.id}
                          className="text-slate-400 hover:text-rose-500 disabled:opacity-60"
                        >
                          {busyId === invite.id ? <Loader2 size={13} className="animate-spin" /> : t.sharedPlan.revokeButton}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Invites addressed to me */}
              {incoming.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t.sharedPlan.incomingHeading}</h3>
                  <ul className="mt-3 space-y-2">
                    {incoming.map((invite) => (
                      <li
                        key={invite.id}
                        className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs dark:border-emerald-900 dark:bg-emerald-500/10"
                      >
                        <span className="font-medium text-emerald-800 dark:text-emerald-300">
                          {t.sharedPlan.viewTitle(invite.ownerEmail)}
                        </span>
                        <button
                          onClick={() => handleAccept(invite)}
                          disabled={busyId === invite.id}
                          className="rounded-md bg-emerald-600 px-2.5 py-1 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {busyId === invite.id ? t.sharedPlan.accepting : t.sharedPlan.acceptButton}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Plans shared with me that I've accepted */}
              <section>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t.sharedPlan.sharedWithYouHeading}</h3>
                {accepted.length === 0 ? (
                  <p className="mt-2 text-xs text-slate-400">{t.sharedPlan.noSharedPlans}</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {accepted.map((invite) => (
                      <li
                        key={invite.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-800"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-200">{invite.ownerEmail}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onViewPlan(invite.ownerId, invite.ownerEmail)}
                            className="rounded-md bg-violet-600 px-2.5 py-1 font-semibold text-white transition hover:bg-violet-700"
                          >
                            {t.sharedPlan.viewButton}
                          </button>
                          <button
                            onClick={() => handleRemove(invite)}
                            disabled={busyId === invite.id}
                            className="text-slate-400 hover:text-rose-500 disabled:opacity-60"
                          >
                            {t.sharedPlan.leaveButton}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {error && <p className="text-xs text-rose-500">{error}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
