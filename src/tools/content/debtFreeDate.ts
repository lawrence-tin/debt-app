import type { ToolContent } from '../types'

export const debtFreeDate: ToolContent = {
  slug: 'debt-free-date-calculator',
  h1: 'Debt-Free Date Calculator',
  dek: 'Add what you owe and see the actual month and year you could be debt-free — not a guess, a real month-by-month projection.',
  intro: [
    "Most people have a rough sense of how much they owe, but not a real date attached to it. This calculator runs the actual math — interest, minimum payments, and any extra you add — month by month, the same way a bank statement would, to land on a specific month and year rather than a vague \"eventually.\"",
    "A debt-free date isn't fixed. It moves. Every extra rand you put toward a balance, every rate that changes, every new debt you take on shifts it — which is exactly why it's worth checking again whenever your situation changes, not just once.",
    "This tool handles multiple debts at once and directs extra payments strategically rather than splitting them evenly across everything, which is usually the difference between a date that's realistic and one that's overly optimistic.",
  ],
  faq: [
    {
      q: 'How accurate is this debt-free date?',
      a: "It's a projection based on exactly what you enter — current balances, interest rates and payments. It assumes rates stay the same and no new debt is added. Real results can differ because of fees, rate changes, or a missed payment, but the underlying calculation (compound interest, minimum payments, extra-payment cascades) is the same math a full amortisation schedule uses.",
    },
    {
      q: 'Why does adding a small extra payment move the date by so much?',
      a: 'Extra payments go straight to the balance, which reduces the interest charged every month after that — the effect compounds over time. A modest extra amount added early can save more than the same amount added right before the end.',
    },
    {
      q: 'What if I have more than two debts?',
      a: "Add as many as you need with \"Add another debt.\" The calculator pays every minimum first, then directs whatever's left to whichever debt is prioritised — highest rate first by default here.",
    },
  ],
}
