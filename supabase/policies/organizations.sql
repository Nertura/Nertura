-- organizations RLS policies
-- Pattern: members read; admin write; owner soft-delete; platform admin support read

create policy "organizations_select_member"
  on public.organizations
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      private.is_org_member(id)
      or private.is_platform_admin()
    )
  );

create policy "organizations_insert_authenticated"
  on public.organizations
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    or private.is_platform_admin()
  );

create policy "organizations_update_admin"
  on public.organizations
  for update
  to authenticated
  using (
    deleted_at is null
    and (
      private.can_admin_org(id)
      or private.is_platform_admin()
    )
  )
  with check (
    private.can_admin_org(id)
    or private.is_platform_admin()
  );

create policy "organizations_soft_delete_owner"
  on public.organizations
  for update
  to authenticated
  using (
    private.is_org_owner(id)
    or private.is_platform_admin()
  )
  with check (
    private.is_org_owner(id)
    or private.is_platform_admin()
  );
