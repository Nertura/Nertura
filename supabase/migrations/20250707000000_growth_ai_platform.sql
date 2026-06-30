-- Growth AI platform: extended leads, providers, campaigns, scheduler, compliance

-- ---------------------------------------------------------------------------
-- Extend leads for global discovery + CRM
-- ---------------------------------------------------------------------------

alter table public.leads
  add column if not exists country text,
  add column if not exists language text default 'tr',
  add column if not exists category text,
  add column if not exists website text,
  add column if not exists instagram text,
  add column if not exists facebook text,
  add column if not exists youtube text,
  add column if not exists linkedin text,
  add column if not exists followers integer,
  add column if not exists ai_score numeric(5,2),
  add column if not exists trust_score numeric(5,2),
  add column if not exists need_score numeric(5,2),
  add column if not exists risk_score numeric(5,2),
  add column if not exists last_contact_at timestamptz,
  add column if not exists tags text[] not null default '{}',
  add column if not exists gdpr_consent boolean not null default false,
  add column if not exists opt_in boolean not null default false;

create index if not exists leads_country_idx on public.leads (country, created_at desc);
create index if not exists leads_category_idx on public.leads (category, created_at desc);
create index if not exists leads_ai_score_idx on public.leads (ai_score desc nulls last);

-- ---------------------------------------------------------------------------
-- Extend email_log for delivery tracking + analytics
-- ---------------------------------------------------------------------------

alter table public.email_log
  add column if not exists delivery_status text default 'queued',
  add column if not exists language text default 'tr',
  add column if not exists spam_score numeric(5,2),
  add column if not exists clicked boolean not null default false,
  add column if not exists bounced boolean not null default false,
  add column if not exists scheduled_at timestamptz,
  add column if not exists provider_id uuid;

create index if not exists email_log_delivery_status_idx on public.email_log (delivery_status, created_at desc);
create index if not exists email_log_sent_at_idx on public.email_log (sent_at desc nulls last);

-- ---------------------------------------------------------------------------
-- Email providers
-- ---------------------------------------------------------------------------

create type public.growth_provider_type as enum (
  'resend',
  'sendgrid',
  'mailgun',
  'postmark',
  'amazon_ses',
  'brevo'
);

create type public.growth_provider_status as enum (
  'connected',
  'disconnected',
  'error',
  'disabled'
);

create table public.growth_email_providers (
  id uuid primary key default extensions.uuid_generate_v4(),
  provider_type public.growth_provider_type not null,
  display_name text not null,
  status public.growth_provider_status not null default 'disconnected',
  domain text,
  domain_verified boolean not null default false,
  priority integer not null default 100,
  failover_enabled boolean not null default true,
  rate_limit_per_day integer not null default 1000,
  daily_usage integer not null default 0,
  last_test_at timestamptz,
  last_error text,
  health_score numeric(5,2) default 100,
  api_key_hint text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index growth_email_providers_type_uidx on public.growth_email_providers (provider_type);

create trigger growth_email_providers_set_updated_at
  before update on public.growth_email_providers
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Campaigns
-- ---------------------------------------------------------------------------

create type public.growth_campaign_status as enum (
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'scheduled',
  'running',
  'completed',
  'archived'
);

create table public.growth_campaigns (
  id uuid primary key default extensions.uuid_generate_v4(),
  name text not null,
  status public.growth_campaign_status not null default 'draft',
  target_country text,
  target_language text default 'tr',
  target_industry text,
  target_crop text,
  target_problem text,
  estimated_reach integer,
  expected_open_rate numeric(5,2),
  expected_ctr numeric(5,2),
  ai_confidence numeric(5,2),
  subject_template text,
  body_template text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.users (id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index growth_campaigns_status_idx on public.growth_campaigns (status, created_at desc);

create trigger growth_campaigns_set_updated_at
  before update on public.growth_campaigns
  for each row execute function private.set_updated_at();

create table public.growth_campaign_leads (
  campaign_id uuid not null references public.growth_campaigns (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (campaign_id, lead_id)
);

-- ---------------------------------------------------------------------------
-- CRM notes + interactions
-- ---------------------------------------------------------------------------

create table public.growth_lead_notes (
  id uuid primary key default extensions.uuid_generate_v4(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  body text not null,
  created_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index growth_lead_notes_lead_idx on public.growth_lead_notes (lead_id, created_at desc);

create type public.growth_interaction_type as enum (
  'email_sent',
  'email_opened',
  'email_clicked',
  'email_replied',
  'note',
  'call',
  'meeting',
  'campaign',
  'ai_recommendation'
);

create table public.growth_lead_interactions (
  id uuid primary key default extensions.uuid_generate_v4(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  interaction_type public.growth_interaction_type not null,
  title text not null,
  body text,
  email_log_id uuid references public.email_log (id) on delete set null,
  campaign_id uuid references public.growth_campaigns (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index growth_lead_interactions_lead_idx on public.growth_lead_interactions (lead_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Scheduler
-- ---------------------------------------------------------------------------

create type public.growth_schedule_type as enum (
  'email',
  'social_post',
  'content',
  'ai_task',
  'cron'
);

create type public.growth_schedule_status as enum (
  'pending',
  'scheduled',
  'processing',
  'completed',
  'failed',
  'cancelled'
);

create table public.growth_scheduled_items (
  id uuid primary key default extensions.uuid_generate_v4(),
  schedule_type public.growth_schedule_type not null,
  status public.growth_schedule_status not null default 'pending',
  title text not null,
  scheduled_at timestamptz not null,
  completed_at timestamptz,
  retry_count integer not null default 0,
  max_retries integer not null default 3,
  reference_id uuid,
  reference_table text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index growth_scheduled_items_at_idx on public.growth_scheduled_items (scheduled_at, status);

create trigger growth_scheduled_items_set_updated_at
  before update on public.growth_scheduled_items
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Compliance + settings
-- ---------------------------------------------------------------------------

create table public.growth_compliance_settings (
  id uuid primary key default extensions.uuid_generate_v4(),
  gdpr_enabled boolean not null default true,
  kvkk_enabled boolean not null default true,
  can_spam_enabled boolean not null default true,
  double_opt_in boolean not null default false,
  unsubscribe_footer_enabled boolean not null default true,
  dmarc_status text default 'unknown',
  spf_status text default 'unknown',
  dkim_status text default 'unknown',
  domain_reputation_score numeric(5,2) default 100,
  global_spam_score numeric(5,2) default 0,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.growth_suppression_list (
  id uuid primary key default extensions.uuid_generate_v4(),
  email text not null,
  reason text not null,
  source text not null default 'manual',
  created_at timestamptz not null default timezone('utc', now())
);

create unique index growth_suppression_email_uidx on public.growth_suppression_list (lower(email));

create table public.growth_audit_log (
  id uuid primary key default extensions.uuid_generate_v4(),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  actor_id uuid references public.users (id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index growth_audit_log_created_idx on public.growth_audit_log (created_at desc);

create table public.growth_settings (
  id uuid primary key default extensions.uuid_generate_v4(),
  org_language text not null default 'tr',
  daily_email_limit integer not null default 500,
  hourly_email_limit integer not null default 50,
  per_domain_limit integer not null default 100,
  per_provider_limit integer not null default 1000,
  automation_enabled boolean not null default true,
  founder_approval_required boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

-- Seed singleton rows
insert into public.growth_compliance_settings (id) values (extensions.uuid_generate_v4());
insert into public.growth_settings (id) values (extensions.uuid_generate_v4());

insert into public.growth_email_providers (provider_type, display_name, status, priority, domain_verified, health_score, api_key_hint)
values
  ('resend', 'Resend', 'disconnected', 1, false, 100, null),
  ('sendgrid', 'SendGrid', 'disconnected', 2, false, 100, null),
  ('mailgun', 'Mailgun', 'disconnected', 3, false, 100, null),
  ('postmark', 'Postmark', 'disconnected', 4, false, 100, null),
  ('amazon_ses', 'Amazon SES', 'disconnected', 5, false, 100, null),
  ('brevo', 'Brevo', 'disconnected', 6, false, 100, null)
on conflict (provider_type) do nothing;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.growth_email_providers enable row level security;
alter table public.growth_email_providers force row level security;
alter table public.growth_campaigns enable row level security;
alter table public.growth_campaigns force row level security;
alter table public.growth_campaign_leads enable row level security;
alter table public.growth_campaign_leads force row level security;
alter table public.growth_lead_notes enable row level security;
alter table public.growth_lead_notes force row level security;
alter table public.growth_lead_interactions enable row level security;
alter table public.growth_lead_interactions force row level security;
alter table public.growth_scheduled_items enable row level security;
alter table public.growth_scheduled_items force row level security;
alter table public.growth_compliance_settings enable row level security;
alter table public.growth_compliance_settings force row level security;
alter table public.growth_suppression_list enable row level security;
alter table public.growth_suppression_list force row level security;
alter table public.growth_audit_log enable row level security;
alter table public.growth_audit_log force row level security;
alter table public.growth_settings enable row level security;
alter table public.growth_settings force row level security;

create policy "growth_email_providers_admin" on public.growth_email_providers for all to authenticated using (private.is_platform_admin()) with check (private.is_platform_admin());
create policy "growth_campaigns_admin" on public.growth_campaigns for all to authenticated using (private.is_platform_admin()) with check (private.is_platform_admin());
create policy "growth_campaign_leads_admin" on public.growth_campaign_leads for all to authenticated using (private.is_platform_admin()) with check (private.is_platform_admin());
create policy "growth_lead_notes_admin" on public.growth_lead_notes for all to authenticated using (private.is_platform_admin()) with check (private.is_platform_admin());
create policy "growth_lead_interactions_admin" on public.growth_lead_interactions for all to authenticated using (private.is_platform_admin()) with check (private.is_platform_admin());
create policy "growth_scheduled_items_admin" on public.growth_scheduled_items for all to authenticated using (private.is_platform_admin()) with check (private.is_platform_admin());
create policy "growth_compliance_settings_admin" on public.growth_compliance_settings for all to authenticated using (private.is_platform_admin()) with check (private.is_platform_admin());
create policy "growth_suppression_list_admin" on public.growth_suppression_list for all to authenticated using (private.is_platform_admin()) with check (private.is_platform_admin());
create policy "growth_audit_log_admin" on public.growth_audit_log for all to authenticated using (private.is_platform_admin()) with check (private.is_platform_admin());
create policy "growth_settings_admin" on public.growth_settings for all to authenticated using (private.is_platform_admin()) with check (private.is_platform_admin());

grant select, insert, update, delete on public.growth_email_providers to authenticated;
grant select, insert, update, delete on public.growth_campaigns to authenticated;
grant select, insert, update, delete on public.growth_campaign_leads to authenticated;
grant select, insert, update, delete on public.growth_lead_notes to authenticated;
grant select, insert, update, delete on public.growth_lead_interactions to authenticated;
grant select, insert, update, delete on public.growth_scheduled_items to authenticated;
grant select, insert, update, delete on public.growth_compliance_settings to authenticated;
grant select, insert, update, delete on public.growth_suppression_list to authenticated;
grant select, insert, update, delete on public.growth_audit_log to authenticated;
grant select, insert, update, delete on public.growth_settings to authenticated;
