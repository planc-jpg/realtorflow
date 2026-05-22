-- Phase 1B follow-up
-- Table-level grants for the domain tables.
-- RLS is the row-level gate; this layer is the ACL check Postgres runs first.
-- Without these, authenticated users get "permission denied for table <name>"
-- before RLS policies are ever consulted.

grant select, insert, update, delete on table public.properties   to authenticated;
grant select, insert, update, delete on table public.clients      to authenticated;
grant select, insert, update, delete on table public.leads        to authenticated;
grant select, insert, update, delete on table public.appointments to authenticated;
