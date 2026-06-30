-- Nertura Phase 2: enable Row Level Security on all tables

alter table public.organizations enable row level security;
alter table public.organizations force row level security;

alter table public.users enable row level security;
alter table public.users force row level security;

alter table public.memberships enable row level security;
alter table public.memberships force row level security;

alter table public.farms enable row level security;
alter table public.farms force row level security;

alter table public.fields enable row level security;
alter table public.fields force row level security;

alter table public.crops enable row level security;
alter table public.crops force row level security;

alter table public.subscriptions enable row level security;
alter table public.subscriptions force row level security;

alter table public.ai_conversations enable row level security;
alter table public.ai_conversations force row level security;

alter table public.audit_logs enable row level security;
alter table public.audit_logs force row level security;
