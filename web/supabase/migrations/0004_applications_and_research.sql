-- Student Leader applications and research responses.
--
-- Run in the Supabase SQL editor after 0003. Safe to re-run.
--
-- Both forms posted only to Formspree, so the answers lived in an inbox nobody
-- could query and the roadmap's Phase 0 engagement criteria could not be
-- measured. These tables make every submission visible in the dashboard.
--
-- Shape note: leader applications have a fixed set of questions, so they get
-- real columns. The research survey has 20+ questions that will keep changing,
-- so the stable identifying fields are promoted and the rest lives in jsonb —
-- adding a question then needs no migration.

-- -------------------------------------------------- leader applications --

create table if not exists public.leader_applications (
  id          uuid primary key default gen_random_uuid(),
  full_name   text        not null,
  email       citext      not null,
  country     text        not null,
  university  text        not null,
  course      text        not null,
  year        text        not null,
  connection  text        not null,
  challenge   text        not null,
  why         text        not null,
  referral    text,
  status      text        not null default 'new',
  notes       text,
  created_at  timestamptz not null default now(),

  constraint leader_applications_status_valid
    check (status in ('new', 'reviewing', 'accepted', 'rejected'))
);

comment on column public.leader_applications.status is
  'Review pipeline. The roadmap promises a reply within 7 days, so "new" is a queue.';

create index if not exists leader_applications_status_idx
  on public.leader_applications (status, created_at desc);

-- ------------------------------------------------------ research responses --

create table if not exists public.research_responses (
  id             uuid primary key default gen_random_uuid(),
  first_name     text        not null,
  email          citext      not null,
  country        text        not null,
  status         text,
  field_of_study text,
  -- Everything else, keyed by the form field name.
  answers        jsonb       not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);

comment on column public.research_responses.answers is
  'Full submission keyed by form field name. Promoted columns above are duplicated
   here on purpose so a response is readable without joining anything.';

create index if not exists research_responses_created_idx
  on public.research_responses (created_at desc);

create index if not exists research_responses_answers_idx
  on public.research_responses using gin (answers);

-- --------------------------------------------------------------------- RLS --
-- Same shape as subscribers: anyone may submit, only admins may read. Without
-- the read restriction the public anon key would expose applicants' names,
-- emails and universities.

alter table public.leader_applications enable row level security;
alter table public.research_responses  enable row level security;

create policy "anyone can apply"
  on public.leader_applications for insert with check (true);

create policy "only admins can read applications"
  on public.leader_applications for select using (public.is_admin());

create policy "only admins can update applications"
  on public.leader_applications for update
  using (public.is_admin()) with check (public.is_admin());

create policy "only admins can delete applications"
  on public.leader_applications for delete using (public.is_admin());

create policy "anyone can submit research"
  on public.research_responses for insert with check (true);

create policy "only admins can read research"
  on public.research_responses for select using (public.is_admin());

create policy "only admins can delete research"
  on public.research_responses for delete using (public.is_admin());
