-- Phase 1A · Step 3
-- Attach team_id + created_by to all domain tables.
-- Tables were truncated in step 1, so NOT NULL is safe immediately.

alter table public.properties
  add column if not exists team_id    uuid not null,
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.properties
  alter column team_id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'properties_team_id_fkey'
      and conrelid = 'public.properties'::regclass
  ) then
    alter table public.properties
      add constraint properties_team_id_fkey
      foreign key (team_id) references public.teams(id) on delete cascade;
  end if;
end $$;

alter table public.clients
  add column if not exists team_id    uuid not null,
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.clients
  alter column team_id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clients_team_id_fkey'
      and conrelid = 'public.clients'::regclass
  ) then
    alter table public.clients
      add constraint clients_team_id_fkey
      foreign key (team_id) references public.teams(id) on delete cascade;
  end if;
end $$;

alter table public.leads
  add column if not exists team_id    uuid not null,
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.leads
  alter column team_id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_team_id_fkey'
      and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads
      add constraint leads_team_id_fkey
      foreign key (team_id) references public.teams(id) on delete cascade;
  end if;
end $$;

alter table public.appointments
  add column if not exists team_id    uuid not null,
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.appointments
  alter column team_id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_team_id_fkey'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_team_id_fkey
      foreign key (team_id) references public.teams(id) on delete cascade;
  end if;
end $$;

create index properties_team_idx   on public.properties(team_id);
create index clients_team_idx      on public.clients(team_id);
create index leads_team_idx        on public.leads(team_id);
create index appointments_team_idx on public.appointments(team_id);
