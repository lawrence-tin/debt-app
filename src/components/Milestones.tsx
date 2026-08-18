import { useState } from 'react'
import { Download, FileSpreadsheet, Loader2, PartyPopper } from 'lucide-react'
import { CATEGORY_EMOJI, monthAtProgress, type Debt, type PayoffResult, type Strategy } from '../lib/payoff'
import { formatMonthsAsYears, type Translation } from '../lib/i18n'
import { downloadPayoffReportPdf } from '../lib/report'
import { downloadDebtsCsv } from '../lib/csv'

interface Props {
  debts: Debt[]
  result: PayoffResult
  originalTotal: number
  strategy: Strategy
  currency: string
  locale: string
  t: Translation
  onCelebrate: () => void
  onExport: () => void
}

const CHECKPOINTS = [0.25, 0.5, 0.75, 1]

export default function Milestones({
  debts,
  result,
  originalTotal,
  strategy,
  currency,
  locale,
  t,
  onCelebrate,
  onExport,
}: Props) {
  const [downloading, setDownloading] = useState(false)
  const payoffOrder = [...debts]
    .filter((d) => result.debtPayoffMonth[d.id] !== undefined)
    .sort((a, b) => result.debtPayoffMonth[a.id] - result.debtPayoffMonth[b.id])

  async function handleDownloadPdf() {
    setDownloading(true)
    try {
      await downloadPayoffReportPdf({ debts, result, strategy, currency, locale, t })
      onExport()
    } finally {
      setDownloading(false)
    }
  }

  function handleDownloadCsv() {
    downloadDebtsCsv(debts, t)
    onExport()
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">{t.milestones.heading}</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CHECKPOINTS.map((fraction) => {
          const month = monthAtProgress(result, originalTotal, fraction)
          const reached = month !== null
          return (
            <div
              key={fraction}
              className={`rounded-xl border p-3 text-center ${
                reached
                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-500/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <p className="text-xl font-bold text-slate-900 dark:text-white">{fraction * 100}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {reached ? formatMonthsAsYears(month!, t) : '—'}
              </p>
            </div>
          )
        })}
      </div>

      {payoffOrder.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{t.milestones.payoffOrder}</h3>
          <ol className="space-y-2">
            {payoffOrder.map((d, i) => (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {i + 1}
                </span>
                <span>{CATEGORY_EMOJI[d.category]}</span>
                <span className="flex-1 font-medium text-slate-800 dark:text-slate-100">{d.name}</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {t.milestones.clearedIn(formatMonthsAsYears(result.debtPayoffMonth[d.id], t))}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {result.feasible && result.months > 0 && (
          <button
            onClick={onCelebrate}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <PartyPopper size={16} /> {t.milestones.celebrate}
          </button>
        )}
        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
        >
          {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {downloading ? t.report.generating : t.report.downloadButton}
        </button>
        <button
          onClick={handleDownloadCsv}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
        >
          <FileSpreadsheet size={16} />
          {t.report.csvDownloadButton}
        </button>
      </div>
    </section>
  )
}
