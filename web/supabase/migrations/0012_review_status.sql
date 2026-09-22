-- Review lifecycle for listings and scholarships.
-- This keeps legacy published/hidden rows working while making review state explicit.

alter table public.listings
  add column if not exists status text,
  add column if not exists rejection_reason text;

alter table public.scholarships
  add column if not exists status text,
  add column if not exists rejection_reason text;

update public.listings
set status = case
  when published then 'published'
  else 'pending'
end,
    rejection_reason = null
where status is null;

update public.scholarships
set status = case
  when published then 'published'
  else 'pending'
end,
    rejection_reason = null
where status is null;

alter table public.listings
  alter column status set default 'pending';

alter table public.scholarships
  alter column status set default 'pending';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'listings_status_check'
      AND conrelid = 'public.listings'::regclass
  ) THEN
    ALTER TABLE public.listings
      ADD CONSTRAINT listings_status_check
      CHECK (status IN ('pending', 'published', 'rejected', 'archived'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'scholarships_status_check'
      AND conrelid = 'public.scholarships'::regclass
  ) THEN
    ALTER TABLE public.scholarships
      ADD CONSTRAINT scholarships_status_check
      CHECK (status IN ('pending', 'published', 'rejected', 'archived'));
  END IF;
END $$;

create index if not exists listings_review_idx
  on public.listings (published, status, deadline desc);

create index if not exists scholarships_review_idx
  on public.scholarships (published, status, deadline desc);

create or replace function public.sync_review_status()
returns trigger
language plpgsql
as $$
begin
  if new.status is null then
    new.status = case when new.published then 'published' else 'pending' end;
  end if;

  if new.published and new.status = 'rejected' then
    new.status = 'published';
  end if;

  if not new.published and new.status = 'published' then
    new.status = 'pending';
  end if;

  if new.status = 'rejected' and new.rejection_reason is null then
    new.rejection_reason = 'Not reviewed';
  end if;

  return new;
end;
$$;

drop trigger if exists listings_review_sync on public.listings;
create trigger listings_review_sync
  before insert or update on public.listings
  for each row execute function public.sync_review_status();

drop trigger if exists scholarships_review_sync on public.scholarships;
create trigger scholarships_review_sync
  before insert or update on public.scholarships
  for each row execute function public.sync_review_status();
