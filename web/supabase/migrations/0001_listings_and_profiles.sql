-- Orevalo Phase 1 schema: internship listings + role-aware profiles.
--
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> New query),
-- or with the Supabase CLI: `supabase db push`.
--
-- Design note on accounts:
--   Students do NOT need an account to browse the board — anon can read every
--   published listing. Accounts exist for two reasons: admins need one now to
--   use the dashboard, and students will need one in Phase 3 for personalised
--   alerts and Premium. Building `profiles` with a role column now means that
--   later phase is a new row type, not a migration of the auth model.

-- ---------------------------------------------------------------- profiles --

create type public.user_role as enum ('student', 'admin');

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text        not null,
  full_name   text,
  role        public.user_role not null default 'student',
  created_at  timestamptz not null default now()
);

comment on table public.profiles is
  'One row per auth user. role=admin grants write access to listings.';

-- Every new auth user gets a profile automatically, defaulting to student.
-- Admins are promoted deliberately (see the note at the bottom of this file).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper used by the listings policies. SECURITY DEFINER so that checking your
-- own role does not itself require a policy that reads profiles (which would
-- recurse).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------- listings --

create table if not exists public.listings (
  id          uuid primary key default gen_random_uuid(),
  slug        text        not null unique,
  company     text        not null,
  title       text        not null,
  location    text        not null,
  field       text        not null,
  deadline    date        not null,
  apply_url   text        not null,
  published   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint listings_apply_url_is_http check (apply_url ~* '^https?://'),
  constraint listings_slug_format check (slug ~ '^[a-z0-9-]+$')
);

comment on column public.listings.published is
  'Unpublished rows stay editable in the admin dashboard but are invisible to the public board.';

-- The board sorts by deadline and filters by field/location on every request.
create index if not exists listings_deadline_idx on public.listings (deadline);
create index if not exists listings_filters_idx
  on public.listings (field, location) where published;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists listings_touch_updated_at on public.listings;
create trigger listings_touch_updated_at
  before update on public.listings
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------------- RLS --
-- Enabled before any real row goes in. The anon key is public by definition,
-- so these policies are the only thing standing between it and your data.

alter table public.profiles enable row level security;
alter table public.listings enable row level security;

-- Profiles: you can see and edit yourself; admins can see everyone.
create policy "profiles are readable by their owner"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles are updatable by their owner"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- Listings: the whole point of the board is that anyone can read it.
create policy "published listings are world readable"
  on public.listings for select
  using (published or public.is_admin());

create policy "admins can insert listings"
  on public.listings for insert
  with check (public.is_admin());

create policy "admins can update listings"
  on public.listings for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins can delete listings"
  on public.listings for delete
  using (public.is_admin());

-- ------------------------------------------------------------------- seed --
-- The five listings the static board shipped with, so the table is not empty
-- on first load. Safe to re-run.

insert into public.listings (slug, company, title, location, field, deadline, apply_url)
values
  ('flutterwave-software-engineering-intern', 'Flutterwave', 'Software Engineering Intern', 'Remote', 'Technology', '2026-09-30', 'https://example.com/apply/flutterwave'),
  ('access-bank-graduate-trainee',            'Access Bank',  'Graduate Trainee',            'Lagos',  'Finance',    '2026-10-15', 'https://example.com/apply/access-bank'),
  ('dangote-business-development-intern',     'Dangote Group','Business Development Intern', 'Abuja',  'Business',   '2026-09-20', 'https://example.com/apply/dangote'),
  ('mtn-nigeria-technology-intern',           'MTN Nigeria',  'Technology Intern',           'Lagos',  'Technology', '2026-10-01', 'https://example.com/apply/mtn'),
  ('pwc-nigeria-accounting-intern',           'PwC Nigeria',  'Accounting Intern',           'Lagos',  'Finance',    '2026-10-10', 'https://example.com/apply/pwc')
on conflict (slug) do nothing;

-- ------------------------------------------------------ making an admin ----
-- Sign up through /admin/login first (or Dashboard -> Authentication -> Users),
-- then promote that user once:
--
--   update public.profiles set role = 'admin' where email = 'you@orevalo.com';
--
-- Deliberately not automated: a default-admin rule is how a public signup form
-- turns into a public write endpoint.
