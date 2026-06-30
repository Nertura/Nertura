import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDataList } from '@/components/admin-data-list';

export default async function FeedbackPage() {
  let rows: Array<{ id: string; date: string; type: string; comment: string; analysis: string }> = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('ai_feedback')
      .select('id, feedback_type, comment, analysis_id, created_at')
      .order('created_at', { ascending: false })
      .limit(300);

    rows = (data ?? []).map((r) => ({
      id: r.id as string,
      date: new Date(r.created_at as string).toLocaleString(),
      type: r.feedback_type as string,
      comment: (r.comment as string | null) ?? '—',
      analysis: (r.analysis_id as string).slice(0, 8),
    }));
  } catch {
    rows = [];
  }

  return (
    <AdminDataList
      title="Feedback"
      description="User feedback on AI answers — drives prompt and knowledge improvements."
      rows={rows}
      searchKeys={['type', 'comment']}
      columns={[
        { key: 'date', header: 'Date' },
        { key: 'type', header: 'Type' },
        { key: 'comment', header: 'Comment' },
        { key: 'analysis', header: 'Analysis' },
      ]}
    />
  );
}
