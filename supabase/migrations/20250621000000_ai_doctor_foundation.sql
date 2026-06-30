-- Nertura AI Doctor foundation — conversations, analyses, knowledge_items, usage, projects

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.knowledge_item_type as enum (
  'plant',
  'disease',
  'pest',
  'treatment',
  'fertilizer',
  'soil',
  'irrigation',
  'article'
);

create type public.analysis_status as enum (
  'pending',
  'processing',
  'completed',
  'failed'
);

create type public.risk_level as enum (
  'low',
  'medium',
  'high',
  'critical'
);

create type public.media_content_status as enum (
  'draft',
  'approved',
  'scheduled',
  'published'
);

create type public.media_platform as enum (
  'tiktok',
  'youtube_shorts',
  'instagram_reels',
  'blog',
  'email'
);

-- ---------------------------------------------------------------------------
-- projects (user memory modules)
-- ---------------------------------------------------------------------------

create table public.projects (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid references public.organizations (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  name varchar(255) not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create index projects_user_id_idx on public.projects (user_id) where deleted_at is null;
create index projects_org_id_idx on public.projects (organization_id) where deleted_at is null;

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- ai_messages (normalized message store)
-- ---------------------------------------------------------------------------

create table public.ai_messages (
  id uuid primary key default extensions.uuid_generate_v4(),
  conversation_id uuid not null references public.ai_conversations (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete set null,
  user_id uuid references public.users (id) on delete set null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index ai_messages_conversation_id_idx on public.ai_messages (conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- ai_analyses
-- ---------------------------------------------------------------------------

create table public.ai_analyses (
  id uuid primary key default extensions.uuid_generate_v4(),
  conversation_id uuid references public.ai_conversations (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete set null,
  user_id uuid references public.users (id) on delete set null,
  guest_id uuid,
  question text not null,
  diagnosis text,
  symptoms text,
  risk_level public.risk_level default 'medium',
  treatment text,
  prevention text,
  notes text,
  confidence numeric(4, 3),
  source text not null default 'brain',
  raw_gemini jsonb,
  raw_openai jsonb,
  raw_brain jsonb,
  knowledge_hits jsonb not null default '[]'::jsonb,
  status public.analysis_status not null default 'completed',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index ai_analyses_user_id_idx on public.ai_analyses (user_id, created_at desc);
create index ai_analyses_guest_id_idx on public.ai_analyses (guest_id, created_at desc)
  where guest_id is not null;

create trigger ai_analyses_set_updated_at
  before update on public.ai_analyses
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- analysis_images
-- ---------------------------------------------------------------------------

create table public.analysis_images (
  id uuid primary key default extensions.uuid_generate_v4(),
  analysis_id uuid not null references public.ai_analyses (id) on delete cascade,
  user_id uuid references public.users (id) on delete set null,
  guest_id uuid,
  storage_path text not null,
  mime_type varchar(50) not null,
  file_size integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index analysis_images_analysis_id_idx on public.analysis_images (analysis_id);

-- ---------------------------------------------------------------------------
-- knowledge_items (unified knowledge base)
-- ---------------------------------------------------------------------------

create table public.knowledge_items (
  id uuid primary key default extensions.uuid_generate_v4(),
  type public.knowledge_item_type not null,
  name_tr text not null,
  name_en text not null,
  slug text not null,
  summary_tr text,
  summary_en text,
  symptoms jsonb not null default '[]'::jsonb,
  causes jsonb not null default '[]'::jsonb,
  treatments jsonb not null default '[]'::jsonb,
  prevention jsonb not null default '[]'::jsonb,
  related_crops jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  source text,
  confidence_level numeric(4, 3),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index knowledge_items_slug_uidx on public.knowledge_items (slug);
create index knowledge_items_type_idx on public.knowledge_items (type);

create trigger knowledge_items_set_updated_at
  before update on public.knowledge_items
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- knowledge_import_batches
-- ---------------------------------------------------------------------------

create table public.knowledge_import_batches (
  id uuid primary key default extensions.uuid_generate_v4(),
  imported_by uuid references public.users (id) on delete set null,
  table_target text not null,
  format text not null check (format in ('csv', 'json')),
  total_rows integer not null default 0,
  success_rows integer not null default 0,
  failed_rows integer not null default 0,
  errors jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- user_usage_limits
-- ---------------------------------------------------------------------------

create table public.user_usage_limits (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references public.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete set null,
  question_count integer not null default 0,
  free_limit integer not null default 10,
  period_start timestamptz not null default timezone('utc', now()),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index user_usage_limits_user_uidx on public.user_usage_limits (user_id);

create trigger user_usage_limits_set_updated_at
  before update on public.user_usage_limits
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- guest_usage (public homepage guest tracking)
-- ---------------------------------------------------------------------------

create table public.guest_usage (
  id uuid primary key default extensions.uuid_generate_v4(),
  guest_id uuid not null unique,
  question_count integer not null default 0,
  free_limit integer not null default 3,
  last_question_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger guest_usage_set_updated_at
  before update on public.guest_usage
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- media_content_queue (future growth engine skeleton)
-- ---------------------------------------------------------------------------

create table public.media_content_queue (
  id uuid primary key default extensions.uuid_generate_v4(),
  platform public.media_platform not null,
  title text not null,
  script text,
  voiceover_text text,
  visual_prompt text,
  status public.media_content_status not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger media_content_queue_set_updated_at
  before update on public.media_content_queue
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Storage bucket for analysis images
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'analysis-images',
  'analysis-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.projects enable row level security;
alter table public.projects force row level security;

alter table public.ai_messages enable row level security;
alter table public.ai_messages force row level security;

alter table public.ai_analyses enable row level security;
alter table public.ai_analyses force row level security;

alter table public.analysis_images enable row level security;
alter table public.analysis_images force row level security;

alter table public.knowledge_items enable row level security;
alter table public.knowledge_items force row level security;

alter table public.knowledge_import_batches enable row level security;
alter table public.knowledge_import_batches force row level security;

alter table public.user_usage_limits enable row level security;
alter table public.user_usage_limits force row level security;

alter table public.guest_usage enable row level security;
alter table public.guest_usage force row level security;

alter table public.media_content_queue enable row level security;
alter table public.media_content_queue force row level security;

-- projects
create policy "projects_select_own"
  on public.projects for select to authenticated
  using (user_id = auth.uid() and deleted_at is null);

create policy "projects_insert_own"
  on public.projects for insert to authenticated
  with check (user_id = auth.uid());

create policy "projects_update_own"
  on public.projects for update to authenticated
  using (user_id = auth.uid() and deleted_at is null)
  with check (user_id = auth.uid());

-- ai_messages
create policy "ai_messages_select_own"
  on public.ai_messages for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.ai_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

create policy "ai_messages_insert_own"
  on public.ai_messages for insert to authenticated
  with check (user_id = auth.uid());

-- ai_analyses
create policy "ai_analyses_select_own"
  on public.ai_analyses for select to authenticated
  using (user_id = auth.uid());

create policy "ai_analyses_insert_own"
  on public.ai_analyses for insert to authenticated
  with check (user_id = auth.uid());

-- analysis_images
create policy "analysis_images_select_own"
  on public.analysis_images for select to authenticated
  using (user_id = auth.uid());

create policy "analysis_images_insert_own"
  on public.analysis_images for insert to authenticated
  with check (user_id = auth.uid());

-- knowledge_items — read all authenticated; write platform admin
create policy "knowledge_items_select_authenticated"
  on public.knowledge_items for select to authenticated
  using (true);

create policy "knowledge_items_write_admin"
  on public.knowledge_items for all to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

-- knowledge_import_batches — admin only
create policy "knowledge_import_batches_admin"
  on public.knowledge_import_batches for all to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

-- user_usage_limits
create policy "user_usage_limits_select_own"
  on public.user_usage_limits for select to authenticated
  using (user_id = auth.uid());

create policy "user_usage_limits_insert_own"
  on public.user_usage_limits for insert to authenticated
  with check (user_id = auth.uid());

create policy "user_usage_limits_update_own"
  on public.user_usage_limits for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- guest_usage — no direct client access (service role only)
-- media_content_queue — admin only
create policy "media_content_queue_admin"
  on public.media_content_queue for all to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

-- storage policies for analysis-images
create policy "analysis_images_storage_select_own"
  on storage.objects for select to authenticated
  using (bucket_id = 'analysis-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "analysis_images_storage_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'analysis-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "analysis_images_storage_delete_own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'analysis-images' and (storage.foldername(name))[1] = auth.uid()::text);
