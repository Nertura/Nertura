-- Knowledge Ingestion Sprint — review-first pipeline (never auto-publish)

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.knowledge_source_type as enum (
  'official_api',
  'open_dataset',
  'website',
  'manual',
  'research',
  'internal'
);

create type public.knowledge_trust_level as enum (
  'high',
  'medium',
  'low'
);

create type public.ingestion_item_status as enum (
  'collected',
  'normalized',
  'summarized',
  'summary_pending',
  'review_pending',
  'approved',
  'rejected'
);

create type public.ingestion_review_status as enum (
  'pending',
  'approved',
  'rejected',
  'needs_expert'
);

create type public.ingestion_job_status as enum (
  'pending',
  'running',
  'completed',
  'failed'
);

create type public.source_run_status as enum (
  'pending',
  'running',
  'completed',
  'failed',
  'skipped'
);

-- ---------------------------------------------------------------------------
-- knowledge_sources
-- ---------------------------------------------------------------------------

create table public.knowledge_sources (
  id uuid primary key default extensions.uuid_generate_v4(),
  name text not null,
  type public.knowledge_source_type not null,
  base_url text,
  license_notes text,
  trust_level public.knowledge_trust_level not null default 'medium',
  enabled boolean not null default false,
  schedule text default 'daily',
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index knowledge_sources_name_uidx on public.knowledge_sources (name);

create trigger knowledge_sources_set_updated_at
  before update on public.knowledge_sources
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- knowledge_ingestion_jobs (cron / manual batch)
-- ---------------------------------------------------------------------------

create table public.knowledge_ingestion_jobs (
  id uuid primary key default extensions.uuid_generate_v4(),
  trigger_type text not null default 'cron' check (trigger_type in ('cron', 'manual')),
  status public.ingestion_job_status not null default 'pending',
  items_collected integer not null default 0,
  items_duplicated integer not null default 0,
  items_queued integer not null default 0,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index knowledge_ingestion_jobs_created_idx
  on public.knowledge_ingestion_jobs (created_at desc);

-- ---------------------------------------------------------------------------
-- knowledge_source_runs (per-source execution within a job)
-- ---------------------------------------------------------------------------

create table public.knowledge_source_runs (
  id uuid primary key default extensions.uuid_generate_v4(),
  job_id uuid not null references public.knowledge_ingestion_jobs (id) on delete cascade,
  source_id uuid not null references public.knowledge_sources (id) on delete restrict,
  status public.source_run_status not null default 'pending',
  items_collected integer not null default 0,
  items_duplicated integer not null default 0,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index knowledge_source_runs_job_idx on public.knowledge_source_runs (job_id);
create index knowledge_source_runs_source_idx on public.knowledge_source_runs (source_id);

-- ---------------------------------------------------------------------------
-- knowledge_ingestion_items
-- ---------------------------------------------------------------------------

create table public.knowledge_ingestion_items (
  id uuid primary key default extensions.uuid_generate_v4(),
  source_id uuid not null references public.knowledge_sources (id) on delete restrict,
  run_id uuid references public.knowledge_source_runs (id) on delete set null,
  title text not null,
  raw_text text not null,
  normalized_text text,
  language char(5) default 'en',
  crop text,
  disease text,
  pest text,
  symptom text,
  region text,
  source_url text,
  citation text,
  status public.ingestion_item_status not null default 'collected',
  duplicate_hash text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index knowledge_ingestion_items_duplicate_hash_uidx
  on public.knowledge_ingestion_items (duplicate_hash);

create index knowledge_ingestion_items_status_idx
  on public.knowledge_ingestion_items (status);

create index knowledge_ingestion_items_source_idx
  on public.knowledge_ingestion_items (source_id);

create trigger knowledge_ingestion_items_set_updated_at
  before update on public.knowledge_ingestion_items
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- knowledge_review_queue
-- ---------------------------------------------------------------------------

create table public.knowledge_review_queue (
  id uuid primary key default extensions.uuid_generate_v4(),
  item_id uuid not null references public.knowledge_ingestion_items (id) on delete cascade,
  ai_summary text,
  proposed_knowledge_item jsonb,
  risk_level text check (risk_level in ('low', 'medium', 'high', 'critical')),
  reviewer_notes text,
  status public.ingestion_review_status not null default 'pending',
  reviewed_by uuid references public.users (id) on delete set null,
  knowledge_item_id uuid references public.knowledge_items (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz
);

create unique index knowledge_review_queue_item_uidx
  on public.knowledge_review_queue (item_id);

create index knowledge_review_queue_status_idx
  on public.knowledge_review_queue (status);

-- ---------------------------------------------------------------------------
-- knowledge_citations
-- ---------------------------------------------------------------------------

create table public.knowledge_citations (
  id uuid primary key default extensions.uuid_generate_v4(),
  ingestion_item_id uuid references public.knowledge_ingestion_items (id) on delete cascade,
  knowledge_item_id uuid references public.knowledge_items (id) on delete set null,
  citation_text text not null,
  source_url text,
  license text,
  accessed_at timestamptz not null default timezone('utc', now()),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index knowledge_citations_ingestion_item_idx
  on public.knowledge_citations (ingestion_item_id);

create index knowledge_citations_knowledge_item_idx
  on public.knowledge_citations (knowledge_item_id);

-- ---------------------------------------------------------------------------
-- RLS — platform admin only (review-first, no public reads)
-- ---------------------------------------------------------------------------

alter table public.knowledge_sources enable row level security;
alter table public.knowledge_sources force row level security;

alter table public.knowledge_ingestion_jobs enable row level security;
alter table public.knowledge_ingestion_jobs force row level security;

alter table public.knowledge_source_runs enable row level security;
alter table public.knowledge_source_runs force row level security;

alter table public.knowledge_ingestion_items enable row level security;
alter table public.knowledge_ingestion_items force row level security;

alter table public.knowledge_review_queue enable row level security;
alter table public.knowledge_review_queue force row level security;

alter table public.knowledge_citations enable row level security;
alter table public.knowledge_citations force row level security;

create policy "knowledge_sources_platform_admin"
  on public.knowledge_sources for all to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

create policy "knowledge_ingestion_jobs_platform_admin"
  on public.knowledge_ingestion_jobs for all to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

create policy "knowledge_source_runs_platform_admin"
  on public.knowledge_source_runs for all to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

create policy "knowledge_ingestion_items_platform_admin"
  on public.knowledge_ingestion_items for all to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

create policy "knowledge_review_queue_platform_admin"
  on public.knowledge_review_queue for all to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

create policy "knowledge_citations_platform_admin"
  on public.knowledge_citations for all to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

-- ---------------------------------------------------------------------------
-- Seed sources (safe defaults — placeholders disabled)
-- ---------------------------------------------------------------------------

insert into public.knowledge_sources (name, type, base_url, license_notes, trust_level, enabled, schedule, config)
values
  (
    'FAO AGROVOC',
    'official_api',
    'https://agrovoc.fao.org/sparql',
    'AGROVOC multilingual agricultural thesaurus — FAO. Use for vocabulary normalization only; not treatment advice. CC BY 4.0.',
    'high',
    true,
    'daily',
    '{"provider":"agrovoc","max_items_per_run":5}'::jsonb
  ),
  (
    'ISRIC SoilGrids',
    'open_dataset',
    'https://rest.isric.org/soilgrids/v2.0',
    'Soil property maps — ISRIC. Context only; no agronomic prescriptions.',
    'high',
    true,
    'daily',
    '{"provider":"soilgrids","max_items_per_run":3}'::jsonb
  ),
  (
    'Manual Upload',
    'manual',
    null,
    'Admin-uploaded documents with explicit license confirmation required.',
    'high',
    true,
    'manual',
    '{"provider":"manual_upload"}'::jsonb
  ),
  (
    'CABI Digital Library',
    'research',
    'https://www.cbi.org/',
    'PLACEHOLDER — requires licensed API agreement. Do not scrape.',
    'high',
    false,
    'weekly',
    '{"provider":"cabi","status":"placeholder"}'::jsonb
  ),
  (
    'PlantVillage Dataset',
    'open_dataset',
    'https://plantvillage.psu.edu/',
    'PLACEHOLDER — use official dataset exports only with license review.',
    'medium',
    false,
    'weekly',
    '{"provider":"plant_village","status":"placeholder"}'::jsonb
  ),
  (
    'Web Research',
    'website',
    null,
    'PLACEHOLDER — robots.txt and ToS compliance required before enable.',
    'low',
    false,
    'manual',
    '{"provider":"web_research","status":"placeholder"}'::jsonb
  )
on conflict (name) do nothing;

comment on table public.knowledge_ingestion_items is
  'Collected raw knowledge — never auto-published; requires review queue approval.';

comment on table public.knowledge_review_queue is
  'Human review gate before items become trusted Knowledge Bank content.';
