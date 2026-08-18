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
  apr numeric not null default 0,
  min_payment numeric not null default 0,
  due_day smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Existing installs: add columns introduced after the initial release.
alter table public.debts add column if not exists due_day smallint;

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
  updated_at timestamptz not null default now()
);

alter table public.settings add column if not exists priority_order jsonb not null default '[]'::jsonb;

alter table public.debts enable row level security;
alter table public.settings enable row level security;

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
