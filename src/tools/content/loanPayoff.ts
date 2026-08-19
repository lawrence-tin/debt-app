import type { ToolContent } from '../types'

export const loanPayoff: ToolContent = {
  slug: 'loan-payoff-calculator',
  h1: 'Loan Payoff Calculator',
  dek: 'Works for a personal loan, vehicle finance, or any fixed-term loan — see your real payoff date and total interest.',
  intro: [
    "Unlike a credit card, most loans — personal loans, vehicle finance, retail instalment agreements — come with a fixed term and a set monthly instalment from the start. That makes it easy to assume the payoff date is fixed too, but it isn't: extra payments still shorten it, exactly the same way they do on any other debt.",
    "This calculator projects your loan's payoff month by month using its balance, interest rate and current instalment, then shows what happens if you add extra on top of what's contractually required.",
    "It works the same way regardless of what the loan is for — the underlying maths (interest accruing on the remaining balance, payments reducing it) doesn't care whether it's a car, a personal loan, or something else with a balance and a rate.",
  ],
  faq: [
    {
      q: 'My loan has a fixed instalment — can I really pay it off faster?',
      a: "In most cases yes, as long as the agreement allows early or additional payments without a penalty — worth checking your specific contract for that. If it does, any extra you send in still reduces the balance early, which reduces interest and shortens the term, the same as any other debt.",
    },
    {
      q: 'Does this include balloon payments or residual values?',
      a: "No — this projects a standard reducing balance with regular payments. If your vehicle finance or lease has a balloon payment or residual amount due at the end, that's a separate lump sum this calculator doesn't account for.",
    },
    {
      q: "What interest rate should I use if I'm not sure?",
      a: "Use the APR or interest rate shown on your loan statement or agreement — it's usually stated clearly there. If only a monthly rate is shown, multiply it by 12 for a rough annual figure.",
    },
  ],
}
