-- crops RLS policies

create policy "crops_select_member"
  on public.crops
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      private.is_org_member(organization_id)
      or private.is_platform_admin()
    )
  );

create policy "crops_insert_operator"
  on public.crops
  for insert
  to authenticated
  with check (
    private.can_write_org(organization_id)
    or private.is_platform_admin()
  );

create policy "crops_update_operator"
  on public.crops
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

create policy "crops_soft_delete_operator"
  on public.crops
  for update
  to authenticated
  using (
    private.can_write_org(organization_id)
    or private.is_platform_admin()
  )
  with check (
    private.can_write_org(organization_id)
    or private.is_platform_admin()
  );
