import { createAdminClient } from '@/lib/supabase/admin';
import { UsersAdminClient } from '@/components/users-admin-client';

export default async function UsersPage() {
  let rows: { id: string; email: string; status: string; created_at: string }[] = [];
  let configError = false;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('users')
      .select('id, email, status, created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(200);
    rows = data ?? [];
  } catch {
    configError = true;
  }

  return <UsersAdminClient rows={rows} configError={configError} />;
}
