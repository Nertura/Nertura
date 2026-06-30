-- farms RLS policies
-- Members read; operator+ write; admin+ soft delete

create policy "farms_select_member"
  on public.farms
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      private.is_org_member(organization_id)
      or private.is_platform_admin()
    )
  );

create policy "farms_insert_operator"
  on public.farms
  for insert
  to authenticated
  with check (
    private.can_write_org(organization_id)
    or private.is_platform_admin()
  );

create policy "farms_update_operator"
  on public.farms
  for update
  to authenticated
  using (
    deleted_at is null
    and (
      private.can_write_org(organization_id)
      or private.is_platform_admin()
    )
  )
  with check (
    private.can_write_org(organization_id)
    or private.is_platform_admin()
  );

create policy "farms_soft_delete_admin"
  on public.farms
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
