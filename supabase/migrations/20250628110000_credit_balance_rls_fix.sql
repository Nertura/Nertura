-- Prevent client-side credit inflation: ledger writes only via SECURITY DEFINER RPCs

drop policy if exists "user_usage_limits_insert_own" on public.user_usage_limits;
drop policy if exists "user_usage_limits_update_own" on public.user_usage_limits;

-- Users may read their balance; inserts/updates happen via init_user_credits / debit / grant RPCs only

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
  if auth.role() = 'authenticated' and auth.uid() is distinct from p_user_id then
    raise exception 'forbidden: cannot debit another user''s credits';
  end if;

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

alter table public.subscription_plans force row level security;
