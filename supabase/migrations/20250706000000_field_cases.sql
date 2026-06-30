-- Field cases: agricultural "patient files" linked to fields, conversations, and intake.

create type public.field_case_status as enum ('open', 'monitoring', 'resolved');

create table public.field_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  farm_id uuid references public.farms (id) on delete set null,
  field_id uuid references public.fields (id) on delete set null,
  conversation_id uuid references public.ai_conversations (id) on delete set null,
  status public.field_case_status not null default 'open',
  raw_intake text,
  symptom text,
  severity text,
  diagnosis_summary text,
  treatment_plan text,
  prevention_plan text,
  follow_up_date date,
  intake_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index field_cases_org_idx on public.field_cases (organization_id, created_at desc);
create index field_cases_field_idx on public.field_cases (field_id) where field_id is not null;
create index field_cases_status_idx on public.field_cases (status);

alter table public.field_cases enable row level security;

create policy "field_cases_select_member"
  on public.field_cases for select to authenticated
  using (private.is_org_member(organization_id) or private.is_platform_admin());

create policy "field_cases_insert_operator"
  on public.field_cases for insert to authenticated
  with check (
    user_id = auth.uid()
    and (private.can_write_org(organization_id) or private.is_platform_admin())
  );

create policy "field_cases_update_operator"
  on public.field_cases for update to authenticated
  using (private.can_write_org(organization_id) or private.is_platform_admin())
  with check (private.can_write_org(organization_id) or private.is_platform_admin());

comment on table public.field_cases is
  'Ongoing field/crop problem cases — patient files for AI Doctor follow-up.';
