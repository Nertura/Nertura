-- Outreach CRM: leads + email_log

create type public.lead_status as enum (
  'yeni',
  'taslak_uretildi',
  'iletisim_kuruldu',
  'cevaplandi',
  'disqualified'
);

create type public.email_log_status as enum (
  'taslak',
  'onaylandi',
  'reddedildi',
  'sent'
);

create table public.leads (
  id uuid primary key default extensions.uuid_generate_v4(),
  name text,
  company text not null,
  sector text not null,
  email text not null,
  source text not null default 'manual',
  status public.lead_status not null default 'yeni',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index leads_email_uidx on public.leads (lower(email));
create index leads_status_idx on public.leads (status, created_at desc);
create index leads_sector_idx on public.leads (sector, created_at desc);

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function private.set_updated_at();

create table public.email_log (
  id uuid primary key default extensions.uuid_generate_v4(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  subject text not null,
  body text not null,
  status public.email_log_status not null default 'taslak',
  sent_at timestamptz,
  opened boolean not null default false,
  replied boolean not null default false,
  provider_message_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index email_log_lead_id_idx on public.email_log (lead_id, created_at desc);
create index email_log_status_idx on public.email_log (status, created_at desc);

create trigger email_log_set_updated_at
  before update on public.email_log
  for each row execute function private.set_updated_at();

alter table public.leads enable row level security;
alter table public.leads force row level security;

alter table public.email_log enable row level security;
alter table public.email_log force row level security;

create policy "leads_platform_admin"
  on public.leads for all to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

create policy "email_log_platform_admin"
  on public.email_log for all to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

grant select, insert, update, delete on public.leads to authenticated;
grant select, insert, update, delete on public.email_log to authenticated;
