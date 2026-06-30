import { createAdminClient } from '@/lib/supabase/admin';
import { AiLogsAdminClient } from '@/components/ai-logs-admin-client';

export default async function AiLogsPage() {
  let rows: {
    id: string;
    question: string;
    source: string;
    status: string;
    created_at: string;
  }[] = [];
  let configError = false;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('ai_analyses')
      .select('id, question, source, status, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    rows = data ?? [];
  } catch {
    configError = true;
  }

  return <AiLogsAdminClient rows={rows} configError={configError} />;
}
