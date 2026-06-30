import { createAdminClient } from '@/lib/supabase/admin';
import { OrganizationsAdminClient } from '@/components/organizations-admin-client';

export default async function OrganizationsPage() {
  let rows: { id: string; name: string; slug: string; created_at: string }[] = [];
  let configError = false;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('organizations')
      .select('id, name, slug, created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(200);
    rows = data ?? [];
  } catch {
    configError = true;
  }

  return <OrganizationsAdminClient rows={rows} configError={configError} />;
}
