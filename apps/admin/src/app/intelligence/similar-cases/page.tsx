import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDataList } from '@/components/admin-data-list';

export default async function SimilarCasesPage() {
  let rows: Array<{ id: string; date: string; score: string; reason: string; from: string; to: string }> =
    [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('similar_cases')
      .select('id, similarity_score, match_reason, created_at, memory_event_id, similar_memory_event_id')
      .order('created_at', { ascending: false })
      .limit(200);

    rows = (data ?? []).map((r) => ({
      id: r.id as string,
      date: new Date(r.created_at as string).toLocaleString(),
      score: `${Math.round(Number(r.similarity_score) * 100)}%`,
      reason: (r.match_reason as string | null) ?? '—',
      from: (r.memory_event_id as string).slice(0, 8),
      to: (r.similar_memory_event_id as string).slice(0, 8),
    }));
  } catch {
    rows = [];
  }

  return (
    <AdminDataList
      title="Similar Cases"
      description="Linked memory events used as retrieval context for new questions."
      rows={rows}
      searchKeys={['reason']}
      columns={[
        { key: 'date', header: 'Date' },
        { key: 'score', header: 'Score' },
        { key: 'reason', header: 'Match' },
        { key: 'from', header: 'Event' },
        { key: 'to', header: 'Similar' },
      ]}
    />
  );
}
