import { CURRENCIES, POPULAR_CURRENCY_CODES } from '../lib/currencies'

interface Props {
  value: string
  onChange: (code: string) => void
  compact?: boolean
}

export default function CurrencySelector({ value, onChange, compact }: Props) {
  const popular = POPULAR_CURRENCY_CODES.map((code) => CURRENCIES.find((c) => c.code === code)).filter(
    (c): c is (typeof CURRENCIES)[number] => Boolean(c),
  )
  const rest = CURRENCIES.filter((c) => !POPULAR_CURRENCY_CODES.includes(c.code))

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Currency"
      className={
        compact
          ? 'rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
          : 'w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
      }
    >
      <optgroup label="Popular">
        {popular.map((c) => (
          <option key={c.code} value={c.code}>
            {c.symbol !== c.code ? `${c.symbol} ` : ''}
            {c.code} — {c.name}
          </option>
        ))}
      </optgroup>
      <optgroup label="All currencies (A–Z)">
        {rest.map((c) => (
          <option key={c.code} value={c.code}>
            {c.symbol !== c.code ? `${c.symbol} ` : ''}
            {c.code} — {c.name}
          </option>
        ))}
      </optgroup>
    </select>
  )
}
