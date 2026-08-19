import type { ToolContent } from '../types'

export const avalancheVsSnowball: ToolContent = {
  slug: 'avalanche-vs-snowball-calculator',
  h1: 'Avalanche vs Snowball Calculator',
  dek: 'Compare both debt payoff strategies side by side using your real numbers, instead of guessing which one wins.',
  intro: [
    'Avalanche and Snowball are the two most common ways to decide which debt to attack first once your minimum payments are covered. Both use exactly the same amount of money every month — the only thing that changes between them is the order your debts get paid off in.',
    'Avalanche targets the debt with the highest interest rate first. Mathematically it\'s usually the cheaper route overall, because you spend less total time paying interest on your most expensive balance.',
    "Snowball targets the smallest balance first, regardless of its rate. It rarely saves as much in interest, but clearing a whole account sooner is, for a lot of people, the difference between staying motivated for the next debt and losing momentum halfway through.",
    "Neither is universally \"correct\" — this calculator runs both against your actual debts so you can see the real gap in time and interest for your specific situation, rather than picking one on faith.",
  ],
  faq: [
    {
      q: 'Is Avalanche always cheaper?',
      a: "Almost always, but not by a fixed amount — it depends on how spread out your interest rates are. If all your debts have similar rates, the two methods end up close to identical, and Snowball's motivational edge might matter more than the small interest difference.",
    },
    {
      q: 'Can I mix the two, or choose my own order?',
      a: "That's what a \"custom\" strategy is for — picking your own priority order debt by debt, for example clearing a small debt owed to a family member first regardless of what the maths says. ClearPath's full app supports that; this calculator sticks to the two standard methods for a quick comparison.",
    },
    {
      q: 'Why do both strategies show the same debt-free date sometimes?',
      a: "When there's enough extra payment in the budget to clear every debt well within its natural timeline, the order stops mattering much — both approaches converge on a similar result. The gap tends to be biggest when the budget is tighter.",
    },
  ],
}
