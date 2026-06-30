-- Nertura Knowledge Base — reference tables for bulk import (plants, diseases, pests, etc.)

-- ---------------------------------------------------------------------------
-- Shared reference table pattern
-- ---------------------------------------------------------------------------

create table public.plants (
  id uuid primary key default extensions.uuid_generate_v4(),
  name_tr text not null,
  name_en text not null,
  slug text not null,
  description_tr text,
  description_en text,
  category text,
  symptoms text,
  causes text,
  treatment text,
  prevention text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint plants_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index plants_slug_uidx on public.plants (slug);

create table public.plant_diseases (
  id uuid primary key default extensions.uuid_generate_v4(),
  name_tr text not null,
  name_en text not null,
  slug text not null,
  description_tr text,
  description_en text,
  category text,
  symptoms text,
  causes text,
  treatment text,
  prevention text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint plant_diseases_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index plant_diseases_slug_uidx on public.plant_diseases (slug);

create table public.plant_pests (
  id uuid primary key default extensions.uuid_generate_v4(),
  name_tr text not null,
  name_en text not null,
  slug text not null,
  description_tr text,
  description_en text,
  category text,
  symptoms text,
  causes text,
  treatment text,
  prevention text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint plant_pests_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index plant_pests_slug_uidx on public.plant_pests (slug);

create table public.treatments (
  id uuid primary key default extensions.uuid_generate_v4(),
  name_tr text not null,
  name_en text not null,
  slug text not null,
  description_tr text,
  description_en text,
  category text,
  symptoms text,
  causes text,
  treatment text,
  prevention text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint treatments_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index treatments_slug_uidx on public.treatments (slug);

create table public.fertilizers (
  id uuid primary key default extensions.uuid_generate_v4(),
  name_tr text not null,
  name_en text not null,
  slug text not null,
  description_tr text,
  description_en text,
  category text,
  symptoms text,
  causes text,
  treatment text,
  prevention text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint fertilizers_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index fertilizers_slug_uidx on public.fertilizers (slug);

create table public.knowledge_articles (
  id uuid primary key default extensions.uuid_generate_v4(),
  name_tr text not null,
  name_en text not null,
  slug text not null,
  description_tr text,
  description_en text,
  category text,
  symptoms text,
  causes text,
  treatment text,
  prevention text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint knowledge_articles_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index knowledge_articles_slug_uidx on public.knowledge_articles (slug);

-- updated_at triggers
create trigger plants_set_updated_at
  before update on public.plants
  for each row execute function private.set_updated_at();

create trigger plant_diseases_set_updated_at
  before update on public.plant_diseases
  for each row execute function private.set_updated_at();

create trigger plant_pests_set_updated_at
  before update on public.plant_pests
  for each row execute function private.set_updated_at();

create trigger treatments_set_updated_at
  before update on public.treatments
  for each row execute function private.set_updated_at();

create trigger fertilizers_set_updated_at
  before update on public.fertilizers
  for each row execute function private.set_updated_at();

create trigger knowledge_articles_set_updated_at
  before update on public.knowledge_articles
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — global reference data: read for authenticated, write for platform admin
-- ---------------------------------------------------------------------------

alter table public.plants enable row level security;
alter table public.plants force row level security;

alter table public.plant_diseases enable row level security;
alter table public.plant_diseases force row level security;

alter table public.plant_pests enable row level security;
alter table public.plant_pests force row level security;

alter table public.treatments enable row level security;
alter table public.treatments force row level security;

alter table public.fertilizers enable row level security;
alter table public.fertilizers force row level security;

alter table public.knowledge_articles enable row level security;
alter table public.knowledge_articles force row level security;

-- plants
create policy "plants_select_authenticated"
  on public.plants for select to authenticated
  using (true);

create policy "plants_write_platform_admin"
  on public.plants for all to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

-- plant_diseases
create policy "plant_diseases_select_authenticated"
  on public.plant_diseases for select to authenticated
  using (true);

create policy "plant_diseases_write_platform_admin"
  on public.plant_diseases for all to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

-- plant_pests
create policy "plant_pests_select_authenticated"
  on public.plant_pests for select to authenticated
  using (true);

create policy "plant_pests_write_platform_admin"
  on public.plant_pests for all to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

-- treatments
create policy "treatments_select_authenticated"
  on public.treatments for select to authenticated
  using (true);

create policy "treatments_write_platform_admin"
  on public.treatments for all to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

-- fertilizers
create policy "fertilizers_select_authenticated"
  on public.fertilizers for select to authenticated
  using (true);

create policy "fertilizers_write_platform_admin"
  on public.fertilizers for all to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

-- knowledge_articles
create policy "knowledge_articles_select_authenticated"
  on public.knowledge_articles for select to authenticated
  using (true);

create policy "knowledge_articles_write_platform_admin"
  on public.knowledge_articles for all to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());
