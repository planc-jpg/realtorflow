-- Baseline domain tables.
-- These existed in the live DB before the multi-tenancy migrations, but were
-- missing from the local migration history. Keep this idempotent so it is a
-- no-op against databases that already have the tables.

create extension if not exists pgcrypto;

create table if not exists public.properties (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid,
  address    text,
  price      integer,
  beds       integer,
  baths      integer,
  sqft       integer,
  status     text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid,
  name       text,
  email      text,
  phone      text,
  type       text,
  status     text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid,
  name       text,
  email      text,
  phone      text,
  property   text,
  status     text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid,
  title      text,
  client     text,
  property   text,
  date       text,
  time       text,
  type       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
