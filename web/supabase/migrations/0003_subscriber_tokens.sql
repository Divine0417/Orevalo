-- Tokens for unsubscribe and double opt-in.
--
-- Run in the Supabase SQL editor after 0002. Safe to re-run.
--
-- Why tokens rather than signed URLs: a random uuid per subscriber needs no
-- shared secret, cannot be forged, and is revoked simply by regenerating it.
-- Nothing in the link identifies the person to anyone who intercepts it.

alter table public.subscribers
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid(),
  add column if not exists confirm_token      uuid not null default gen_random_uuid(),
  add column if not exists confirmed_at       timestamptz,
  add column if not exists source_ip          text;

comment on column public.subscribers.confirmed is
  'True once the student clicked the confirmation link. Until then they opted in
   but never proved they own the address — do not bulk mail unconfirmed rows.';

comment on column public.subscribers.source_ip is
  'Coarse abuse signal only. Never displayed; used to rate limit signups.';

create unique index if not exists subscribers_unsubscribe_token_idx
  on public.subscribers (unsubscribe_token);

create unique index if not exists subscribers_confirm_token_idx
  on public.subscribers (confirm_token);

-- Existing rows predate confirmation. Treat them as confirmed rather than
-- silently excluding people who already opted in — but only those that exist
-- right now, so the flag keeps its meaning for everyone who signs up later.
update public.subscribers
   set confirmed = true,
       confirmed_at = coalesce(confirmed_at, created_at)
 where confirmed = false
   and created_at < now();

-- --------------------------------------------------------- token endpoints --
-- Unsubscribing and confirming happen while signed out, so they cannot go
-- through the admin-only policies. These SECURITY DEFINER functions are the
-- only write path anon gets, and each one can only act on the single row whose
-- token was supplied.

create or replace function public.unsubscribe_with_token(token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  hit boolean;
begin
  update public.subscribers
     set unsubscribed = true
   where unsubscribe_token = token
  returning true into hit;

  return coalesce(hit, false);
end;
$$;

create or replace function public.confirm_with_token(token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  hit boolean;
begin
  update public.subscribers
     set confirmed = true,
         confirmed_at = coalesce(confirmed_at, now()),
         unsubscribed = false
   where confirm_token = token
  returning true into hit;

  return coalesce(hit, false);
end;
$$;

grant execute on function public.unsubscribe_with_token(uuid) to anon, authenticated;
grant execute on function public.confirm_with_token(uuid)     to anon, authenticated;
