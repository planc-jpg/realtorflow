-- Phase 1A · Step 4
-- SECURITY DEFINER helpers used inside RLS policies.
-- Definer context avoids recursive RLS evaluation on team_members.

create or replace function public.is_team_member(_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.team_members
    where team_id = _team_id and user_id = auth.uid()
  );
$$;

create or replace function public.team_role_for(_team_id uuid)
returns public.team_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.team_members
  where team_id = _team_id and user_id = auth.uid();
$$;

grant execute on function public.is_team_member(uuid) to authenticated;
grant execute on function public.team_role_for(uuid) to authenticated;
