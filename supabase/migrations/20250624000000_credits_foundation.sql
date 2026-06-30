-- Credits foundation for registered users

alter table public.user_usage_limits
  add column if not exists credits_balance integer not null default 0;

comment on column public.user_usage_limits.credits_balance is
  'Paid credits for questions beyond free_limit. Payment provider TBD.';

comment on column public.user_usage_limits.question_count is
  'Questions used in current free period';

comment on column public.user_usage_limits.free_limit is
  'Free registered question limit (default 10)';

comment on column public.guest_usage.question_count is
  'Guest homepage questions used (default limit 3)';
