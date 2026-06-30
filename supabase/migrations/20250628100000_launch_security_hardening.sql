-- Launch security hardening: credit ledger + RPC permissions

alter table public.credit_transactions force row level security;

revoke all on table public.credit_transactions from anon;
grant select on table public.credit_transactions to authenticated;

revoke all on function public.grant_user_credits(uuid, integer, text, text, text, text, jsonb) from public;
revoke all on function public.grant_user_credits(uuid, integer, text, text, text, text, jsonb) from authenticated;
grant execute on function public.grant_user_credits(uuid, integer, text, text, text, text, jsonb) to service_role;

revoke all on function public.debit_user_credit(uuid, text, text) from anon;
grant execute on function public.debit_user_credit(uuid, text, text) to authenticated;
grant execute on function public.debit_user_credit(uuid, text, text) to service_role;
