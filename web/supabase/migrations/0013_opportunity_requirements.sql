-- Structured eligibility details for public opportunity pages.
-- Existing scholarship degree, field, country and eligibility columns remain
-- authoritative; this JSONB list preserves source-specific requirement facts.

alter table public.listings
  add column if not exists requirements jsonb not null default '[]'::jsonb;

alter table public.scholarships
  add column if not exists requirements jsonb not null default '[]'::jsonb;

comment on column public.listings.requirements is
  'Source-backed eligibility requirements as [{label, detail}] objects.';
comment on column public.scholarships.requirements is
  'Source-backed eligibility requirements as [{label, detail}] objects.';