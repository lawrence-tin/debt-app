export interface ToolContent {
  slug: string
  h1: string
  /** Short standfirst shown right under the H1, above the calculator itself. */
  dek: string
  intro: string[]
  faq: { q: string; a: string }[]
}
