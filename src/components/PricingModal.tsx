import { useState } from 'react'
import { Check, Loader2, Sparkles, X } from 'lucide-react'
import { isCloudConfigured } from '../lib/supabase'
import { startPlusCheckout, type SubscriptionStatus } from '../lib/billing'
import type { Translation } from '../lib/i18n'

interface Props {
  t: Translation
  isSignedIn: boolean
  subscriptionStatus: SubscriptionStatus
  onClose: () => void
}

export default function PricingModal({ t, isSignedIn, subscriptionStatus, onClose }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubscribe() {
    setError(null)
    if (!isSignedIn) {
      setError(t.plus.signInRequired)
      return
    }
    setSubmitting(true)
    try {
      await startPlusCheckout()
      // On success this navigates away to Paystack's checkout page, so there's no need to
      // reset `submitting` — the component unmounts along with the redirect.
    } catch {
      setError(t.plus.checkoutError)
      setSubmitting(false)
    }
  }

  const isActive = subscriptionStatus === 'active'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-xl animate-rise overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-violet-500/15 p-1.5 text-violet-600 dark:text-violet-400">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.plus.heading}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.plus.subheading}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t.plus.closeLabel}
            className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.plus.freeTitle}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{t.plus.freePrice}</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {t.plus.freeFeatures.map((f, i) => (
                  <li key={i} className="flex gap-1.5">
                    <Check size={14} className="mt-0.5 shrink-0 text-slate-400" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-violet-300 bg-violet-50/60 p-4 dark:border-violet-800 dark:bg-violet-500/10">
              <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">{t.plus.plusTitle}</p>
              <div className="mt-1 flex items-baseline gap-1">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{t.plus.plusPrice}</p>
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.plus.perMonth}</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-200">
                {t.plus.plusFeatures.map((f, i) => (
                  <li key={i} className="flex gap-1.5">
                    <Check size={14} className="mt-0.5 shrink-0 text-violet-500" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {isActive ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-900 dark:bg-emerald-500/10">
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">{t.plus.activeTitle}</p>
              <p className="mt-1 text-sm text-emerald-700/90 dark:text-emerald-300/90">{t.plus.activeBody}</p>
            </div>
          ) : !isCloudConfigured ? (
            <p className="text-center text-sm text-slate-400">{t.plus.notConfigured}</p>
          ) : (
            <div className="space-y-2">
              {error && <p className="text-xs text-rose-500">{error}</p>}
              <button
                onClick={handleSubscribe}
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? t.plus.subscribing : t.plus.subscribeButton}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
