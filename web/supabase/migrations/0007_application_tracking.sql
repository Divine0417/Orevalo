-- Application tracking for saved opportunities.
-- Run in the Supabase SQL editor after 0006.

alter table public.saved_opportunities
  add column if not exists status text not null default 'interested'
  constraint saved_opportunities_status_valid
    check (status in ('interested', 'preparing', 'applied', 'interviewing', 'accepted', 'rejected'));

create policy "students update their own saved opportunity status"
  on public.saved_opportunities for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
