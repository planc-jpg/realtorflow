-- Phase 1A · Step 3
-- Attach team_id + created_by to all domain tables.
-- Tables were truncated in step 1, so NOT NULL is safe immediately.

alter table public.properties
  add column team_id    uuid not null references public.teams(id) on delete cascade,
  add column created_by uuid references auth.users(id) on delete set null;

alter table public.clients
  add column team_id    uuid not null references public.teams(id) on delete cascade,
  add column created_by uuid references auth.users(id) on delete set null;

alter table public.leads
  add column team_id    uuid not null references public.teams(id) on delete cascade,
  add column created_by uuid references auth.users(id) on delete set null;

alter table public.appointments
  add column team_id    uuid not null references public.teams(id) on delete cascade,
  add column created_by uuid references auth.users(id) on delete set null;

create index properties_team_idx   on public.properties(team_id);
create index clients_team_idx      on public.clients(team_id);
create index leads_team_idx        on public.leads(team_id);
create index appointments_team_idx on public.appointments(team_id);
