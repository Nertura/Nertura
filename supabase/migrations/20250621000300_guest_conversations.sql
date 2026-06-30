-- Guest homepage conversations (no auth user required)

alter table public.ai_conversations
  alter column organization_id drop not null,
  alter column user_id drop not null;

alter table public.ai_conversations
  add column if not exists guest_id uuid;

create index if not exists ai_conversations_guest_id_idx
  on public.ai_conversations (guest_id, created_at desc)
  where guest_id is not null and deleted_at is null;

alter table public.ai_conversations
  add constraint ai_conversations_owner_check
  check (
    (user_id is not null and guest_id is null)
    or (guest_id is not null and user_id is null)
  );

alter table public.ai_messages
  add column if not exists guest_id uuid;

create index if not exists ai_messages_guest_id_idx
  on public.ai_messages (guest_id, created_at desc)
  where guest_id is not null;
