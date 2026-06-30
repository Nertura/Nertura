-- Nertura Memory & Outcome Engine

create type public.diagnosis_outcome_type as enum (
  'solved',
  'improved',
  'no_change',
  'worse'
);

create type public.follow_up_status as enum (
  'pending',
  'completed',
  'skipped'
);

-- ---------------------------------------------------------------------------
-- diagnosis_outcomes — user-reported results after treatment
-- ---------------------------------------------------------------------------

create table public.diagnosis_outcomes (
  id uuid primary key default extensions.uuid_generate_v4(),
  diagnosis_id uuid not null references public.ai_analyses (id) on delete cascade,
  memory_event_id uuid references public.ai_memory_events (id) on delete set null,
  user_id uuid not null references public.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete set null,
  crop text,
  disease text,
  confidence numeric(4, 3),
  outcome public.diagnosis_outcome_type not null,
  days_since integer not null check (days_since in (7, 14, 30)),
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create index diagnosis_outcomes_diagnosis_id_idx on public.diagnosis_outcomes (diagnosis_id);
create index diagnosis_outcomes_user_id_idx on public.diagnosis_outcomes (user_id, created_at desc);
create index diagnosis_outcomes_crop_disease_idx on public.diagnosis_outcomes (crop, disease, outcome);

-- ---------------------------------------------------------------------------
-- diagnosis_follow_ups — scheduled check-ins at 7 / 14 / 30 days
-- ---------------------------------------------------------------------------

create table public.diagnosis_follow_ups (
  id uuid primary key default extensions.uuid_generate_v4(),
  diagnosis_id uuid not null references public.ai_analyses (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete set null,
  days_since integer not null check (days_since in (7, 14, 30)),
  due_at timestamptz not null,
  status public.follow_up_status not null default 'pending',
  crop text,
  disease text,
  created_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  unique (diagnosis_id, days_since)
);

create index diagnosis_follow_ups_user_pending_idx
  on public.diagnosis_follow_ups (user_id, due_at)
  where status = 'pending';

-- ---------------------------------------------------------------------------
-- disease_history — aggregated crop/disease ledger per user
-- ---------------------------------------------------------------------------

create table public.disease_history (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references public.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete set null,
  farm_id uuid references public.farms (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  crop text not null,
  disease text,
  occurrence_count integer not null default 1,
  first_seen_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  last_diagnosis_id uuid references public.ai_analyses (id) on delete set null,
  last_confidence numeric(4, 3),
  last_outcome public.diagnosis_outcome_type,
  last_treatment text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index disease_history_user_crop_disease_uidx
  on public.disease_history (user_id, crop, coalesce(disease, ''));

create index disease_history_user_id_idx on public.disease_history (user_id, last_seen_at desc);

create trigger disease_history_set_updated_at
  before update on public.disease_history
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- weather_snapshots — placeholder schema for future API population
-- ---------------------------------------------------------------------------

create table public.weather_snapshots (
  id uuid primary key default extensions.uuid_generate_v4(),
  diagnosis_id uuid references public.ai_analyses (id) on delete cascade,
  memory_event_id uuid references public.ai_memory_events (id) on delete set null,
  user_id uuid references public.users (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete set null,
  location text,
  climate_zone text,
  temperature numeric(5, 2),
  humidity numeric(5, 2),
  rainfall numeric(8, 2),
  source text not null default 'placeholder',
  recorded_at timestamptz not null default timezone('utc', now()),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index weather_snapshots_diagnosis_id_idx on public.weather_snapshots (diagnosis_id);

-- ---------------------------------------------------------------------------
-- analysis_memory_links — tie diagnoses to farm / project context
-- ---------------------------------------------------------------------------

create table public.analysis_memory_links (
  id uuid primary key default extensions.uuid_generate_v4(),
  diagnosis_id uuid not null references public.ai_analyses (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete set null,
  farm_id uuid references public.farms (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  field_id uuid references public.fields (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index analysis_memory_links_diagnosis_id_idx on public.analysis_memory_links (diagnosis_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.diagnosis_outcomes enable row level security;
alter table public.diagnosis_outcomes force row level security;

alter table public.diagnosis_follow_ups enable row level security;
alter table public.diagnosis_follow_ups force row level security;

alter table public.disease_history enable row level security;
alter table public.disease_history force row level security;

alter table public.weather_snapshots enable row level security;
alter table public.weather_snapshots force row level security;

alter table public.analysis_memory_links enable row level security;
alter table public.analysis_memory_links force row level security;

create policy "diagnosis_outcomes_select_own"
  on public.diagnosis_outcomes for select to authenticated
  using (user_id = auth.uid() or private.is_platform_admin());

create policy "diagnosis_outcomes_insert_own"
  on public.diagnosis_outcomes for insert to authenticated
  with check (user_id = auth.uid());

create policy "diagnosis_follow_ups_select_own"
  on public.diagnosis_follow_ups for select to authenticated
  using (user_id = auth.uid() or private.is_platform_admin());

create policy "diagnosis_follow_ups_update_own"
  on public.diagnosis_follow_ups for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "diagnosis_follow_ups_insert_own"
  on public.diagnosis_follow_ups for insert to authenticated
  with check (user_id = auth.uid());

create policy "disease_history_select_own"
  on public.disease_history for select to authenticated
  using (user_id = auth.uid() or private.is_platform_admin());

create policy "disease_history_insert_own"
  on public.disease_history for insert to authenticated
  with check (user_id = auth.uid());

create policy "disease_history_update_own"
  on public.disease_history for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "weather_snapshots_select_own"
  on public.weather_snapshots for select to authenticated
  using (user_id = auth.uid() or private.is_platform_admin());

create policy "weather_snapshots_insert_own"
  on public.weather_snapshots for insert to authenticated
  with check (user_id = auth.uid() or private.is_platform_admin());

create policy "analysis_memory_links_select_own"
  on public.analysis_memory_links for select to authenticated
  using (user_id = auth.uid() or private.is_platform_admin());

create policy "analysis_memory_links_insert_own"
  on public.analysis_memory_links for insert to authenticated
  with check (user_id = auth.uid());

grant select, insert on public.diagnosis_outcomes to authenticated;
grant select, insert, update on public.diagnosis_follow_ups to authenticated;
grant select, insert, update on public.disease_history to authenticated;
grant select, insert on public.weather_snapshots to authenticated;
grant select, insert on public.analysis_memory_links to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: schedule follow-ups when a diagnosis is saved
-- ---------------------------------------------------------------------------

create or replace function public.schedule_diagnosis_follow_ups(
  p_diagnosis_id uuid,
  p_user_id uuid,
  p_organization_id uuid default null,
  p_crop text default null,
  p_disease text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base timestamptz;
  v_days integer;
begin
  if auth.uid() is not null and auth.uid() is distinct from p_user_id then
    raise exception 'forbidden';
  end if;

  select created_at into v_base from public.ai_analyses where id = p_diagnosis_id;
  if v_base is null then
    v_base := timezone('utc', now());
  end if;

  foreach v_days in array array[7, 14, 30]
  loop
    insert into public.diagnosis_follow_ups (
      diagnosis_id, user_id, organization_id, days_since, due_at, crop, disease
    )
    values (
      p_diagnosis_id,
      p_user_id,
      p_organization_id,
      v_days,
      v_base + (v_days || ' days')::interval,
      p_crop,
      p_disease
    )
    on conflict (diagnosis_id, days_since) do nothing;
  end loop;

  return jsonb_build_object('success', true, 'diagnosis_id', p_diagnosis_id);
end;
$$;

grant execute on function public.schedule_diagnosis_follow_ups(uuid, uuid, uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: record outcome + complete follow-up + update disease history
-- ---------------------------------------------------------------------------

create or replace function public.record_diagnosis_outcome(
  p_diagnosis_id uuid,
  p_user_id uuid,
  p_outcome public.diagnosis_outcome_type,
  p_days_since integer,
  p_notes text default null,
  p_memory_event_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_analysis record;
  v_outcome_id uuid;
begin
  if auth.uid() is not null and auth.uid() is distinct from p_user_id then
    raise exception 'forbidden';
  end if;

  select * into v_analysis
  from public.ai_analyses
  where id = p_diagnosis_id and user_id = p_user_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'diagnosis_not_found');
  end if;

  insert into public.diagnosis_outcomes (
    diagnosis_id, memory_event_id, user_id, organization_id,
    crop, disease, confidence, outcome, days_since, notes
  )
  select
    p_diagnosis_id,
    p_memory_event_id,
    p_user_id,
    v_analysis.organization_id,
    coalesce(
      (v_analysis.metadata->'intelligence'->'entities'->'crops'->>0),
      (v_analysis.raw_brain->'entities'->'crops'->>0)
    ),
    coalesce(
      (v_analysis.metadata->'intelligence'->'entities'->'diseases'->>0),
      (v_analysis.raw_brain->'entities'->'diseases'->>0)
    ),
    v_analysis.confidence,
    p_outcome,
    p_days_since,
    p_notes
  returning id into v_outcome_id;

  update public.diagnosis_follow_ups
  set status = 'completed', completed_at = timezone('utc', now())
  where diagnosis_id = p_diagnosis_id
    and days_since = p_days_since
    and user_id = p_user_id;

  update public.disease_history dh
  set last_outcome = p_outcome, updated_at = timezone('utc', now())
  from public.diagnosis_outcomes o
  where o.id = v_outcome_id
    and dh.user_id = p_user_id
    and dh.crop = o.crop
    and coalesce(dh.disease, '') = coalesce(o.disease, '');

  return jsonb_build_object('success', true, 'outcome_id', v_outcome_id);
end;
$$;

grant execute on function public.record_diagnosis_outcome(uuid, uuid, public.diagnosis_outcome_type, integer, text, uuid) to authenticated;
