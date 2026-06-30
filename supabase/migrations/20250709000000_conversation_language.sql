-- Lock AI Doctor conversation response language (tr | en)
alter table public.ai_conversations
  add column if not exists language text check (language in ('tr', 'en'));

create index if not exists ai_conversations_user_language_idx
  on public.ai_conversations (user_id, updated_at desc)
  where deleted_at is null and language is not null;

comment on column public.ai_conversations.language is
  'Locked farmer-facing language for this conversation; set on first user interaction.';
