-- Phase 1A · Step 7
-- accept_invite(token): the only path by which a non-member joins a team.
-- SECURITY DEFINER so it can read team_invites and insert into team_members
-- on behalf of the recipient, with the validation rules below.

create or replace function public.accept_invite(_token text)
returns uuid                       -- returns the team_id joined
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.team_invites%rowtype;
  v_email  text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select email into v_email from auth.users where id = auth.uid();

  select * into v_invite
  from public.team_invites
  where token = _token
  for update;

  if not found                                  then raise exception 'invite not found'; end if;
  if v_invite.accepted_at is not null           then raise exception 'invite already used'; end if;
  if v_invite.expires_at < now()                then raise exception 'invite expired'; end if;
  if lower(v_invite.email) <> lower(v_email)    then raise exception 'invite email mismatch'; end if;

  insert into public.team_members (team_id, user_id, role)
  values (v_invite.team_id, auth.uid(), v_invite.role)
  on conflict (team_id, user_id) do nothing;

  update public.team_invites
    set accepted_at = now()
    where id = v_invite.id;

  return v_invite.team_id;
end;
$$;

grant execute on function public.accept_invite(text) to authenticated;
