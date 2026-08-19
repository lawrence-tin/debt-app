# ClearPath analytics queries

Reference queries for the funnel and product metrics from the product spec (section 18),
run against the `analytics_events` table. Paste these into the Supabase dashboard's SQL
Editor — the table is write-only from the app itself (no `select` policy), so this is the
only place to read it.

The funnel:

```
Visitor -> Started plan -> Added debt -> Completed plan -> Saw debt-free date ->
Ran scenario -> Saved plan/account -> Returned after 30 days -> Paid subscription
```

Events logged today: `visitor`, `plan_started`, `debt_added`, `plan_completed`,
`saw_debt_free_date`, `simulator_used`, `scenario_saved`, `plan_saved`, `account_created`,
`plus_interest`. There is no `paid` event yet — real billing hasn't shipped, so
free-to-paid conversion, paid retention and ARPU aren't computable until it does.
`plus_interest` (from the Plus waitlist) is the closest current signal of willingness to pay.

## Funnel counts and step-over-step rates

```sql
with counts as (
  select event, count(distinct visitor_id) as visitors
  from analytics_events
  group by event
)
select
  event,
  visitors,
  round(100.0 * visitors / nullif((select visitors from counts where event = 'visitor'), 0), 1) as pct_of_visitors
from counts
order by
  array_position(
    array['visitor','plan_started','debt_added','plan_completed','saw_debt_free_date',
          'simulator_used','scenario_saved','plan_saved','account_created','plus_interest'],
    event
  );
```

## Individual metrics

**Plan-start rate** (visitors who started a plan)
```sql
select round(100.0 * count(distinct visitor_id) filter (where event = 'plan_started')
  / nullif(count(distinct visitor_id) filter (where event = 'visitor'), 0), 1) as plan_start_rate_pct
from analytics_events;
```

**Plan-completion rate** (of those who started, who completed)
```sql
select round(100.0 * count(distinct visitor_id) filter (where event = 'plan_completed')
  / nullif(count(distinct visitor_id) filter (where event = 'plan_started'), 0), 1) as plan_completion_rate_pct
from analytics_events;
```

**Time to first debt-free projection** (median minutes from first visit to first seeing a result)
```sql
select percentile_cont(0.5) within group (order by first_seen.ts) as median_seconds_to_projection
from (
  select
    visitor_id,
    extract(epoch from (
      min(created_at) filter (where event = 'saw_debt_free_date')
      - min(created_at) filter (where event = 'visitor')
    )) as ts
  from analytics_events
  group by visitor_id
) first_seen
where first_seen.ts is not null;
```

**Scenario usage rate** (of those who completed a plan, who engaged with the simulator or saved a scenario)
```sql
select round(100.0 * count(distinct visitor_id) filter (where event in ('simulator_used', 'scenario_saved'))
  / nullif(count(distinct visitor_id) filter (where event = 'plan_completed'), 0), 1) as scenario_usage_rate_pct
from analytics_events;
```

**Account creation rate** (of those who completed a plan, who created an account)
```sql
select round(100.0 * count(distinct visitor_id) filter (where event = 'account_created')
  / nullif(count(distinct visitor_id) filter (where event = 'plan_completed'), 0), 1) as account_creation_rate_pct
from analytics_events;
```

**30-day return rate** (visitors with two 'visitor' events at least 30 days apart)
```sql
with spans as (
  select visitor_id, max(created_at) - min(created_at) as span
  from analytics_events
  where event = 'visitor'
  group by visitor_id
)
select
  round(100.0 * count(*) filter (where span >= interval '30 days') / nullif(count(*), 0), 1) as returned_after_30_days_pct
from spans;
```

**Monthly active planners** (distinct visitors with any event in the last 30 days)
```sql
select count(distinct visitor_id) as monthly_active_planners
from analytics_events
where created_at >= now() - interval '30 days';
```

**Plus waitlist interest** (a proxy for willingness to pay until real billing exists)
```sql
select count(*) as waitlist_signups from plus_waitlist;
```

## Notes

- `visitor_id` is anonymous and client-generated (localStorage), not the Supabase auth
  user id — it exists before anyone signs in, which is what makes the funnel and 30-day
  return queries work pre-signup. `user_id` is attached to an event only when the visitor
  happened to be signed in at that moment.
- Every funnel event except `visitor` is deduplicated per browser by the client itself
  (`src/lib/analytics.ts`), so these counts are already "distinct visitors reached this
  step," not raw event volume — `count(distinct visitor_id)` above is technically
  redundant with that dedup, but kept explicit in case that ever changes.
- Free-to-paid conversion, paid retention and average revenue per paying user aren't in
  this file because there's no `paid` event to compute them from yet.
