import { createAdminClient } from '@/lib/supabase/admin';
import { AnalysesAdminClient } from '@/components/analyses-admin-client';

export default async function AnalysesPage() {
  let rows: { id: string; question: string; diagnosis: string | null; source: string; created_at: string }[] = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('ai_analyses')
      .select('id, question, diagnosis, source, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    rows = data ?? [];
  } catch {
    rows = [];
  }

  return <AnalysesAdminClient rows={rows} />;
}
