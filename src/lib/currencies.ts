// ClearPath is South Africa-only — ZAR is the only currency the app deals in. This file used
// to hold a 160-currency picker (name/symbol/flag for every ISO currency, a popularity-ranked
// list, and best-effort browser-locale-to-currency guessing); all of that is gone along with
// the currency selector UI. What's left is the one thing still needed: the symbol shown next
// to input fields.

export function getCurrencySymbol(_code: string): string {
  return 'R'
}
