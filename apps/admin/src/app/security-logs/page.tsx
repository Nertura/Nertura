import { createAdminClient } from '@/lib/supabase/admin';
import { SecurityLogsAdminClient } from '@/components/security-logs-admin-client';

export default async function SecurityLogsPage() {
  let rows: {
    id: string;
    action: string;
    actor_type: string;
    created_at: string;
  }[] = [];
  let configError = false;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('audit_logs')
      .select('id, action, actor_type, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    rows = (data ?? []).map((r) => ({
      id: r.id,
      action: r.action,
      actor_type: (r as { actor_type?: string }).actor_type ?? 'system',
      created_at: r.created_at,
    }));
  } catch {
    configError = true;
  }

  return <SecurityLogsAdminClient rows={rows} configError={configError} />;
}
