-- Opportunity quality, detail pages, reporting and lightweight analytics.
-- Run after migrations 0001-0010.

alter table public.listings
  add column if not exists description text,
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists verified_at timestamptz,
  add column if not exists featured boolean not null default false,
  add column if not exists archived_at timestamptz;

alter table public.scholarships
  add column if not exists description text,
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists verified_at timestamptz,
  add column if not exists featured boolean not null default false,
  add column if not exists archived_at timestamptz;

create index if not exists listings_public_featured_idx
  on public.listings (featured desc, deadline asc) where published and archived_at is null;
create index if not exists scholarships_public_featured_idx
  on public.scholarships (featured desc, deadline asc) where published and archived_at is null;

create table if not exists public.opportunity_reports (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('listing', 'scholarship')),
  opportunity_id uuid not null,
  reason text not null check (char_length(reason) between 3 and 1000),
  reporter_email text,
  created_at timestamptz not null default now()
);

create index if not exists opportunity_reports_created_idx
  on public.opportunity_reports (created_at desc);

create table if not exists public.opportunity_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('listing', 'scholarship')),
  opportunity_id uuid not null,
  event text not null check (event in ('view', 'apply_click')),
  session_key text,
  created_at timestamptz not null default now()
);

create index if not exists opportunity_events_lookup_idx
  on public.opportunity_events (opportunity_id, event, created_at desc);

alter table public.opportunity_reports enable row level security;
alter table public.opportunity_events enable row level security;

create policy "anyone can report an opportunity"
  on public.opportunity_reports for insert with check (true);
create policy "admins can read opportunity reports"
  on public.opportunity_reports for select using (public.is_admin());

create policy "anyone can record opportunity events"
  on public.opportunity_events for insert with check (true);
create policy "admins can read opportunity events"
  on public.opportunity_events for select using (public.is_admin());