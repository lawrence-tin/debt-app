# ClearPath — Debt Freedom Planner

A creative, personalized debt repayment planner. Add your debts and your
monthly budget, and ClearPath builds a real payoff plan — comparing the
**avalanche** (highest interest first) and **snowball** (smallest balance
first) strategies side by side, with a debt-free date, total interest paid,
a balance-over-time chart, and milestone checkpoints along the way.

Everything runs client-side: your data is saved only in your browser's
`localStorage`, nothing is sent to a server.

## Features

- Add unlimited debts (credit cards, student loans, auto loans, etc.)
- Set your income, expenses, and how much extra you can put toward debt
- Live comparison of avalanche vs. snowball strategies, with the cheaper
  option automatically flagged
- Debt-free date, total interest paid, interest saved vs. minimum-only
  payments, and time saved
- Balance-over-time chart (Recharts)
- Milestone checkpoints (25% / 50% / 75% / 100% paid off) and a payoff
  order timeline
- Light/dark theme toggle
- Data persists locally between visits

## Tech stack

- [Vite](https://vite.dev) + React + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Recharts](https://recharts.org) for the payoff chart
- [lucide-react](https://lucide.dev) icons

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build      # production build to dist/
npm run preview    # preview the production build locally
```

## Deploying to Netlify

This is a static site — `npm run build` produces a `dist/` folder ready to
deploy as-is.

**Via the Netlify CLI:**

```bash
npx netlify-cli login
npx netlify-cli init      # or: netlify link, if the site already exists
npx netlify-cli deploy --prod --dir=dist
```

**Via drag-and-drop:** run `npm run build`, then drag the `dist/` folder
onto [app.netlify.com/drop](https://app.netlify.com/drop).

**Via Git:** push this repo to GitHub/GitLab/Bitbucket and connect it in
Netlify with build command `npm run build` and publish directory `dist`.
A `netlify.toml` is already included with these settings.
