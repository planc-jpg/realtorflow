-- Phase 2A · Step 1
-- Add nullable FK columns while preserving the existing free-text fields.

alter table public.leads
  add column if not exists property_id bigint references public.properties(id) on delete set null;

alter table public.appointments
  add column if not exists property_id bigint references public.properties(id) on delete set null,
  add column if not exists client_id bigint references public.clients(id) on delete set null;
