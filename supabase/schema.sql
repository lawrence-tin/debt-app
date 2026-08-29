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

-- One row per payment logged against a debt — a real ledger entry, not just a
-- once-per-period marker: a debt can legitimately receive more than one payment in the
-- same billing period (e.g. R1,000 on the 1st and another R500 on the 15th).
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  debt_id uuid not null references public.debts(id) on delete cascade,
  amount numeric not null default 0,
  -- Billing period this payment counts toward, as 'YYYY-MM' — used to resolve Reminders'
  -- "already paid this cycle" state, not to constrain how many payments a period can have.
  period text not null,
  paid_at timestamptz not null default now()
);

-- Existing installs: add the amount column, and drop the old one-payment-per-period
-- constraint — it silently rejected a second legitimate payment against the same debt in
-- the same month (the app's own insert only declares `id` as its upsert conflict target,
-- so that second insert failed as an unhandled unique-constraint violation and was
-- swallowed by the caller's best-effort error handling).
alter table public.payments add column if not exists amount numeric not null default 0;
alter table public.payments drop constraint if exists payments_debt_id_period_key;

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

-- First-party product-analytics event log (spec section 18). Deliberately not a
-- third-party vendor — events never leave this Supabase project. visitor_id is an
-- anonymous, client-generated id persisted in localStorage (not the auth user id),
-- so the activation/retention funnel can be measured before someone ever signs in.
-- Write-only from the client, same pattern as plus_waitlist above: only the project
-- owner can read it back, via the Supabase dashboard or a service-role query — see
-- supabase/analytics-queries.md for ready-to-run funnel queries.
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null,
  user_id uuid references auth.users(id) on delete set null,
  event text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_visitor_id_idx on public.analytics_events (visitor_id);
create index if not exists analytics_events_event_idx on public.analytics_events (event);
create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at);

-- ClearPath Plus: one row per user tracking their Paystack subscription state. Written
-- only by the paystack-webhook Netlify Function using the service_role key (which bypasses
-- RLS) — never directly by the client, since subscription status must only ever change in
-- response to a real, signature-verified event from Paystack. Users may read their own row
-- so the app can show/hide Plus features.
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  -- 'inactive' | 'active' | 'cancelled' | 'past_due' — mirrors Paystack's subscription
  -- lifecycle; the app only unlocks Plus features when this is 'active'.
  status text not null default 'inactive',
  paystack_customer_code text,
  paystack_subscription_code text,
  plan_code text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A shared "couple plan" link: the owner is whoever's debts/settings/payments/scenarios
-- are being shared; the member is the person granted access once they accept. Only usable
-- while the owner has an active subscription (enforced in the RLS policies below, not just
-- at invite time) — access silently stops the moment a subscription lapses, no cleanup job
-- required.
create table if not exists public.plan_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  member_id uuid references auth.users(id) on delete cascade,
  invited_email text not null,
  -- 'pending' until the invited person (signed in with a matching email) accepts it.
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (owner_id, invited_email)
);

create index if not exists plan_members_owner_id_idx on public.plan_members (owner_id);
create index if not exists plan_members_member_id_idx on public.plan_members (member_id);

alter table public.debts enable row level security;
alter table public.settings enable row level security;
alter table public.payments enable row level security;
alter table public.scenarios enable row level security;
alter table public.plus_waitlist enable row level security;
alter table public.analytics_events enable row level security;
alter table public.subscriptions enable row level security;
alter table public.plan_members enable row level security;

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

-- Anyone (signed in or not) may log a product event; nobody can read events back
-- through the client API.
drop policy if exists "analytics_events_insert_anyone" on public.analytics_events;
create policy "analytics_events_insert_anyone" on public.analytics_events
  for insert with check (true);

-- subscriptions: read-only from the client. Only the paystack-webhook function (using
-- service_role, which bypasses RLS entirely) ever writes to this table.
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- plan_members: an owner may invite (insert) only while their own subscription is active,
-- and only ever as themselves. Both the owner and the invited person (by email, before
-- they've necessarily accepted) may see the row so an unsent invite is visible to whoever
-- it was meant for. Only the invited person may accept it (update from 'pending' to
-- 'accepted', claiming member_id as themselves) — an owner can't self-accept their own
-- invite. Either side may delete it (owner revokes, or member leaves the shared plan).
drop policy if exists "plan_members_select_own_or_invited" on public.plan_members;
create policy "plan_members_select_own_or_invited" on public.plan_members
  for select using (
    auth.uid() = owner_id
    or auth.uid() = member_id
    or lower(invited_email) = lower(auth.jwt() ->> 'email')
  );

drop policy if exists "plan_members_insert_if_subscribed" on public.plan_members;
create policy "plan_members_insert_if_subscribed" on public.plan_members
  for insert with check (
    auth.uid() = owner_id
    and exists (
      select 1 from public.subscriptions s
      where s.user_id = auth.uid() and s.status = 'active'
    )
  );

drop policy if exists "plan_members_accept_own_invite" on public.plan_members;
create policy "plan_members_accept_own_invite" on public.plan_members
  for update using (
    lower(invited_email) = lower(auth.jwt() ->> 'email')
  )
  with check (member_id = auth.uid());

drop policy if exists "plan_members_delete_owner_or_member" on public.plan_members;
create policy "plan_members_delete_owner_or_member" on public.plan_members
  for delete using (auth.uid() = owner_id or auth.uid() = member_id);

-- Shared-plan access to an owner's debts/settings/payments/scenarios: an accepted member
-- gets the same read/write access the owner has, but ONLY while the owner's subscription is
-- still active — checked live on every query, not just at invite time, so access revokes
-- itself automatically the moment a subscription lapses. These are additive to the
-- "_own" policies above (Postgres ORs multiple permissive policies together for the same
-- command), so existing single-user behavior is unchanged.
drop policy if exists "debts_shared_access" on public.debts;
create policy "debts_shared_access" on public.debts
  for all using (
    exists (
      select 1 from public.plan_members pm
      join public.subscriptions s on s.user_id = pm.owner_id and s.status = 'active'
      where pm.owner_id = debts.user_id and pm.member_id = auth.uid() and pm.status = 'accepted'
    )
  );

drop policy if exists "settings_shared_access" on public.settings;
create policy "settings_shared_access" on public.settings
  for all using (
    exists (
      select 1 from public.plan_members pm
      join public.subscriptions s on s.user_id = pm.owner_id and s.status = 'active'
      where pm.owner_id = settings.user_id and pm.member_id = auth.uid() and pm.status = 'accepted'
    )
  );

drop policy if exists "payments_shared_access" on public.payments;
create policy "payments_shared_access" on public.payments
  for all using (
    exists (
      select 1 from public.plan_members pm
      join public.subscriptions s on s.user_id = pm.owner_id and s.status = 'active'
      where pm.owner_id = payments.user_id and pm.member_id = auth.uid() and pm.status = 'accepted'
    )
  );

drop policy if exists "scenarios_shared_access" on public.scenarios;
create policy "scenarios_shared_access" on public.scenarios
  for all using (
    exists (
      select 1 from public.plan_members pm
      join public.subscriptions s on s.user_id = pm.owner_id and s.status = 'active'
      where pm.owner_id = scenarios.user_id and pm.member_id = auth.uid() and pm.status = 'accepted'
    )
  );
