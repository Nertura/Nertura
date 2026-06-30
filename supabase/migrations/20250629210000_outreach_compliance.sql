-- Outreach CRM compliance: do-not-contact + unsubscribe token

alter table public.leads
  add column if not exists do_not_contact boolean not null default false,
  add column if not exists unsubscribe_token text;

-- Backfill tokens for existing rows
update public.leads
set unsubscribe_token = extensions.uuid_generate_v4()::text
where unsubscribe_token is null;

alter table public.leads
  alter column unsubscribe_token set not null,
  alter column unsubscribe_token set default extensions.uuid_generate_v4()::text;

create unique index if not exists leads_unsubscribe_token_uidx
  on public.leads (unsubscribe_token);

create index if not exists leads_do_not_contact_idx
  on public.leads (do_not_contact)
  where do_not_contact = true;
