import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import type { ToolContent } from './types'

interface Props {
  content: ToolContent
  children: ReactNode
}

const APP_URL_BASE = '/'

function appUrl(slug: string) {
  return `${APP_URL_BASE}?utm_source=calculator&utm_campaign=${slug}`
}

/** Shared chrome for every standalone SEO calculator page: header, intro copy, the
 *  calculator itself (children), a mid-page CTA into the full app, FAQ, and footer. */
export default function ToolShell({ content, children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <a href={APP_URL_BASE} className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-sky-500 text-sm font-bold text-white">
              CP
            </span>
            <span className="text-lg font-semibold tracking-tight">ClearPath</span>
          </a>
          <a
            href={appUrl(content.slug)}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600"
          >
            Open the full app <ArrowRight size={13} />
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{content.h1}</h1>
        <p className="mt-3 max-w-2xl text-slate-500 dark:text-slate-400">{content.dek}</p>

        <div className="mt-8">{children}</div>

        <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-500/10">
          <p className="font-semibold text-emerald-800 dark:text-emerald-300">
            Want the full picture, not just this one number?
          </p>
          <p className="max-w-md text-sm text-emerald-700/90 dark:text-emerald-300/80">
            ClearPath tracks every debt together, compares strategies, and keeps a monthly check-in on your actual
            progress — free to start, no account required.
          </p>
          <a
            href={appUrl(content.slug)}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            Build your free ClearPath plan <ArrowRight size={15} />
          </a>
        </div>

        <div className="mt-12 space-y-6">
          {content.intro.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {p}
            </p>
          ))}
        </div>

        {content.faq.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Frequently asked questions</h2>
            <dl className="mt-4 space-y-5">
              {content.faq.map((item, i) => (
                <div key={i}>
                  <dt className="font-medium text-slate-800 dark:text-slate-100">{item.q}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </main>

      <footer className="mt-12 border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
        <p>This is a planning estimate, not financial advice — figures are based only on what you enter above.</p>
        <p className="mt-1">
          Part of{' '}
          <a href={APP_URL_BASE} className="font-medium text-slate-500 underline underline-offset-2 dark:text-slate-300">
            ClearPath
          </a>
          , a free South African debt-freedom planner.
        </p>
      </footer>
    </div>
  )
}
