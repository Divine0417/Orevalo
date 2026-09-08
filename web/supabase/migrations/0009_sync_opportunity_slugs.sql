-- Keep saved opportunities and alert delivery records valid when an admin
-- renames an internship or scholarship.

create or replace function public.sync_listing_slug()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.slug is distinct from new.slug then
    update public.saved_opportunities
      set slug = new.slug
      where kind = 'listing' and slug = old.slug;
    update public.alert_deliveries
      set slug = new.slug
      where kind = 'listing' and slug = old.slug;
  end if;
  return new;
end;
$$;

drop trigger if exists listings_sync_slug on public.listings;
create trigger listings_sync_slug
  after update of slug on public.listings
  for each row execute function public.sync_listing_slug();

create or replace function public.sync_scholarship_slug()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.slug is distinct from new.slug then
    update public.saved_opportunities
      set slug = new.slug
      where kind = 'scholarship' and slug = old.slug;
    update public.alert_deliveries
      set slug = new.slug
      where kind = 'scholarship' and slug = old.slug;
  end if;
  return new;
end;
$$;

drop trigger if exists scholarships_sync_slug on public.scholarships;
create trigger scholarships_sync_slug
  after update of slug on public.scholarships
  for each row execute function public.sync_scholarship_slug();