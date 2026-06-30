import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDataList } from '@/components/admin-data-list';

export default async function KnowledgeGapsPage() {
  let rows: Array<{ id: string; date: string; question: string; source: string; conf: string }> = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('ai_analyses')
      .select('id, question, source, confidence, created_at')
      .or('source.eq.fallback,confidence.lt.0.55')
      .order('created_at', { ascending: false })
      .limit(200);

    rows = (data ?? []).map((r) => ({
      id: r.id as string,
      date: new Date(r.created_at as string).toLocaleString(),
      question: (r.question as string).slice(0, 100),
      source: r.source as string,
      conf: r.confidence != null ? `${Math.round(Number(r.confidence) * 100)}%` : '—',
    }));
  } catch {
    rows = [];
  }

  return (
    <AdminDataList
      title="Knowledge Gaps"
      description="Fallback or low-confidence answers — candidates for new knowledge_items."
      rows={rows}
      searchKeys={['question', 'source']}
      columns={[
        { key: 'date', header: 'Date' },
        { key: 'question', header: 'Question' },
        { key: 'source', header: 'Source' },
        { key: 'conf', header: 'Conf.' },
      ]}
    />
  );
}
