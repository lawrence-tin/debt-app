import { useState } from 'react'
import { Loader2, Lock, Mail, X } from 'lucide-react'
import type { AuthError } from '@supabase/supabase-js'
import { sendPasswordReset, signIn, signUp } from '../lib/useAuth'
import type { Translation } from '../lib/i18n'

type Mode = 'signin' | 'signup' | 'forgot'

interface Props {
  t: Translation
  onClose: () => void
}

/** Maps known Supabase Auth error codes to a translated, actionable message. */
function authErrorMessage(err: unknown, t: Translation): string {
  const code = (err as Partial<AuthError> | undefined)?.code
  switch (code) {
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return t.auth.rateLimited
    case 'user_already_exists':
    case 'email_exists':
    case 'identity_already_exists':
      return t.auth.emailInUse
    case 'invalid_credentials':
      return t.auth.invalidCredentials
    case 'email_not_confirmed':
      return t.auth.emailNotConfirmed
    case 'email_address_invalid':
    case 'validation_failed':
      return t.auth.invalidEmail
    case 'weak_password':
      return t.auth.passwordTooShort
    default:
      return t.auth.genericError
  }
}

export default function AuthModal({ t, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setMessage(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (mode === 'forgot') {
      setLoading(true)
      try {
        const { error: err } = await sendPasswordReset(email)
        if (err) throw err
        setMessage(t.auth.resetPasswordSent(email))
      } catch (err) {
        setError(authErrorMessage(err, t))
      } finally {
        setLoading(false)
      }
      return
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError(t.auth.passwordMismatch)
      return
    }
    if (mode === 'signup' && password.length < 6) {
      setError(t.auth.passwordTooShort)
      return
    }

    setLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error: err } = await signUp(email, password)
        if (err) throw err
        if (!data.session) {
          setMessage(t.auth.confirmEmailSent(email))
        } else {
          onClose()
        }
      } else {
        const { error: err } = await signIn(email, password)
        if (err) throw err
        onClose()
      }
    } catch (err) {
      setError(authErrorMessage(err, t))
    } finally {
      setLoading(false)
    }
  }

  const heading = mode === 'signin' ? t.auth.welcomeBack : mode === 'signup' ? t.auth.createAccount : t.auth.resetPassword

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm animate-rise rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{heading}</h2>
          <button
            onClick={onClose}
            aria-label={t.auth.close}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        {mode === 'forgot' && (
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t.auth.resetPasswordBody}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600 dark:text-slate-300">{t.auth.email}</span>
            <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800">
              <Mail size={14} className="mr-2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-slate-900 outline-none dark:text-white"
                autoComplete="email"
              />
            </div>
          </label>

          {mode !== 'forgot' && (
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600 dark:text-slate-300">{t.auth.password}</span>
              <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800">
                <Lock size={14} className="mr-2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-slate-900 outline-none dark:text-white"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
              </div>
            </label>
          )}

          {mode === 'signup' && (
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600 dark:text-slate-300">
                {t.auth.confirmPassword}
              </span>
              <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800">
                <Lock size={14} className="mr-2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent text-slate-900 outline-none dark:text-white"
                  autoComplete="new-password"
                />
              </div>
            </label>
          )}

          {mode === 'signin' && (
            <button
              type="button"
              onClick={() => switchMode('forgot')}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              {t.auth.forgotPassword}
            </button>
          )}

          {error && <p className="text-sm text-rose-500">{error}</p>}
          {message && <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {mode === 'signin' ? t.auth.signInCta : mode === 'signup' ? t.auth.signUpCta : t.auth.sendResetLink}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          {mode === 'signin' && (
            <button
              onClick={() => switchMode('signup')}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {t.auth.noAccount} <span className="font-medium text-emerald-600 dark:text-emerald-400">{t.auth.signUp}</span>
            </button>
          )}
          {mode === 'signup' && (
            <button
              onClick={() => switchMode('signin')}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {t.auth.hasAccount} <span className="font-medium text-emerald-600 dark:text-emerald-400">{t.auth.signIn}</span>
            </button>
          )}
          {mode === 'forgot' && (
            <button
              onClick={() => switchMode('signin')}
              className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              {t.auth.backToSignIn}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
