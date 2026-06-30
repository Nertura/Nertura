-- subscriptions RLS policies
-- Owner/admin read; mutations via service role (Stripe webhooks)

create policy "subscriptions_select_finance"
  on public.subscriptions
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      private.can_admin_org(organization_id)
      or private.is_org_owner(organization_id)
      or private.is_platform_admin()
    )
  );

-- No INSERT/UPDATE/DELETE policies for authenticated — service_role bypasses RLS
