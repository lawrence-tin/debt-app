import { en } from './en'
import { es } from './es'
import { fr } from './fr'
import type { Locale, Translation } from './types'

export type { Locale, Translation } from './types'

export const TRANSLATIONS: Record<Locale, Translation> = { en, es, fr }

export const LANGUAGE_META: Record<Locale, { label: string; flag: string; dateLocale: string }> = {
  en: { label: 'English', flag: '🇺🇸', dateLocale: 'en-US' },
  es: { label: 'Español', flag: '🇪🇸', dateLocale: 'es-ES' },
  fr: { label: 'Français', flag: '🇫🇷', dateLocale: 'fr-FR' },
}

export function guessLocaleFromBrowser(): Locale {
  if (typeof navigator === 'undefined') return 'en'
  for (const lang of navigator.languages ?? [navigator.language]) {
    const base = lang.slice(0, 2).toLowerCase()
    if (base === 'es' || base === 'fr' || base === 'en') return base
  }
  return 'en'
}

/** Formats a duration in months using the given locale's units, e.g. "1 yr 6 mos" / "1 año 6 meses". */
export function formatMonthsAsYears(months: number, t: Translation): string {
  if (months <= 0) return t.time.zero
  const y = Math.floor(months / 12)
  const m = months % 12
  const parts: string[] = []
  if (y > 0) parts.push(t.time.years(y))
  if (m > 0) parts.push(t.time.months(m))
  return parts.join(' ') || t.time.zero
}
