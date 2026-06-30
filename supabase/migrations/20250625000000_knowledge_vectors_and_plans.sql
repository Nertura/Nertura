-- Knowledge retrieval architecture: vector embeddings (pgvector) — prepared, not activated.
-- Enable when embedding pipeline is ready: SET app.enable_kb_vectors = true;

create extension if not exists vector with schema extensions;

alter table public.knowledge_items
  add column if not exists embedding extensions.vector(768),
  add column if not exists embedding_model varchar(100),
  add column if not exists embedded_at timestamptz,
  add column if not exists search_document tsvector;

comment on column public.knowledge_items.embedding is
  'Semantic embedding for vector search (768-dim default for Gemini/text models).';

comment on column public.knowledge_items.search_document is
  'Weighted FTS document for hybrid lexical + semantic retrieval.';

-- Backfill search_document from bank fields
update public.knowledge_items
set search_document =
  setweight(to_tsvector('english', coalesce(title, name_en, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(crop, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(disease, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(content, summary_en, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(symptoms_text, '')), 'C')
where search_document is null;

create index if not exists knowledge_items_search_document_gin
  on public.knowledge_items using gin (search_document);

-- IVFFlat index for future vector search (lists tuned for <100k rows initially)
create index if not exists knowledge_items_embedding_ivfflat_idx
  on public.knowledge_items using ivfflat (embedding extensions.vector_cosine_ops)
  with (lists = 100)
  where embedding is not null;

-- Subscription tiers foundation (monetization architecture)
create table if not exists public.subscription_plans (
  id uuid primary key default extensions.uuid_generate_v4(),
  slug varchar(50) not null unique,
  name varchar(100) not null,
  monthly_questions integer,
  monthly_credits integer,
  price_cents integer not null default 0,
  currency char(3) not null default 'USD',
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.subscription_plans (slug, name, monthly_questions, monthly_credits, price_cents, sort_order, features)
values
  ('free', 'Free', 10, 0, 0, 0, '{"guest_limit":3}'::jsonb),
  ('starter', 'Starter', 100, 0, 999, 1, '{}'::jsonb),
  ('pro', 'Pro', 500, 0, 2999, 2, '{"priority_ai":true}'::jsonb),
  ('business', 'Business', null, 5000, 9999, 3, '{"team_seats":5}'::jsonb),
  ('enterprise', 'Enterprise', null, null, 0, 4, '{"custom":true}'::jsonb)
on conflict (slug) do nothing;

alter table public.subscription_plans enable row level security;

create policy "subscription_plans_read_all"
  on public.subscription_plans for select
  using (is_active = true);
