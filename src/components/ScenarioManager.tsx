import { useState } from 'react'
import { Check, Plus, Sparkles, Trash2 } from 'lucide-react'
import { formatCurrency, makeId, type Debt } from '../lib/payoff'
import { evaluateScenarios, type Scenario } from '../lib/scenarios'
import { formatMonthsAsYears, type Translation } from '../lib/i18n'

interface Props {
  debts: Debt[]
  scenarios: Scenario[]
  currentExtraPayment: number
  currentStrategy: Scenario['strategy']
  currentPriorityOrder: string[]
  currency: string
  locale: string
  t: Translation
  onSave: (scenario: Scenario) => void
  onApply: (scenario: Scenario) => void
  onDelete: (id: string) => void
}

export default function ScenarioManager({
  debts,
  scenarios,
  currentExtraPayment,
  currentStrategy,
  currentPriorityOrder,
  currency,
  locale,
  t,
  onSave,
  onApply,
  onDelete,
}: Props) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')

  const evaluated = evaluateScenarios(scenarios, debts)

  function handleSave() {
    if (!name.trim()) return
    onSave({
      id: makeId(),
      name: name.trim(),
      extraPayment: currentExtraPayment,
      strategy: currentStrategy,
      priorityOrder: currentPriorityOrder,
      createdAt: new Date().toISOString(),
    })
    setName('')
    setShowForm(false)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded-lg bg-fuchsia-500/10 p-1.5 text-fuchsia-500">
          <Sparkles size={18} />
        </span>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.scenarios.heading}</h2>
      </div>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t.scenarios.subheading}</p>

      {evaluated.length === 0 && !showForm && (
        <p className="mb-4 rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t.scenarios.empty}
        </p>
      )}

      {evaluated.length > 0 && (
        <ul className="mb-4 space-y-2">
          {evaluated.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5 text-sm dark:border-slate-800"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-800 dark:text-slate-100">{s.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.scenarios.extraLabel(formatCurrency(s.extraPayment, currency, locale))} ·{' '}
                  {t.scenarios.strategyLabel(t.strategyName[s.strategy])}
                </p>
              </div>
              {s.result.feasible ? (
                <div className="flex shrink-0 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400">{t.strategy.debtFreeIn}</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {formatMonthsAsYears(s.result.months, t)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">{t.strategy.interestPaid}</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {formatCurrency(s.result.totalInterestPaid, currency, locale)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="shrink-0 text-xs font-medium text-rose-500">{t.strategy.tooLow}</p>
              )}
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => onApply(s)}
                  title={t.scenarios.apply}
                  aria-label={`${t.scenarios.apply}: ${s.name}`}
                  className="rounded-md p-1.5 text-slate-400 transition hover:bg-emerald-500/10 hover:text-emerald-600"
                >
                  <Check size={15} />
                </button>
                <button
                  onClick={() => onDelete(s.id)}
                  title={t.scenarios.delete}
                  aria-label={`${t.scenarios.delete}: ${s.name}`}
                  className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder={t.scenarios.namePlaceholder}
            autoFocus
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            onClick={handleSave}
            className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
          >
            {t.scenarios.save}
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {t.scenarios.cancel}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-fuchsia-400 hover:text-fuchsia-600 dark:border-slate-700 dark:text-slate-300"
        >
          <Plus size={14} /> {t.scenarios.saveCurrent}
        </button>
      )}
    </section>
  )
}
