import type { ToolContent } from '../types'

export const interestSavings: ToolContent = {
  slug: 'interest-savings-calculator',
  h1: 'Interest Savings Calculator',
  dek: "See exactly how much interest you're on track to pay — and how much of it you can avoid.",
  intro: [
    "Interest is the part of debt that's easiest to lose track of, because it never shows up as a single number anywhere — it's just quietly included in every payment. Over the full life of a debt, it can add up to a substantial fraction of what was originally borrowed, especially at credit-card-level interest rates.",
    "This calculator totals up the interest you're projected to pay across everything you owe, at your current payments, and compares it against what you'd pay with some extra added each month. The gap between those two numbers is money that stays yours instead of going to a lender.",
    'It uses the same month-by-month calculation as the rest of ClearPath\'s tools — interest accruing on whatever balance remains, minimums paid first, extra cascading to whichever debt is prioritised — rather than a rough percentage estimate.',
  ],
  faq: [
    {
      q: 'Why is the total interest so much higher than I expected?',
      a: "Interest compounds on the remaining balance every month, not just once on the original amount borrowed — so the longer a debt takes to clear, the more total interest accrues, even if the monthly amount feels small each time.",
    },
    {
      q: 'Does paying extra always reduce total interest?',
      a: "Yes, assuming rates stay the same — every extra rand reduces the balance interest is calculated on for every month after that. It's one of the few financial moves with a guaranteed, calculable return.",
    },
    {
      q: 'Which strategy saves the most interest?',
      a: "Avalanche — paying off the highest interest rate first — is usually the cheapest strategy in total interest, though the exact saving depends on how spread out your rates are. This calculator shows both Avalanche and Snowball so you can see the real number for your situation.",
    },
  ],
}
