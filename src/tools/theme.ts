/** Applies dark mode purely from the OS preference — these standalone pages are meant to
 *  be lightweight and don't carry a theme toggle of their own, unlike the main app. */
export function applySystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark')
  }
}
