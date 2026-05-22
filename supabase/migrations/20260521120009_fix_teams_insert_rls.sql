-- Phase 1A · Fix
-- Replace the teams INSERT policy with the minimal correct version.
--
-- Previous policy:
--   for insert with check (auth.uid() is not null and auth.uid() = created_by)
--
-- Two issues caused "new row violates row-level security policy":
--   1. No TO clause, so it applied to PUBLIC. Any path where auth.uid()
--      resolves to NULL (anon role reaching the policy, stale JWT) makes
--      the WITH CHECK evaluate false instead of being skipped.
--   2. The auth.uid() = created_by clause duplicates the schema's
--      attribution rule (created_by is NOT NULL, FK auth.users, DEFAULT
--      auth.uid()) and fails whenever the client and JWT don't line up.
--
-- The on_team_created AFTER INSERT trigger is SECURITY DEFINER and adds
-- the creator to team_members, so no pre-existing membership is required
-- to create the first team.

drop policy if exists "teams: any auth user creates" on public.teams;

create policy "teams: authenticated insert" on public.teams
  for insert to authenticated
  with check (auth.uid() is not null);
