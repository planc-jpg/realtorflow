-- Phase 1A · Step 2
-- Extensions + multi-tenancy tables: profiles, teams, team_members, team_invites.

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists citext;     -- case-insensitive emails

-- ─────────────────────────────────────────────
-- profiles: app-owned mirror of auth.users
-- ─────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  avatar_url    text,
  last_team_id  uuid,                       -- soft FK; finalized at the bottom of this file
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- teams: tenant boundary
-- ─────────────────────────────────────────────
create table public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  created_by  uuid not null references auth.users(id) on delete restrict default auth.uid(),
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- team_members: many-to-many with roles
-- ─────────────────────────────────────────────
create type public.team_role as enum ('owner', 'admin', 'member');

create table public.team_members (
  team_id    uuid not null references public.teams(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.team_role not null default 'member',
  joined_at  timestamptz not null default now(),
  primary key (team_id, user_id)
);

create index team_members_user_idx on public.team_members(user_id);

-- ─────────────────────────────────────────────
-- team_invites: pending email invitations
-- (Phase 1A: copy-link flow — email delivery comes in Phase 1B)
-- ─────────────────────────────────────────────
create table public.team_invites (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  email       citext not null,
  role        public.team_role not null default 'member',
  token       text unique not null default encode(gen_random_bytes(24), 'base64'),
  invited_by  uuid not null references auth.users(id) on delete set null default auth.uid(),
  expires_at  timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at  timestamptz not null default now()
);

create index team_invites_team_idx  on public.team_invites(team_id);
create index team_invites_email_idx on public.team_invites(email) where accepted_at is null;

-- Finalize the soft FK on profiles.last_team_id now that teams exists.
alter table public.profiles
  add constraint profiles_last_team_fk
  foreign key (last_team_id) references public.teams(id) on delete set null;
