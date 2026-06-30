-- ai_conversations RLS policies
-- Users read/write own conversations; org admins read all org conversations

create policy "ai_conversations_select_own"
  on public.ai_conversations
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      user_id = auth.uid()
      or private.is_platform_admin()
    )
  );

create policy "ai_conversations_select_org_admin"
  on public.ai_conversations
  for select
  to authenticated
  using (
    deleted_at is null
    and private.can_admin_org(organization_id)
  );

create policy "ai_conversations_insert_own"
  on public.ai_conversations
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and private.is_org_member(organization_id)
  );

create policy "ai_conversations_update_own"
  on public.ai_conversations
  for update
  to authenticated
  using (
    user_id = auth.uid()
    and deleted_at is null
  )
  with check (user_id = auth.uid());

-- Brain / service role inserts via service_role (bypasses RLS)
