-- Production credit ledger + atomic debit/grant RPCs

create table if not exists public.credit_transactions (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references public.users (id) on delete cascade,
  amount integer not null,
  balance_after integer not null,
  transaction_type text not null check (
    transaction_type in (
      'signup_bonus',
      'ai_question',
      'purchase',
      'admin_grant',
      'refund',
      'adjustment'
    )
  ),
  description text,
  reference_id text,
  stripe_session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists credit_transactions_user_id_idx
  on public.credit_transactions (user_id, created_at desc);

create index if not exists credit_transactions_stripe_session_idx
  on public.credit_transactions (stripe_session_id)
  where stripe_session_id is not null;

alter table public.credit_transactions enable row level security;

create policy "credit_transactions_select_own"
  on public.credit_transactions for select
  using (user_id = auth.uid());

-- Service role / security definer functions insert transactions

comment on table public.credit_transactions is
  'Immutable ledger of all credit changes per user.';

-- Align subscription plan credit packs (one-time purchase packs)
update public.subscription_plans
set
  monthly_credits = case slug
    when 'starter' then 100
    when 'pro' then 500
    when 'business' then 2000
    else monthly_credits
  end,
  features = case slug
    when 'starter' then '{"credit_pack":100}'::jsonb
    when 'pro' then '{"credit_pack":500,"priority_ai":true}'::jsonb
    when 'business' then '{"credit_pack":2000,"team_seats":5}'::jsonb
    else features
  end
where slug in ('starter', 'pro', 'business');

-- Initialize credits on new user profile
create or replace function private.init_user_credits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_usage_limits (user_id, credits_balance, free_limit, question_count)
  values (new.id, 10, 10, 0)
  on conflict (user_id) do nothing;

  if not exists (
    select 1 from public.credit_transactions
    where user_id = new.id and transaction_type = 'signup_bonus'
  ) then
    insert into public.credit_transactions (
      user_id, amount, balance_after, transaction_type, description
    )
    values (
      new.id, 10, 10, 'signup_bonus', 'Welcome bonus — 10 free AI credits'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_public_user_init_credits on public.users;
create trigger on_public_user_init_credits
  after insert on public.users
  for each row execute function private.init_user_credits();

-- Backfill existing users without credits
insert into public.user_usage_limits (user_id, credits_balance, free_limit, question_count)
select u.id, 10, 10, 0
from public.users u
where not exists (
  select 1 from public.user_usage_limits l where l.user_id = u.id
)
on conflict (user_id) do nothing;

insert into public.credit_transactions (user_id, amount, balance_after, transaction_type, description)
select u.id, 10, coalesce(l.credits_balance, 10), 'signup_bonus', 'Backfill — 10 free AI credits'
from public.users u
left join public.user_usage_limits l on l.user_id = u.id
where not exists (
  select 1 from public.credit_transactions t
  where t.user_id = u.id and t.transaction_type = 'signup_bonus'
);

-- Atomic credit grant (purchases, admin)
create or replace function public.grant_user_credits(
  p_user_id uuid,
  p_amount integer,
  p_transaction_type text,
  p_description text default null,
  p_reference_id text default null,
  p_stripe_session_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_new_balance integer;
begin
  if p_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'amount_must_be_positive');
  end if;

  if p_stripe_session_id is not null and exists (
    select 1 from public.credit_transactions where stripe_session_id = p_stripe_session_id
  ) then
    return jsonb_build_object('success', false, 'error', 'already_processed', 'duplicate', true);
  end if;

  insert into public.user_usage_limits (user_id, credits_balance, free_limit, question_count)
  values (p_user_id, 0, 10, 0)
  on conflict (user_id) do nothing;

  select credits_balance into v_balance
  from public.user_usage_limits
  where user_id = p_user_id
  for update;

  v_new_balance := coalesce(v_balance, 0) + p_amount;

  update public.user_usage_limits
  set credits_balance = v_new_balance
  where user_id = p_user_id;

  insert into public.credit_transactions (
    user_id, amount, balance_after, transaction_type, description,
    reference_id, stripe_session_id, metadata
  )
  values (
    p_user_id, p_amount, v_new_balance, p_transaction_type,
    coalesce(p_description, 'Credit grant'),
    p_reference_id, p_stripe_session_id, p_metadata
  );

  return jsonb_build_object('success', true, 'balance_after', v_new_balance);
end;
$$;

grant execute on function public.grant_user_credits(uuid, integer, text, text, text, text, jsonb) to service_role;

-- Atomic debit for AI questions
create or replace function public.debit_user_credit(
  p_user_id uuid,
  p_description text default 'AI Agriculture Doctor question',
  p_reference_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_new_balance integer;
begin
  insert into public.user_usage_limits (user_id, credits_balance, free_limit, question_count)
  values (p_user_id, 10, 10, 0)
  on conflict (user_id) do nothing;

  if not exists (
    select 1 from public.credit_transactions
    where user_id = p_user_id and transaction_type = 'signup_bonus'
  ) then
    insert into public.credit_transactions (
      user_id, amount, balance_after, transaction_type, description
    )
    values (p_user_id, 10, 10, 'signup_bonus', 'Welcome bonus — 10 free AI credits');
    update public.user_usage_limits set credits_balance = 10 where user_id = p_user_id;
  end if;

  select credits_balance into v_balance
  from public.user_usage_limits
  where user_id = p_user_id
  for update;

  if coalesce(v_balance, 0) <= 0 then
    return jsonb_build_object(
      'success', false,
      'balance_after', 0,
      'error', 'insufficient_credits'
    );
  end if;

  v_new_balance := v_balance - 1;

  update public.user_usage_limits
  set
    credits_balance = v_new_balance,
    question_count = coalesce(question_count, 0) + 1
  where user_id = p_user_id;

  insert into public.credit_transactions (
    user_id, amount, balance_after, transaction_type, description, reference_id
  )
  values (
    p_user_id, -1, v_new_balance, 'ai_question',
    coalesce(p_description, 'AI question'), p_reference_id
  );

  return jsonb_build_object('success', true, 'balance_after', v_new_balance);
end;
$$;

grant execute on function public.debit_user_credit(uuid, text, text) to authenticated;
grant execute on function public.debit_user_credit(uuid, text, text) to service_role;
