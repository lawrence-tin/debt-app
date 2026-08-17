# ClearPath — Debt Freedom Planner

A creative, personalized debt repayment planner. Add your debts and your
monthly budget, and ClearPath builds a real payoff plan — comparing the
**avalanche** (highest interest first) and **snowball** (smallest balance
first) strategies side by side, with a debt-free date, total interest paid,
a balance-over-time chart, and milestone checkpoints along the way.

Works entirely without an account — your data is saved in your browser's
`localStorage`. Optionally register/sign in to sync your debts and settings
to your own account (backed by Supabase) so they follow you across devices.

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
- Every currency (160 ISO codes, with flags) and three languages (English,
  Español, Français)
- Light/dark theme toggle
- **Optional account (email/password)** — register to sync your debts and
  budget settings to the cloud; works fully anonymously without one

## Tech stack

- [Vite](https://vite.dev) + React + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Recharts](https://recharts.org) for the payoff chart
- [lucide-react](https://lucide.dev) icons
- [Supabase](https://supabase.com) (Postgres + Auth) for optional account sync

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build      # production build to dist/
npm run preview    # preview the production build locally
```

By default (no further setup) the app runs fully client-side with no
accounts — the "Sign in" button only appears once cloud sync is configured
(see below).

## Enabling accounts (optional)

Accounts are powered by [Supabase](https://supabase.com)'s free tier
(Postgres + Auth), which a static site can talk to directly from the
browser — no custom backend server required.

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, open **SQL Editor → New query**, paste the
   contents of [`supabase/schema.sql`](supabase/schema.sql), and run it.
   This creates the `debts` and `settings` tables with row-level security
   so each user can only ever see their own data.
3. In **Project Settings → API**, copy the **Project URL** and the
   **`anon` `public`** key (never the `service_role` key).
4. Copy `.env.example` to `.env.local` and fill in those two values:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Restart the dev server (or rebuild). The "Sign in" button now appears in
   the header.

For a Netlify deploy, set the same two variables as **Environment
variables** in Site configuration → Environment (they're needed at build
time since Vite inlines them).

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
A `netlify.toml` is already included with these settings. Don't forget to
set the `VITE_SUPABASE_*` environment variables in Netlify if you want
accounts enabled on the deployed site.
