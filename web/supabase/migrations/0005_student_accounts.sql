-- Student accounts: saved opportunities and profile fields.
--
-- Run in the Supabase SQL editor after 0004. Safe to re-run.
--
-- Accounts are OPTIONAL by design. The boards stay readable by anon, because
-- the landing page promises no sign-up is needed and that promise is worth more
-- than the signups a gate would win. An account buys you saved opportunities
-- now, and personalised alerts in Phase 3 — it never buys you access.
--
-- `profiles` already exists from 0001 with a role enum defaulting to 'student',
-- so this only adds the fields a student profile needs.

alter table public.profiles
  add column if not exists university   text,
  add column if not exists course       text,
  add column if not exists year_of_study text,
  add column if not exists country      text;

-- ------------------------------------------------------ saved opportunities --

create table if not exists public.saved_opportunities (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  -- Which board the row came from. Not a foreign key: a student's saved list
  -- should survive the team unpublishing or replacing a listing.
  kind       text not null check (kind in ('listing', 'scholarship')),
  slug       text not null,
  created_at timestamptz not null default now(),

  unique (user_id, kind, slug)
);

comment on table public.saved_opportunities is
  'Opportunities a student bookmarked. Referenced by slug so the list is not
   broken by an admin deleting or re-creating the underlying row.';

create index if not exists saved_opportunities_user_idx
  on public.saved_opportunities (user_id, created_at desc);

-- --------------------------------------------------------------------- RLS --
-- A saved list is private. Every policy is scoped to the owning user — an admin
-- has no business reading which internships a particular student bookmarked.

alter table public.saved_opportunities enable row level security;

create policy "students read their own saved opportunities"
  on public.saved_opportunities for select
  using (user_id = auth.uid());

create policy "students save their own opportunities"
  on public.saved_opportunities for insert
  with check (user_id = auth.uid());

create policy "students remove their own saved opportunities"
  on public.saved_opportunities for delete
  using (user_id = auth.uid());
