-- Phase 1A · Step 8
-- Table-level grants for the multi-tenant tables.
-- RLS is the row-level gate; this layer is the ACL check Postgres runs first.
-- Without these, authenticated users get "permission denied for table teams"
-- before RLS policies are ever consulted.

grant usage on schema public to authenticated;

grant select, insert, update, delete on table public.profiles      to authenticated;
grant select, insert, update, delete on table public.teams         to authenticated;
grant select, insert, update, delete on table public.team_members  to authenticated;
grant select, insert, update, delete on table public.team_invites  to authenticated;
