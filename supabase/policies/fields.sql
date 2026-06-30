-- fields RLS policies

create policy "fields_select_member"
  on public.fields
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      private.is_org_member(organization_id)
      or private.is_platform_admin()
    )
  );

create policy "fields_insert_operator"
  on public.fields
  for insert
  to authenticated
  with check (
    private.can_write_org(organization_id)
    or private.is_platform_admin()
  );

create policy "fields_update_operator"
  on public.fields
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

create policy "fields_soft_delete_admin"
  on public.fields
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
