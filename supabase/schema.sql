-- ClearPath: user accounts schema
-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
-- Safe to re-run: uses "if not exists" / "or replace" throughout.

create extension if not exists pgcrypto;

-- One row per debt, owned by the user who created it.
create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default 'other',
  balance numeric not null default 0,
  original_balance numeric,
  apr numeric not null default 0,
  min_payment numeric not null default 0,
  due_day smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Existing installs: add columns introduced after the initial release.
alter table public.debts add column if not exists due_day smallint;
alter table public.debts add column if not exists original_balance numeric;

create index if not exists debts_user_id_idx on public.debts (user_id);

-- One row per user: income/budget/preferences.
create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  monthly_income numeric not null default 0,
  fixed_expenses numeric not null default 0,
  extra_payment numeric not null default 0,
  strategy text not null default 'avalanche',
  priority_order jsonb not null default '[]'::jsonb,
  currency text not null default 'USD',
  language text not null default 'en',
  theme text not null default 'light',
  tried_strategies jsonb not null default '[]'::jsonb,
  has_downloaded_report boolean not null default false,
  plan_baseline jsonb,
  updated_at timestamptz not null default now()
);

alter table public.settings add column if not exists priority_order jsonb not null default '[]'::jsonb;
alter table public.settings add column if not exists tried_strategies jsonb not null default '[]'::jsonb;
alter table public.settings add column if not exists has_downloaded_report boolean not null default false;
alter table public.settings add column if not exists plan_baseline jsonb;

-- One row per payment logged against a debt's recurring due date.
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  debt_id uuid not null references public.debts(id) on delete cascade,
  -- Billing period this payment covers, as 'YYYY-MM'.
  period text not null,
  paid_at timestamptz not null default now(),
  unique (debt_id, period)
);

create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists payments_debt_id_idx on public.payments (debt_id);

-- One row per saved "what if" scenario.
create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  extra_payment numeric not null default 0,
  strategy text not null default 'avalanche',
  priority_order jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists scenarios_user_id_idx on public.scenarios (user_id);

-- One row per person who expressed interest in ClearPath Plus (Phase 6: interest-only
-- waitlist, no real billing yet). Not tied to an account — anyone can join, signed in or
-- not — so there is deliberately no user_id/select policy: this table is write-only from
-- the client. Only the project owner can read entries, via the Supabase dashboard.
create table if not exists public.plus_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  locale text,
  currency text,
  created_at timestamptz not null default now(),
  unique (email)
);

alter table public.debts enable row level security;
alter table public.settings enable row level security;
alter table public.payments enable row level security;
alter table public.scenarios enable row level security;
alter table public.plus_waitlist enable row level security;

-- Each user may only see/change their own rows.
drop policy if exists "debts_select_own" on public.debts;
create policy "debts_select_own" on public.debts
  for select using (auth.uid() = user_id);

drop policy if exists "debts_insert_own" on public.debts;
create policy "debts_insert_own" on public.debts
  for insert with check (auth.uid() = user_id);

drop policy if exists "debts_update_own" on public.debts;
create policy "debts_update_own" on public.debts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "debts_delete_own" on public.debts;
create policy "debts_delete_own" on public.debts
  for delete using (auth.uid() = user_id);

drop policy if exists "settings_select_own" on public.settings;
create policy "settings_select_own" on public.settings
  for select using (auth.uid() = user_id);

drop policy if exists "settings_insert_own" on public.settings;
create policy "settings_insert_own" on public.settings
  for insert with check (auth.uid() = user_id);

drop policy if exists "settings_update_own" on public.settings;
create policy "settings_update_own" on public.settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "settings_delete_own" on public.settings;
create policy "settings_delete_own" on public.settings
  for delete using (auth.uid() = user_id);

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments
  for select using (auth.uid() = user_id);

drop policy if exists "payments_insert_own" on public.payments;
create policy "payments_insert_own" on public.payments
  for insert with check (auth.uid() = user_id);

drop policy if exists "payments_delete_own" on public.payments;
create policy "payments_delete_own" on public.payments
  for delete using (auth.uid() = user_id);

drop policy if exists "scenarios_select_own" on public.scenarios;
create policy "scenarios_select_own" on public.scenarios
  for select using (auth.uid() = user_id);

drop policy if exists "scenarios_insert_own" on public.scenarios;
create policy "scenarios_insert_own" on public.scenarios
  for insert with check (auth.uid() = user_id);

drop policy if exists "scenarios_update_own" on public.scenarios;
create policy "scenarios_update_own" on public.scenarios
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "scenarios_delete_own" on public.scenarios;
create policy "scenarios_delete_own" on public.scenarios
  for delete using (auth.uid() = user_id);

-- Anyone may register interest; nobody can read the list back through the client API.
drop policy if exists "plus_waitlist_insert_anyone" on public.plus_waitlist;
create policy "plus_waitlist_insert_anyone" on public.plus_waitlist
  for insert with check (true);
