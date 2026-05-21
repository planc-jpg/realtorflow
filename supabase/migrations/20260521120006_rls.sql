-- Phase 1A · Step 6
-- Row-level security: every table is locked by default; policies grant access.

alter table public.profiles      enable row level security;
alter table public.teams         enable row level security;
alter table public.team_members  enable row level security;
alter table public.team_invites  enable row level security;
alter table public.properties    enable row level security;
alter table public.clients       enable row level security;
alter table public.leads         enable row level security;
alter table public.appointments  enable row level security;

-- ── profiles ─────────────────────────────────────────────────────────────
create policy "profiles: self read" on public.profiles
  for select using (id = auth.uid());

create policy "profiles: teammates read" on public.profiles
  for select using (
    exists (
      select 1
      from public.team_members me
      join public.team_members them on them.team_id = me.team_id
      where me.user_id = auth.uid() and them.user_id = profiles.id
    )
  );

create policy "profiles: self update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ── teams ────────────────────────────────────────────────────────────────
create policy "teams: members read" on public.teams
  for select using (public.is_team_member(id));

create policy "teams: any auth user creates" on public.teams
  for insert with check (auth.uid() is not null and auth.uid() = created_by);

create policy "teams: owner/admin update" on public.teams
  for update using (public.team_role_for(id) in ('owner','admin'))
         with check (public.team_role_for(id) in ('owner','admin'));

create policy "teams: owner delete" on public.teams
  for delete using (public.team_role_for(id) = 'owner');

-- ── team_members ─────────────────────────────────────────────────────────
create policy "members: team read" on public.team_members
  for select using (public.is_team_member(team_id));

create policy "members: owner/admin write" on public.team_members
  for all using (public.team_role_for(team_id) in ('owner','admin'))
         with check (public.team_role_for(team_id) in ('owner','admin'));

-- ── team_invites ─────────────────────────────────────────────────────────
-- Direct table access is restricted to team admins. Acceptance happens via
-- the accept_invite() RPC (SECURITY DEFINER), so the recipient never needs
-- to read this table directly.
create policy "invites: team read" on public.team_invites
  for select using (public.is_team_member(team_id));

create policy "invites: owner/admin write" on public.team_invites
  for all using (public.team_role_for(team_id) in ('owner','admin'))
         with check (public.team_role_for(team_id) in ('owner','admin'));

-- ── domain tables: uniform team-scoped CRUD ──────────────────────────────
create policy "properties: team rw" on public.properties
  for all using (public.is_team_member(team_id))
         with check (public.is_team_member(team_id));

create policy "clients: team rw" on public.clients
  for all using (public.is_team_member(team_id))
         with check (public.is_team_member(team_id));

create policy "leads: team rw" on public.leads
  for all using (public.is_team_member(team_id))
         with check (public.is_team_member(team_id));

create policy "appointments: team rw" on public.appointments
  for all using (public.is_team_member(team_id))
         with check (public.is_team_member(team_id));
