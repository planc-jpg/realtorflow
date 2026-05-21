-- Phase 1A · Step 1
-- Wipe existing demo rows so we can attach NOT NULL team_id cleanly in step 3.
-- Decision: option (A) — existing rows are mock data, not worth preserving.

truncate table public.properties   restart identity cascade;
truncate table public.clients      restart identity cascade;
truncate table public.leads        restart identity cascade;
truncate table public.appointments restart identity cascade;
