-- memberships RLS policies

create policy "memberships_select_member"
  on public.memberships
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      private.is_org_member(organization_id)
      or private.is_platform_admin()
    )
  );

create policy "memberships_insert_admin"
  on public.memberships
  for insert
  to authenticated
  with check (
    private.can_admin_org(organization_id)
    or private.is_platform_admin()
  );

create policy "memberships_update_admin"
  on public.memberships
  for update
  to authenticated
  using (
    private.can_admin_org(organization_id)
    or private.is_platform_admin()
  )
  with check (
    private.can_admin_org(organization_id)
    or private.is_platform_admin()
  );

create policy "memberships_insert_bootstrap_owner"
  on public.memberships
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and role = 'owner'
    and exists (
      select 1
      from public.organizations o
      where o.id = organization_id
        and o.created_by = auth.uid()
        and o.deleted_at is null
    )
    and not exists (
      select 1
      from public.memberships m
      where m.organization_id = memberships.organization_id
        and m.deleted_at is null
    )
  );

-- Viewers: no insert/update/delete policies apply (SELECT only via memberships_select_member)
