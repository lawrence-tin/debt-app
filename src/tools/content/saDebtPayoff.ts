import type { ToolContent } from '../types'

export const saDebtPayoff: ToolContent = {
  slug: 'south-africa-debt-payoff-calculator',
  h1: 'South African Debt Payoff Calculator',
  dek: 'Built around South African debt types — credit cards, store accounts, vehicle finance and more — to show your full payoff plan in one place.',
  intro: [
    'Most debt calculators are built with a single kind of debt in mind. South African households more often carry a mix — a credit card, a store account or two, vehicle finance, maybe a personal loan — each with its own rate and minimum, which makes it hard to see the full picture from any one of them alone.',
    "This calculator adds every debt together into one plan: total minimum payments, a combined debt-free date, and how Avalanche and Snowball strategies compare across everything at once, rather than one account at a time.",
    "Store accounts and credit cards in particular tend to carry some of the highest interest rates of any debt type, often well above a personal loan or vehicle finance — which is exactly the kind of thing an Avalanche-style strategy (highest rate first) is built to target.",
  ],
  faq: [
    {
      q: 'What debt types can I add?',
      a: "Anything with a balance, an interest rate and a minimum payment — credit cards, store accounts, vehicle finance, personal loans, overdrafts, or a home loan. The calculator treats them the same way mathematically; the labels are just for your own reference.",
    },
    {
      q: 'Should I add a home loan to this?',
      a: "You can, but home loans usually run over a much longer term at a lower rate than short-term debt, so including one can make the combined debt-free date look further out than it feels for your other, faster-moving debts. Many people prefer to plan short-term debt separately from a home loan for that reason.",
    },
    {
      q: 'Is this the same as formal debt review?',
      a: "No — this is a self-directed planning calculator, not a registered debt counselling process. If your repayments feel unmanageable rather than just slow, a registered debt counsellor or the National Credit Regulator can help you understand whether formal debt review fits your situation.",
    },
  ],
}
