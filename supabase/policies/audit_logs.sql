-- audit_logs RLS policies
-- Append-only; platform admin full read; org owner/admin read own org

create policy "audit_logs_select_platform_admin"
  on public.audit_logs
  for select
  to authenticated
  using (private.is_platform_admin());

create policy "audit_logs_select_org_admin"
  on public.audit_logs
  for select
  to authenticated
  using (
    organization_id is not null
    and private.can_admin_org(organization_id)
  );

create policy "audit_logs_insert_authenticated"
  on public.audit_logs
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    or private.is_platform_admin()
  );

create policy "audit_logs_insert_service"
  on public.audit_logs
  for insert
  to service_role
  with check (true);

-- No UPDATE or DELETE policies — append-only enforced by trigger
