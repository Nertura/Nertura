import { createAdminClient } from '@/lib/supabase/admin';
import { ConversationsAdminClient } from '@/components/conversations-admin-client';

export default async function ConversationsPage() {
  let rows: {
    id: string;
    title: string | null;
    user_id: string | null;
    guest_id: string | null;
    updated_at: string;
  }[] = [];
  let configError = false;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('ai_conversations')
      .select('id, title, user_id, guest_id, updated_at')
      .order('updated_at', { ascending: false })
      .limit(200);
    rows = data ?? [];
  } catch {
    configError = true;
  }

  return <ConversationsAdminClient rows={rows} configError={configError} />;
}
