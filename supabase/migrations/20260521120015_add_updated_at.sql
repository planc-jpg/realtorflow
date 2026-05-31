create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.properties
  add column if not exists updated_at timestamptz not null default now();

alter table public.clients
  add column if not exists updated_at timestamptz not null default now();

alter table public.leads
  add column if not exists updated_at timestamptz not null default now();

alter table public.appointments
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists handle_updated_at on public.properties;
create trigger handle_updated_at
  before update on public.properties
  for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_updated_at on public.clients;
create trigger handle_updated_at
  before update on public.clients
  for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_updated_at on public.leads;
create trigger handle_updated_at
  before update on public.leads
  for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_updated_at on public.appointments;
create trigger handle_updated_at
  before update on public.appointments
  for each row execute procedure public.handle_updated_at();
