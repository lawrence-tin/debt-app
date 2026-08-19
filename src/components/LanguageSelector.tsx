import { LANGUAGE_META, type Locale, type Translation } from '../lib/i18n'

interface Props {
  value: Locale
  onChange: (locale: Locale) => void
  t: Translation
}

export default function LanguageSelector({ value, onChange, t }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Locale)}
      aria-label={t.language.ariaLabel}
      className="max-w-[110px] truncate rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500 sm:max-w-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
    >
      {(Object.keys(LANGUAGE_META) as Locale[]).map((locale) => (
        <option key={locale} value={locale}>
          {LANGUAGE_META[locale].flag} {LANGUAGE_META[locale].label}
        </option>
      ))}
    </select>
  )
}
