-- users RLS policies
-- Self read/write; org admins read/update members in their org

create policy "users_select_self"
  on public.users
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      id = auth.uid()
      or private.is_platform_admin()
    )
  );

create policy "users_select_org_admin"
  on public.users
  for select
  to authenticated
  using (
    deleted_at is null
    and exists (
      select 1
      from public.memberships admin_m
      join public.memberships member_m
        on member_m.user_id = users.id
        and member_m.organization_id = admin_m.organization_id
        and member_m.deleted_at is null
      where admin_m.user_id = auth.uid()
        and admin_m.deleted_at is null
        and admin_m.role in ('owner', 'admin')
    )
  );

create policy "users_insert_self"
  on public.users
  for insert
  to authenticated
  with check (id = auth.uid());

create policy "users_update_self"
  on public.users
  for update
  to authenticated
  using (
    id = auth.uid()
    and deleted_at is null
  )
  with check (id = auth.uid());

create policy "users_update_org_admin"
  on public.users
  for update
  to authenticated
  using (
    deleted_at is null
    and exists (
      select 1
      from public.memberships admin_m
      join public.memberships member_m
        on member_m.user_id = users.id
        and member_m.organization_id = admin_m.organization_id
        and member_m.deleted_at is null
      where admin_m.user_id = auth.uid()
        and admin_m.deleted_at is null
        and admin_m.role in ('owner', 'admin')
    )
  )
  with check (true);

create policy "users_soft_delete_admin"
  on public.users
  for update
  to authenticated
  using (
    private.is_platform_admin()
    or exists (
      select 1
      from public.memberships admin_m
      join public.memberships member_m
        on member_m.user_id = users.id
        and member_m.organization_id = admin_m.organization_id
      where admin_m.user_id = auth.uid()
        and admin_m.deleted_at is null
        and admin_m.role in ('owner', 'admin')
    )
  )
  with check (true);
