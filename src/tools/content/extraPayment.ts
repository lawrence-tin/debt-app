import type { ToolContent } from '../types'

export const extraPayment: ToolContent = {
  slug: 'extra-payment-calculator',
  h1: 'Extra Payment Calculator',
  dek: 'Find out exactly how much time and interest a specific extra amount saves — before you commit to it.',
  intro: [
    'It\'s a common question with no obvious answer: is it actually worth putting extra toward debt each month, or would that money do more elsewhere? The honest answer depends entirely on the interest rate and how much is already owed — which is exactly what this calculator works out.',
    'Any amount paid above the combined minimum payments goes straight toward reducing a balance faster, which lowers the interest charged on it going forward. As each debt clears, the money that used to go toward its minimum doesn\'t disappear — it rolls onto the next one, so the effect builds rather than staying flat.',
    'Drag the slider below with your own numbers and watch both the time saved and interest saved change in real time. Small amounts often make a bigger difference than expected, especially on higher-interest balances.',
  ],
  faq: [
    {
      q: "Is R200 extra a month actually worth it?",
      a: "It depends on the interest rate it's targeting — on a low-interest debt the effect is modest, but on a high-APR credit card or store account, even a modest extra amount can noticeably move the debt-free date, because it's reducing the balance that interest gets calculated on every month after.",
    },
    {
      q: 'Where does the extra payment actually go if I have several debts?',
      a: 'It goes to whichever debt is prioritised first under your chosen strategy — highest interest rate first by default here — while every other debt still gets at least its minimum. Once that priority debt clears, the extra rolls onto the next one automatically.',
    },
    {
      q: "What if I can only afford extra some months, not every month?",
      a: "This calculator assumes the extra amount is paid consistently every month, since that's what a fair projection needs. In practice, paying extra whenever you can still helps — it just won't land exactly on the date shown here if it's irregular.",
    },
  ],
}
