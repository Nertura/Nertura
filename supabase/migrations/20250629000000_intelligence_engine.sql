-- Nertura Intelligence Engine: learning pipeline tables

create table public.ai_provider_outputs (
  id uuid primary key default extensions.uuid_generate_v4(),
  analysis_id uuid references public.ai_analyses (id) on delete cascade,
  conversation_id uuid references public.ai_conversations (id) on delete set null,
  user_id uuid references public.users (id) on delete set null,
  guest_id uuid,
  provider text not null,
  model text,
  request_type text not null default 'text' check (request_type in ('text', 'vision', 'synthesis')),
  raw_output jsonb not null default '{}'::jsonb,
  latency_ms integer,
  created_at timestamptz not null default timezone('utc', now())
);

create index ai_provider_outputs_analysis_id_idx on public.ai_provider_outputs (analysis_id);
create index ai_provider_outputs_created_at_idx on public.ai_provider_outputs (created_at desc);

create table public.ai_memory_events (
  id uuid primary key default extensions.uuid_generate_v4(),
  conversation_id uuid references public.ai_conversations (id) on delete set null,
  analysis_id uuid references public.ai_analyses (id) on delete set null,
  message_id uuid references public.ai_messages (id) on delete set null,
  user_id uuid references public.users (id) on delete set null,
  guest_id uuid,
  organization_id uuid references public.organizations (id) on delete set null,
  intent text not null,
  crop text,
  disease text,
  pest text,
  symptoms jsonb not null default '[]'::jsonb,
  diagnosis text,
  treatment text,
  confidence numeric(4, 3),
  provider_used text not null,
  raw_gemini_output jsonb,
  final_nertura_answer jsonb not null default '{}'::jsonb,
  entities jsonb not null default '{}'::jsonb,
  retrieval_context jsonb not null default '{}'::jsonb,
  reasoning_steps jsonb not null default '[]'::jsonb,
  feedback_status text not null default 'pending'
    check (feedback_status in ('pending', 'helpful', 'not_helpful', 'problem_solved', 'still_sick', 'wrong_diagnosis')),
  language text not null default 'tr',
  created_at timestamptz not null default timezone('utc', now())
);

create index ai_memory_events_user_id_idx on public.ai_memory_events (user_id, created_at desc);
create index ai_memory_events_guest_id_idx on public.ai_memory_events (guest_id, created_at desc)
  where guest_id is not null;
create index ai_memory_events_crop_idx on public.ai_memory_events (crop, created_at desc)
  where crop is not null;
create index ai_memory_events_intent_idx on public.ai_memory_events (intent, created_at desc);
create index ai_memory_events_feedback_idx on public.ai_memory_events (feedback_status, created_at desc);

create table public.ai_feedback (
  id uuid primary key default extensions.uuid_generate_v4(),
  analysis_id uuid not null references public.ai_analyses (id) on delete cascade,
  memory_event_id uuid references public.ai_memory_events (id) on delete set null,
  user_id uuid references public.users (id) on delete set null,
  guest_id uuid,
  feedback_type text not null
    check (feedback_type in ('helpful', 'not_helpful', 'problem_solved', 'still_sick', 'wrong_diagnosis')),
  comment text,
  created_at timestamptz not null default timezone('utc', now())
);

create index ai_feedback_analysis_id_idx on public.ai_feedback (analysis_id);
create index ai_feedback_type_idx on public.ai_feedback (feedback_type, created_at desc);

create table public.similar_cases (
  id uuid primary key default extensions.uuid_generate_v4(),
  memory_event_id uuid not null references public.ai_memory_events (id) on delete cascade,
  similar_memory_event_id uuid not null references public.ai_memory_events (id) on delete cascade,
  similarity_score numeric(4, 3) not null default 0,
  match_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (memory_event_id, similar_memory_event_id)
);

create index similar_cases_memory_event_id_idx on public.similar_cases (memory_event_id);

-- RLS
alter table public.ai_provider_outputs enable row level security;
alter table public.ai_provider_outputs force row level security;

alter table public.ai_memory_events enable row level security;
alter table public.ai_memory_events force row level security;

alter table public.ai_feedback enable row level security;
alter table public.ai_feedback force row level security;

alter table public.similar_cases enable row level security;
alter table public.similar_cases force row level security;

-- ai_provider_outputs
create policy "ai_provider_outputs_select_own"
  on public.ai_provider_outputs for select to authenticated
  using (
    user_id = auth.uid()
    or private.is_platform_admin()
  );

create policy "ai_provider_outputs_insert_service"
  on public.ai_provider_outputs for insert to authenticated
  with check (user_id = auth.uid() or private.is_platform_admin());

-- ai_memory_events
create policy "ai_memory_events_select_own"
  on public.ai_memory_events for select to authenticated
  using (
    user_id = auth.uid()
    or private.is_platform_admin()
  );

create policy "ai_memory_events_insert_own"
  on public.ai_memory_events for insert to authenticated
  with check (user_id = auth.uid() or private.is_platform_admin());

create policy "ai_memory_events_update_own"
  on public.ai_memory_events for update to authenticated
  using (user_id = auth.uid() or private.is_platform_admin())
  with check (user_id = auth.uid() or private.is_platform_admin());

-- ai_feedback
create policy "ai_feedback_select_own"
  on public.ai_feedback for select to authenticated
  using (
    user_id = auth.uid()
    or private.is_platform_admin()
  );

create policy "ai_feedback_insert_own"
  on public.ai_feedback for insert to authenticated
  with check (user_id = auth.uid() or private.is_platform_admin());

-- similar_cases
create policy "similar_cases_select_own"
  on public.similar_cases for select to authenticated
  using (
    exists (
      select 1 from public.ai_memory_events m
      where m.id = memory_event_id
        and (m.user_id = auth.uid() or private.is_platform_admin())
    )
  );

create policy "similar_cases_insert_own"
  on public.similar_cases for insert to authenticated
  with check (
    exists (
      select 1 from public.ai_memory_events m
      where m.id = memory_event_id
        and (m.user_id = auth.uid() or private.is_platform_admin())
    )
  );

grant select, insert on public.ai_provider_outputs to authenticated;
grant select, insert, update on public.ai_memory_events to authenticated;
grant select, insert on public.ai_feedback to authenticated;
grant select, insert on public.similar_cases to authenticated;
