-- Projects Engine v1 — extends field_cases (farmer: Vaka Takibi), timeline, tasks.
-- Does NOT duplicate conversations, analyses, photos, or memory events.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.case_progress as enum (
  'monitoring',
  'improving',
  'stable',
  'critical',
  'recovered',
  'closed'
);

create type public.case_timeline_event_type as enum (
  'case_created',
  'photo_uploaded',
  'diagnosis_created',
  'treatment_generated',
  'reminder_scheduled',
  'follow_up_analysis',
  'progress_updated',
  'feedback_received',
  'recovered',
  'completed',
  'note_added'
);

create type public.case_task_status as enum (
  'pending',
  'in_progress',
  'completed',
  'skipped',
  'cancelled'
);

create type public.case_task_source as enum (
  'ai',
  'farmer',
  'system'
);

-- ---------------------------------------------------------------------------
-- Extend field_cases (internal Project / external Vaka Takibi)
-- ---------------------------------------------------------------------------

alter table public.field_cases
  add column if not exists progress public.case_progress not null default 'monitoring',
  add column if not exists last_analysis_id uuid references public.ai_analyses (id) on delete set null,
  add column if not exists confidence numeric(4, 3),
  add column if not exists risk_level public.risk_level,
  add column if not exists crop_label text;

comment on column public.field_cases.progress is
  'Fine-grained recovery state; complements status (open/monitoring/resolved).';
comment on column public.field_cases.last_analysis_id is
  'Most recent primary diagnosis analysis for this case.';

create index if not exists field_cases_progress_idx
  on public.field_cases (organization_id, progress, updated_at desc);

-- Link analyses back to cases (no duplicate diagnosis storage)
alter table public.ai_analyses
  add column if not exists field_case_id uuid references public.field_cases (id) on delete set null;

create index if not exists ai_analyses_field_case_id_idx
  on public.ai_analyses (field_case_id, created_at desc)
  where field_case_id is not null;

-- ---------------------------------------------------------------------------
-- case_timeline_events — append-only case history
-- ---------------------------------------------------------------------------

create table public.case_timeline_events (
  id uuid primary key default gen_random_uuid(),
  field_case_id uuid not null references public.field_cases (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type public.case_timeline_event_type not null,
  title text not null,
  summary text,
  ref_table text,
  ref_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  -- Future notification hooks (email/push/calendar) — not consumed in v1
  notification_channels jsonb not null default '[]'::jsonb,
  notify_at timestamptz,
  created_at timestamptz not null default now()
);

create index case_timeline_events_case_idx
  on public.case_timeline_events (field_case_id, created_at desc);

create index case_timeline_events_notify_idx
  on public.case_timeline_events (notify_at)
  where notify_at is not null;

alter table public.case_timeline_events enable row level security;

create policy "case_timeline_events_select_member"
  on public.case_timeline_events for select to authenticated
  using (private.is_org_member(organization_id) or private.is_platform_admin());

create policy "case_timeline_events_insert_operator"
  on public.case_timeline_events for insert to authenticated
  with check (
    user_id = auth.uid()
    and (private.can_write_org(organization_id) or private.is_platform_admin())
  );

comment on table public.case_timeline_events is
  'Append-only timeline for field_cases (Projects Engine). Feeds future reminders/notifications.';

-- ---------------------------------------------------------------------------
-- case_tasks — AI-generated actions (architecture v1)
-- ---------------------------------------------------------------------------

create table public.case_tasks (
  id uuid primary key default gen_random_uuid(),
  field_case_id uuid not null references public.field_cases (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  analysis_id uuid references public.ai_analyses (id) on delete set null,
  title text not null,
  description text,
  source public.case_task_source not null default 'ai',
  status public.case_task_status not null default 'pending',
  due_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index case_tasks_case_idx
  on public.case_tasks (field_case_id, status, created_at desc);

create trigger case_tasks_set_updated_at
  before update on public.case_tasks
  for each row execute function private.set_updated_at();

alter table public.case_tasks enable row level security;

create policy "case_tasks_select_member"
  on public.case_tasks for select to authenticated
  using (private.is_org_member(organization_id) or private.is_platform_admin());

create policy "case_tasks_insert_operator"
  on public.case_tasks for insert to authenticated
  with check (
    user_id = auth.uid()
    and (private.can_write_org(organization_id) or private.is_platform_admin())
  );

create policy "case_tasks_update_operator"
  on public.case_tasks for update to authenticated
  using (private.can_write_org(organization_id) or private.is_platform_admin())
  with check (private.can_write_org(organization_id) or private.is_platform_admin());

comment on table public.case_tasks is
  'Action items for a field case; generated by AI in future sprints.';

grant select, insert, update on public.case_tasks to authenticated;
grant select, insert on public.case_timeline_events to authenticated;
