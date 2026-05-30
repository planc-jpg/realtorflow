-- Phase 1B follow-up
-- create_invite(team_id, email, role): creates a copy-link team invite.

create or replace function public.create_invite(
  team_id uuid,
  email text,
  role public.team_role
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text := gen_random_uuid()::text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if coalesce(public.team_role_for($1)::text, '') not in ('owner', 'admin') then
    raise exception 'not authorized';
  end if;

  insert into public.team_invites (team_id, email, role, token, invited_by, expires_at)
  values ($1, $2, $3, v_token, auth.uid(), now() + interval '7 days');

  return v_token;
end;
$$;

grant execute on function public.create_invite(uuid, text, public.team_role) to authenticated;
