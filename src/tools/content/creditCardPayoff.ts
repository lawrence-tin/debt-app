import type { ToolContent } from '../types'

export const creditCardPayoff: ToolContent = {
  slug: 'credit-card-payoff-calculator',
  h1: 'Credit Card Payoff Calculator',
  dek: 'See how long your card balance will really take to clear at your current payment — and how much a bit extra each month changes that.',
  intro: [
    'Credit cards are usually the most expensive debt someone carries, simply because the interest rate is high and compounds monthly. Paying only the minimum keeps the account in good standing, but on a high-APR card, a large share of that payment can go straight to interest rather than the balance — which is why "minimum payment" and "fast payoff" are often two very different things.',
    "This calculator runs the real month-by-month numbers for a single card: how the balance shrinks (or doesn't) at your current payment, and what changes if you add a bit extra. It's the same underlying calculation a full amortisation schedule uses, just focused on one account.",
    'If you\'re carrying more than one card or other debts alongside it, a single-card view like this can undersell how long the whole picture actually takes — for that, the multi-debt calculators handle everything together.',
  ],
  faq: [
    {
      q: 'Why does my balance barely move some months even though I\'m paying?',
      a: "On a high-APR card, interest is charged on the balance before your payment is applied. If the payment is only slightly above the interest charged that month, most of it is effectively cancelling out interest rather than reducing what you owe — which is why the balance can feel stuck even while you're paying on time.",
    },
    {
      q: "What's a realistic extra payment to try?",
      a: "There's no fixed answer — even a modest amount matters, because it comes straight off the balance instead of covering interest. Try a few different amounts in the slider above and compare the interest-saved figure; it's usually a bigger jump than people expect.",
    },
    {
      q: 'Does this account for annual fees or other charges?',
      a: "No — this is a payoff projection based on balance, interest rate and payment only. Annual fees, over-limit charges, or promotional-rate expirations aren't included, since those vary by card and aren't something a generic calculator can know.",
    },
  ],
}
