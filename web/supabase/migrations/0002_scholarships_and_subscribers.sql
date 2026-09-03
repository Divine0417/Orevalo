-- Orevalo Phase 1, part 2: scholarships + owned subscriber list.
--
-- Run in the Supabase SQL editor after 0001. Safe to re-run.
--
-- Why these two tables:
--   * Scholarship Finder is the other half of Phase 1 in the roadmap and had
--     no storage at all.
--   * Subscriber emails were going only to Formspree, so the list was not ours
--     and Phase 3 alerts had nothing to send to. Formspree stays as the
--     notification path; this table is the record.

-- Case-insensitive text, so Ada@x.com and ada@x.com cannot both subscribe.
create extension if not exists citext;

-- ------------------------------------------------------------ scholarships --

create table if not exists public.scholarships (
  id           uuid primary key default gen_random_uuid(),
  slug         text        not null unique,
  name         text        not null,
  funder       text        not null,
  country      text        not null,
  field        text        not null,
  degree_level text        not null,
  deadline     date,
  eligibility  text,
  apply_url    text        not null,
  published    boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint scholarships_apply_url_is_http check (apply_url ~* '^https?://'),
  constraint scholarships_slug_format check (slug ~ '^[a-z0-9-]+$')
);

comment on column public.scholarships.deadline is
  'Nullable: many scholarships are rolling or vary by partner university.';

create index if not exists scholarships_deadline_idx on public.scholarships (deadline);
create index if not exists scholarships_filters_idx
  on public.scholarships (country, field, degree_level) where published;

drop trigger if exists scholarships_touch_updated_at on public.scholarships;
create trigger scholarships_touch_updated_at
  before update on public.scholarships
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------- subscribers --

create table if not exists public.subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         citext      not null unique,
  source        text        not null default 'landing',
  confirmed     boolean     not null default false,
  unsubscribed  boolean     not null default false,
  created_at    timestamptz not null default now()
);

comment on table public.subscribers is
  'Students who asked for opportunity emails. Not a waitlist — the board is public.';

create index if not exists subscribers_active_idx
  on public.subscribers (created_at desc) where not unsubscribed;

-- --------------------------------------------------------------------- RLS --

alter table public.scholarships enable row level security;
alter table public.subscribers  enable row level security;

create policy "published scholarships are world readable"
  on public.scholarships for select
  using (published or public.is_admin());

create policy "admins can insert scholarships"
  on public.scholarships for insert with check (public.is_admin());

create policy "admins can update scholarships"
  on public.scholarships for update using (public.is_admin()) with check (public.is_admin());

create policy "admins can delete scholarships"
  on public.scholarships for delete using (public.is_admin());

-- Anyone may subscribe; only admins may read the list. Without the read
-- restriction the anon key would expose every subscriber's email address.
create policy "anyone can subscribe"
  on public.subscribers for insert
  with check (true);

create policy "only admins can read subscribers"
  on public.subscribers for select
  using (public.is_admin());

create policy "only admins can update subscribers"
  on public.subscribers for update
  using (public.is_admin()) with check (public.is_admin());

create policy "only admins can delete subscribers"
  on public.subscribers for delete
  using (public.is_admin());

-- ------------------------------------------------------------------- seed --
-- The scholarships already shown on the landing page preview, so the finder
-- is not empty on first load.

insert into public.scholarships (slug, name, funder, country, field, degree_level, deadline, eligibility, apply_url)
values
  ('tony-elumelu-entrepreneurship-programme', 'Tony Elumelu Foundation Entrepreneurship Programme', 'Tony Elumelu Foundation', 'Pan-African', 'Business', 'Any', null, '$5,000 seed capital plus mentorship. Open to all African nationals.', 'https://www.tonyelumelufoundation.org/'),
  ('mastercard-foundation-scholars',          'Mastercard Foundation Scholars Program',              'Mastercard Foundation',   'Pan-African', 'Any',      'Undergraduate', null, 'Academically talented yet economically disadvantaged young Africans.', 'https://mastercardfdn.org/en/what-we-do/our-programs/mastercard-foundation-scholars-program/'),
  ('nnpc-snepco-national-university',         'NNPC/SNEPCo National University Scholarship',          'NNPC / SNEPCo',           'Nigeria',     'Engineering', 'Undergraduate', null, 'Nigerian university students in science, engineering and related courses. Covers tuition and stipend.', 'https://www.shell.com.ng/sustainability/social-investment/scholarships.html')
on conflict (slug) do nothing;
