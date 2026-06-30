-- Nertura local development seed data
-- Password for all test users: NerturaDev2026!
-- Run via: supabase db reset

-- ---------------------------------------------------------------------------
-- Fixed UUIDs for reproducible local development
-- ---------------------------------------------------------------------------

-- Organization
-- a1000000-0000-4000-8000-000000000001

-- Users
-- owner:    b1000000-0000-4000-8000-000000000001  owner@demo.nertura.local
-- operator: b1000000-0000-4000-8000-000000000002  operator@demo.nertura.local
-- viewer:   b1000000-0000-4000-8000-000000000003  viewer@demo.nertura.local
-- admin:    b1000000-0000-4000-8000-000000000099  admin@demo.nertura.local (platform)

-- Farm:  c1000000-0000-4000-8000-000000000001
-- Field: d1000000-0000-4000-8000-000000000001
-- Crop:  e1000000-0000-4000-8000-000000000001

-- ---------------------------------------------------------------------------
-- Auth users
-- ---------------------------------------------------------------------------

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    'b1000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'owner@demo.nertura.local',
    extensions.crypt('NerturaDev2026!', extensions.gen_salt('bf')),
    timezone('utc', now()),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Ayse","last_name":"Yilmaz"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'operator@demo.nertura.local',
    extensions.crypt('NerturaDev2026!', extensions.gen_salt('bf')),
    timezone('utc', now()),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Mehmet","last_name":"Kaya"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'viewer@demo.nertura.local',
    extensions.crypt('NerturaDev2026!', extensions.gen_salt('bf')),
    timezone('utc', now()),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Zeynep","last_name":"Demir"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'b1000000-0000-4000-8000-000000000099',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@demo.nertura.local',
    extensions.crypt('NerturaDev2026!', extensions.gen_salt('bf')),
    timezone('utc', now()),
    '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"platform_admin"}'::jsonb,
    '{"first_name":"Platform","last_name":"Admin"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (id) do nothing;

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    'b1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000001',
    jsonb_build_object('sub', 'b1000000-0000-4000-8000-000000000001', 'email', 'owner@demo.nertura.local'),
    'email',
    'b1000000-0000-4000-8000-000000000001',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000002',
    jsonb_build_object('sub', 'b1000000-0000-4000-8000-000000000002', 'email', 'operator@demo.nertura.local'),
    'email',
    'b1000000-0000-4000-8000-000000000002',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    'b1000000-0000-4000-8000-000000000003',
    jsonb_build_object('sub', 'b1000000-0000-4000-8000-000000000003', 'email', 'viewer@demo.nertura.local'),
    'email',
    'b1000000-0000-4000-8000-000000000003',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'b1000000-0000-4000-8000-000000000099',
    'b1000000-0000-4000-8000-000000000099',
    jsonb_build_object('sub', 'b1000000-0000-4000-8000-000000000099', 'email', 'admin@demo.nertura.local'),
    'email',
    'b1000000-0000-4000-8000-000000000099',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- User profiles (auth trigger may have created rows — upsert details)
-- ---------------------------------------------------------------------------

insert into public.users (id, email, first_name, last_name, language, timezone, status)
values
  ('b1000000-0000-4000-8000-000000000001', 'owner@demo.nertura.local', 'Ayse', 'Yilmaz', 'tr-TR', 'Europe/Istanbul', 'active'),
  ('b1000000-0000-4000-8000-000000000002', 'operator@demo.nertura.local', 'Mehmet', 'Kaya', 'tr-TR', 'Europe/Istanbul', 'active'),
  ('b1000000-0000-4000-8000-000000000003', 'viewer@demo.nertura.local', 'Zeynep', 'Demir', 'tr-TR', 'Europe/Istanbul', 'active'),
  ('b1000000-0000-4000-8000-000000000099', 'admin@demo.nertura.local', 'Platform', 'Admin', 'en-US', 'UTC', 'active')
on conflict (id) do update set
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  language = excluded.language,
  timezone = excluded.timezone,
  status = excluded.status,
  updated_at = timezone('utc', now());

-- ---------------------------------------------------------------------------
-- Organization + memberships
-- ---------------------------------------------------------------------------

insert into public.organizations (
  id,
  name,
  slug,
  type,
  country_code,
  region_code,
  timezone,
  default_currency,
  default_language,
  status,
  settings,
  created_by,
  updated_by
)
values (
  'a1000000-0000-4000-8000-000000000001',
  'Demo Anatolian Farm Co.',
  'demo-anatolian-farm',
  'farm',
  'TR',
  'eu-west',
  'Europe/Istanbul',
  'TRY',
  'tr-TR',
  'active',
  '{"onboarding_completed": true}'::jsonb,
  'b1000000-0000-4000-8000-000000000001',
  'b1000000-0000-4000-8000-000000000001'
)
on conflict (id) do nothing;

insert into public.memberships (id, user_id, organization_id, role, created_by, updated_by)
values
  (
    'f1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    'owner',
    'b1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000001'
  ),
  (
    'f1000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000001',
    'operator',
    'b1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000001'
  ),
  (
    'f1000000-0000-4000-8000-000000000003',
    'b1000000-0000-4000-8000-000000000003',
    'a1000000-0000-4000-8000-000000000001',
    'viewer',
    'b1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000001'
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Farm, field, crop
-- ---------------------------------------------------------------------------

insert into public.farms (
  id,
  organization_id,
  name,
  description,
  address,
  latitude,
  longitude,
  total_area,
  area_unit,
  timezone,
  status,
  metadata,
  created_by,
  updated_by
)
values (
  'c1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000001',
  'Central Anatolian Estate',
  'Primary demo farm for local development.',
  '{"city": "Ankara", "country": "TR"}'::jsonb,
  39.9208000,
  32.8541000,
  245.5000,
  'hectare',
  'Europe/Istanbul',
  'active',
  '{}'::jsonb,
  'b1000000-0000-4000-8000-000000000001',
  'b1000000-0000-4000-8000-000000000001'
)
on conflict (id) do nothing;

insert into public.fields (
  id,
  farm_id,
  organization_id,
  name,
  boundary,
  area,
  soil_type,
  soil_ph,
  status,
  metadata,
  created_by,
  updated_by
)
values (
  'd1000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000001',
  'North Field A',
  extensions.st_setsrid(
    extensions.st_geomfromtext(
      'POLYGON((32.850 39.918, 32.860 39.918, 32.860 39.925, 32.850 39.925, 32.850 39.918))'
    ),
    4326
  ),
  42.7500,
  'loam',
  6.80,
  'active',
  '{}'::jsonb,
  'b1000000-0000-4000-8000-000000000001',
  'b1000000-0000-4000-8000-000000000001'
)
on conflict (id) do nothing;

insert into public.crops (
  id,
  organization_id,
  field_id,
  crop_name,
  variety_name,
  season,
  planting_date,
  expected_harvest_date,
  target_yield,
  yield_unit,
  current_stage,
  status,
  metadata,
  created_by,
  updated_by
)
values (
  'e1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000001',
  'd1000000-0000-4000-8000-000000000001',
  'Winter Wheat',
  'Bezostaya-1',
  '2026-Spring',
  '2026-03-15',
  '2026-07-20',
  3.2000,
  'ton',
  'tillering',
  'active',
  '{}'::jsonb,
  'b1000000-0000-4000-8000-000000000001',
  'b1000000-0000-4000-8000-000000000001'
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Subscription
-- ---------------------------------------------------------------------------

insert into public.subscriptions (
  id,
  organization_id,
  plan,
  status,
  billing_cycle,
  current_period_start,
  current_period_end,
  trial_end,
  metadata,
  created_by,
  updated_by
)
values (
  's1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000001',
  'professional',
  'trialing',
  'monthly',
  timezone('utc', now()),
  timezone('utc', now()) + interval '30 days',
  timezone('utc', now()) + interval '14 days',
  '{"source": "seed"}'::jsonb,
  'b1000000-0000-4000-8000-000000000001',
  'b1000000-0000-4000-8000-000000000001'
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- AI conversation
-- ---------------------------------------------------------------------------

insert into public.ai_conversations (
  id,
  organization_id,
  user_id,
  title,
  metadata,
  created_by,
  updated_by
)
values (
  'i1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000001',
  'b1000000-0000-4000-8000-000000000001',
  'Wheat disease scouting guidance',
  '{"channel": "dashboard", "seed": true}'::jsonb,
  'b1000000-0000-4000-8000-000000000001',
  'b1000000-0000-4000-8000-000000000001'
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Seed audit log entry (system bootstrap)
-- ---------------------------------------------------------------------------

insert into public.audit_logs (
  id,
  organization_id,
  user_id,
  actor_type,
  actor_email,
  category,
  action,
  entity_type,
  entity_id,
  severity,
  changes,
  impersonation
)
values (
  'l1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000001',
  'b1000000-0000-4000-8000-000000000001',
  'system',
  'owner@demo.nertura.local',
  'data_write',
  'seed.completed',
  'organizations',
  'a1000000-0000-4000-8000-000000000001',
  'info',
  '{"message": "Local development seed applied"}'::jsonb,
  false
)
on conflict (id) do nothing;
