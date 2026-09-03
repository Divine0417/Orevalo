-- Private notes for a student's saved opportunities.
-- Run in the Supabase SQL editor after 0007.

alter table public.saved_opportunities
  add column if not exists notes text;

alter table public.saved_opportunities
  add constraint saved_opportunities_notes_length
  check (notes is null or char_length(notes) <= 2000);