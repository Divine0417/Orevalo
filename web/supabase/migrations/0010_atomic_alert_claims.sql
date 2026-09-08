-- A single conflict target lets the cron claim a delivery atomically with
-- upsert. The older partial indexes remain useful for readable constraints.

alter table public.alert_deliveries
  add column if not exists recipient_key uuid generated always as (coalesce(user_id, subscriber_id)) stored;

create unique index if not exists alert_deliveries_recipient_unique
  on public.alert_deliveries (recipient_key, kind, slug, reason);