import { useState } from 'react'
import { Check, Loader2, Mail, Sparkles, X } from 'lucide-react'
import { isCloudConfigured } from '../lib/supabase'
import { isValidEmail, joinPlusWaitlist } from '../lib/waitlist'
import type { Translation } from '../lib/i18n'

interface Props {
  t: Translation
  locale: string
  currency: string
  hasJoined: boolean
  onJoined: () => void
  onClose: () => void
}

// "Test" prices from the product spec's suggested R39–R59/mo, R399–R499/yr range. This is a
// preview only — see previewNote — priced in ZAR regardless of the visitor's display
// currency, since there's no real exchange-rate data anywhere in this app to convert with.
const PRICE_MONTHLY = 49
const PRICE_ANNUAL = 449
const SAVE_PERCENT = Math.round((1 - PRICE_ANNUAL / 12 / PRICE_MONTHLY) * 100)

type Billing = 'monthly' | 'annual'

export default function PricingModal({ t, locale, currency, hasJoined, onJoined, onClose }: Props) {
  const [billing, setBilling] = useState<Billing>('annual')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!isValidEmail(email)) {
      setError(t.plus.errorInvalidEmail)
      return
    }
    setSubmitting(true)
    try {
      await joinPlusWaitlist(email, locale, currency)
      onJoined()
    } catch {
      setError(t.plus.errorGeneric)
    } finally {
      setSubmitting(false)
    }
  }

  const price = billing === 'monthly' ? `R${PRICE_MONTHLY}${t.plus.perMonth}` : `R${PRICE_ANNUAL}${t.plus.perYear}`

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
          <p className="mb-5 rounded-xl border border-violet-200 bg-violet-50 p-3 text-xs text-violet-800 dark:border-violet-900 dark:bg-violet-500/10 dark:text-violet-300">
            {t.plus.previewNote}
          </p>

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
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">{t.plus.plusTitle}</p>
                {billing === 'annual' && (
                  <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {t.plus.saveBadge(SAVE_PERCENT)}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{price}</p>
              </div>
              <div className="mt-2 inline-flex overflow-hidden rounded-lg border border-violet-200 text-[11px] dark:border-violet-800">
                <button
                  onClick={() => setBilling('monthly')}
                  className={`px-2.5 py-1 font-medium ${billing === 'monthly' ? 'bg-violet-600 text-white' : 'text-violet-600 dark:text-violet-300'}`}
                >
                  {t.plus.monthly}
                </button>
                <button
                  onClick={() => setBilling('annual')}
                  className={`px-2.5 py-1 font-medium ${billing === 'annual' ? 'bg-violet-600 text-white' : 'text-violet-600 dark:text-violet-300'}`}
                >
                  {t.plus.annual}
                </button>
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

          {hasJoined ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-900 dark:bg-emerald-500/10">
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">{t.plus.joinedTitle}</p>
              <p className="mt-1 text-sm text-emerald-700/90 dark:text-emerald-300/90">{t.plus.joinedBody}</p>
            </div>
          ) : !isCloudConfigured ? (
            <p className="text-center text-sm text-slate-400">{t.plus.notConfigured}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-violet-500 dark:border-slate-700 dark:bg-slate-800">
                <Mail size={14} className="text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.plus.emailPlaceholder}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-white"
                />
              </div>
              {error && <p className="text-xs text-rose-500">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? t.plus.joining : t.plus.notifyButton}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
