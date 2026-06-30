-- Nertura Phase 2: apply RLS policies (inlined for Supabase Cloud compatibility)
-- Source of truth copies: supabase/policies/*.sql

-- organizations
create policy "organizations_select_member"
  on public.organizations for select to authenticated
  using (deleted_at is null and (private.is_org_member(id) or private.is_platform_admin()));

create policy "organizations_insert_authenticated"
  on public.organizations for insert to authenticated
  with check (created_by = auth.uid() or private.is_platform_admin());

create policy "organizations_update_admin"
  on public.organizations for update to authenticated
  using (deleted_at is null and (private.can_admin_org(id) or private.is_platform_admin()))
  with check (private.can_admin_org(id) or private.is_platform_admin());

create policy "organizations_soft_delete_owner"
  on public.organizations for update to authenticated
  using (private.is_org_owner(id) or private.is_platform_admin())
  with check (private.is_org_owner(id) or private.is_platform_admin());

-- users
create policy "users_select_self"
  on public.users for select to authenticated
  using (deleted_at is null and (id = auth.uid() or private.is_platform_admin()));

create policy "users_select_org_admin"
  on public.users for select to authenticated
  using (
    deleted_at is null
    and exists (
      select 1 from public.memberships admin_m
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
  on public.users for insert to authenticated
  with check (id = auth.uid());

create policy "users_update_self"
  on public.users for update to authenticated
  using (id = auth.uid() and deleted_at is null)
  with check (id = auth.uid());

create policy "users_update_org_admin"
  on public.users for update to authenticated
  using (
    deleted_at is null
    and exists (
      select 1 from public.memberships admin_m
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
  on public.users for update to authenticated
  using (
    private.is_platform_admin()
    or exists (
      select 1 from public.memberships admin_m
      join public.memberships member_m
        on member_m.user_id = users.id
        and member_m.organization_id = admin_m.organization_id
      where admin_m.user_id = auth.uid()
        and admin_m.deleted_at is null
        and admin_m.role in ('owner', 'admin')
    )
  )
  with check (true);

-- memberships
create policy "memberships_select_member"
  on public.memberships for select to authenticated
  using (deleted_at is null and (private.is_org_member(organization_id) or private.is_platform_admin()));

create policy "memberships_insert_admin"
  on public.memberships for insert to authenticated
  with check (private.can_admin_org(organization_id) or private.is_platform_admin());

create policy "memberships_update_admin"
  on public.memberships for update to authenticated
  using (private.can_admin_org(organization_id) or private.is_platform_admin())
  with check (private.can_admin_org(organization_id) or private.is_platform_admin());

create policy "memberships_insert_bootstrap_owner"
  on public.memberships for insert to authenticated
  with check (
    user_id = auth.uid()
    and role = 'owner'
    and exists (
      select 1 from public.organizations o
      where o.id = organization_id
        and o.created_by = auth.uid()
        and o.deleted_at is null
    )
    and not exists (
      select 1 from public.memberships m
      where m.organization_id = memberships.organization_id
        and m.deleted_at is null
    )
  );

-- farms
create policy "farms_select_member"
  on public.farms for select to authenticated
  using (deleted_at is null and (private.is_org_member(organization_id) or private.is_platform_admin()));

create policy "farms_insert_operator"
  on public.farms for insert to authenticated
  with check (private.can_write_org(organization_id) or private.is_platform_admin());

create policy "farms_update_operator"
  on public.farms for update to authenticated
  using (deleted_at is null and (private.can_write_org(organization_id) or private.is_platform_admin()))
  with check (private.can_write_org(organization_id) or private.is_platform_admin());

create policy "farms_soft_delete_admin"
  on public.farms for update to authenticated
  using (private.can_admin_org(organization_id) or private.is_platform_admin())
  with check (private.can_admin_org(organization_id) or private.is_platform_admin());

-- fields
create policy "fields_select_member"
  on public.fields for select to authenticated
  using (deleted_at is null and (private.is_org_member(organization_id) or private.is_platform_admin()));

create policy "fields_insert_operator"
  on public.fields for insert to authenticated
  with check (private.can_write_org(organization_id) or private.is_platform_admin());

create policy "fields_update_operator"
  on public.fields for update to authenticated
  using (deleted_at is null and (private.can_write_org(organization_id) or private.is_platform_admin()))
  with check (private.can_write_org(organization_id) or private.is_platform_admin());

create policy "fields_soft_delete_admin"
  on public.fields for update to authenticated
  using (private.can_admin_org(organization_id) or private.is_platform_admin())
  with check (private.can_admin_org(organization_id) or private.is_platform_admin());

-- crops
create policy "crops_select_member"
  on public.crops for select to authenticated
  using (deleted_at is null and (private.is_org_member(organization_id) or private.is_platform_admin()));

create policy "crops_insert_operator"
  on public.crops for insert to authenticated
  with check (private.can_write_org(organization_id) or private.is_platform_admin());

create policy "crops_update_operator"
  on public.crops for update to authenticated
  using (deleted_at is null and (private.can_write_org(organization_id) or private.is_platform_admin()))
  with check (private.can_write_org(organization_id) or private.is_platform_admin());

create policy "crops_soft_delete_operator"
  on public.crops for update to authenticated
  using (private.can_write_org(organization_id) or private.is_platform_admin())
  with check (private.can_write_org(organization_id) or private.is_platform_admin());

-- subscriptions
create policy "subscriptions_select_finance"
  on public.subscriptions for select to authenticated
  using (
    deleted_at is null
    and (
      private.can_admin_org(organization_id)
      or private.is_org_owner(organization_id)
      or private.is_platform_admin()
    )
  );

-- ai_conversations
create policy "ai_conversations_select_own"
  on public.ai_conversations for select to authenticated
  using (deleted_at is null and (user_id = auth.uid() or private.is_platform_admin()));

create policy "ai_conversations_select_org_admin"
  on public.ai_conversations for select to authenticated
  using (deleted_at is null and private.can_admin_org(organization_id));

create policy "ai_conversations_insert_own"
  on public.ai_conversations for insert to authenticated
  with check (user_id = auth.uid() and private.is_org_member(organization_id));

create policy "ai_conversations_update_own"
  on public.ai_conversations for update to authenticated
  using (user_id = auth.uid() and deleted_at is null)
  with check (user_id = auth.uid());

-- audit_logs
create policy "audit_logs_select_platform_admin"
  on public.audit_logs for select to authenticated
  using (private.is_platform_admin());

create policy "audit_logs_select_org_admin"
  on public.audit_logs for select to authenticated
  using (organization_id is not null and private.can_admin_org(organization_id));

create policy "audit_logs_insert_authenticated"
  on public.audit_logs for insert to authenticated
  with check (user_id = auth.uid() or private.is_platform_admin());

create policy "audit_logs_insert_service"
  on public.audit_logs for insert to service_role
  with check (true);
