-- Phase 3, part 1: Opportunity Alerts.
--
-- Run in the Supabase SQL editor after 0005. Safe to re-run.
--
-- Two audiences, deliberately:
--   * subscribers (no account) get a general digest of everything new. They are
--     the existing list and should not have to sign up to keep hearing from us.
--   * account holders with preferences get only what matches their course,
--     field and location — which is what the roadmap means by personalised.
--
-- alert_deliveries is the important table. Without a record of what was already
-- sent, any retry or overlapping cron run mails the same opportunity twice, and
-- nothing erodes an opt-in list faster than repeats.

-- ------------------------------------------------------- alert preferences --

create table if not exists public.alert_preferences (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  fields         text[] not null default '{}',
  locations      text[] not null default '{}',
  degree_levels  text[] not null default '{}',
  -- 'off' is stored rather than deleting the row, so turning alerts back on
  -- does not lose the student's carefully chosen filters.
  frequency      text   not null default 'weekly'
                   check (frequency in ('off', 'daily', 'weekly')),
  deadline_reminders boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on column public.alert_preferences.fields is
  'Empty array means "everything" — an empty filter should not mean no email.';

drop trigger if exists alert_preferences_touch_updated_at on public.alert_preferences;
create trigger alert_preferences_touch_updated_at
  before update on public.alert_preferences
  for each row execute function public.touch_updated_at();

-- -------------------------------------------------------- delivery ledger --

create table if not exists public.alert_deliveries (
  id           uuid primary key default gen_random_uuid(),
  -- Exactly one of these identifies the recipient.
  user_id      uuid references auth.users (id) on delete cascade,
  subscriber_id uuid references public.subscribers (id) on delete cascade,
  kind         text not null check (kind in ('listing', 'scholarship')),
  slug         text not null,
  reason       text not null check (reason in ('new', 'deadline_7', 'deadline_1')),
  sent_at      timestamptz not null default now(),

  constraint alert_deliveries_has_recipient
    check (num_nonnulls(user_id, subscriber_id) = 1)
);

-- The uniqueness that makes the job safe to re-run. Partial indexes because
-- one of the two recipient columns is always null.
create unique index if not exists alert_deliveries_user_unique
  on public.alert_deliveries (user_id, kind, slug, reason) where user_id is not null;

create unique index if not exists alert_deliveries_subscriber_unique
  on public.alert_deliveries (subscriber_id, kind, slug, reason) where subscriber_id is not null;

-- --------------------------------------------------------------------- RLS --

alter table public.alert_preferences enable row level security;
alter table public.alert_deliveries  enable row level security;

create policy "students read their own alert preferences"
  on public.alert_preferences for select using (user_id = auth.uid());

create policy "students set their own alert preferences"
  on public.alert_preferences for insert with check (user_id = auth.uid());

create policy "students update their own alert preferences"
  on public.alert_preferences for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- The ledger is written only by the cron job, which uses the service-role key
-- and bypasses RLS. No policy is granted to anon or authenticated on purpose:
-- who was emailed what is not a student-facing record.
create policy "admins read the delivery ledger"
  on public.alert_deliveries for select using (public.is_admin());
