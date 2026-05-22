-- Phase 1A · Fix
-- Add a SELECT policy so the creator can read a freshly-inserted team
-- inside the same statement as the INSERT.
--
-- Why the previous fix (20260521120009) was not enough:
--   supabase-js sends `.insert().select().single()` which becomes
--   `INSERT ... RETURNING *`. Postgres enforces the SELECT policy on
--   the returned row. The existing "teams: members read" policy uses
--   public.is_team_member(id) -> reads public.team_members. The
--   on_team_created AFTER trigger does insert that membership row,
--   but is_team_member is STABLE SECURITY DEFINER, so it evaluates
--   against the outer INSERT's snapshot (taken before the trigger
--   fired) and does not see the new membership. The SELECT-on-
--   RETURNING fails, and Postgres reports it with the same wording
--   as a WITH CHECK violation: "new row violates row-level security
--   policy for table teams".
--
-- Minimal corrective policy: a second PERMISSIVE SELECT policy that
-- lets a user read teams they created. PERMISSIVE policies OR
-- together, so this does not weaken the team-scoped read for
-- non-creators, and it is satisfied by the row being returned (the
-- new row's created_by = auth.uid() by construction).

create policy "teams: creator read" on public.teams
  for select to authenticated
  using (created_by = auth.uid());
