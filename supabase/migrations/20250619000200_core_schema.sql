-- Nertura Phase 2: core production schema
-- Tables: organizations, users, memberships, farms, fields, crops,
--         subscriptions, ai_conversations, audit_logs

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default extensions.uuid_generate_v4(),
  name varchar(255) not null,
  slug varchar(100) not null,
  type public.organization_type not null default 'farm',
  country_code char(2) not null default 'TR',
  region_code varchar(20) not null default 'eu-west',
  timezone varchar(50) not null default 'Europe/Istanbul',
  default_currency char(3) not null default 'TRY',
  default_language char(5) not null default 'en-US',
  logo_url text,
  settings jsonb not null default '{}'::jsonb,
  status public.organization_status not null default 'trial',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  constraint organizations_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index organizations_slug_active_uidx
  on public.organizations (slug)
  where deleted_at is null;

-- ---------------------------------------------------------------------------
-- users (profile extension of auth.users)
-- ---------------------------------------------------------------------------

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email varchar(255) not null,
  first_name varchar(100),
  last_name varchar(100),
  phone varchar(20),
  avatar_url text,
  language char(5) not null default 'en-US',
  timezone varchar(50),
  status public.user_status not null default 'active',
  last_login_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  created_by uuid references public.users (id),
  updated_by uuid references public.users (id)
);

create unique index users_email_active_uidx
  on public.users (email)
  where deleted_at is null;

-- ---------------------------------------------------------------------------
-- memberships (tenant access + RBAC)
-- ---------------------------------------------------------------------------

create table public.memberships (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references public.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role public.membership_role not null default 'member',
  farm_id uuid,
  assigned_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  created_by uuid references public.users (id),
  updated_by uuid references public.users (id)
);

create unique index memberships_user_org_active_uidx
  on public.memberships (user_id, organization_id)
  where deleted_at is null;

-- ---------------------------------------------------------------------------
-- farms
-- ---------------------------------------------------------------------------

create table public.farms (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  name varchar(255) not null,
  description text,
  address jsonb not null default '{}'::jsonb,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  total_area numeric(12, 4),
  area_unit public.area_unit not null default 'hectare',
  timezone varchar(50),
  status public.farm_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  created_by uuid references public.users (id),
  updated_by uuid references public.users (id)
);

-- ---------------------------------------------------------------------------
-- fields
-- ---------------------------------------------------------------------------

create table public.fields (
  id uuid primary key default extensions.uuid_generate_v4(),
  farm_id uuid not null references public.farms (id) on delete restrict,
  organization_id uuid not null references public.organizations (id) on delete restrict,
  name varchar(255) not null,
  boundary extensions.geometry (polygon, 4326),
  area numeric(12, 4),
  soil_type varchar(100),
  soil_ph numeric(4, 2),
  elevation numeric(8, 2),
  slope numeric(5, 2),
  status public.field_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  created_by uuid references public.users (id),
  updated_by uuid references public.users (id)
);

-- farm-scoped membership FK (added after farms exist)
alter table public.memberships
  add constraint memberships_farm_id_fkey
  foreign key (farm_id) references public.farms (id) on delete set null;

-- ---------------------------------------------------------------------------
-- crops
-- ---------------------------------------------------------------------------

create table public.crops (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  field_id uuid not null references public.fields (id) on delete restrict,
  crop_name varchar(255) not null,
  variety_name varchar(255),
  season varchar(20) not null,
  planting_date date,
  expected_harvest_date date,
  actual_harvest_date date,
  target_yield numeric(12, 4),
  yield_unit varchar(20) default 'ton',
  current_stage varchar(50),
  status public.crop_status not null default 'planned',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  created_by uuid references public.users (id),
  updated_by uuid references public.users (id)
);

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------

create table public.subscriptions (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  plan public.subscription_plan not null default 'starter',
  status public.subscription_status not null default 'trialing',
  billing_cycle public.billing_cycle not null default 'monthly',
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_end timestamptz,
  cancelled_at timestamptz,
  external_subscription_id varchar(255),
  stripe_customer_id varchar(255),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  created_by uuid references public.users (id),
  updated_by uuid references public.users (id)
);

create unique index subscriptions_org_active_uidx
  on public.subscriptions (organization_id)
  where deleted_at is null and status in ('trialing', 'active', 'past_due', 'paused');

-- ---------------------------------------------------------------------------
-- ai_conversations
-- ---------------------------------------------------------------------------

create table public.ai_conversations (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  user_id uuid not null references public.users (id) on delete cascade,
  title varchar(255),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  created_by uuid references public.users (id),
  updated_by uuid references public.users (id)
);

-- ---------------------------------------------------------------------------
-- audit_logs (append-only)
-- ---------------------------------------------------------------------------

create table public.audit_logs (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid references public.organizations (id) on delete set null,
  user_id uuid references public.users (id) on delete set null,
  actor_type public.audit_actor_type not null default 'system',
  actor_email varchar(255),
  category public.audit_category not null,
  action varchar(100) not null,
  entity_type varchar(50) not null,
  entity_id uuid,
  severity public.audit_severity not null default 'info',
  changes jsonb,
  ip_address inet,
  user_agent text,
  request_id varchar(100),
  impersonation boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- Deferred FK: organizations.created_by / updated_by -> users
-- ---------------------------------------------------------------------------

alter table public.organizations
  add constraint organizations_created_by_fkey
  foreign key (created_by) references public.users (id) on delete set null,
  add constraint organizations_updated_by_fkey
  foreign key (updated_by) references public.users (id) on delete set null;
