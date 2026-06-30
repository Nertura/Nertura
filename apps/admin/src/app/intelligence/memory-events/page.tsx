import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDataList } from '@/components/admin-data-list';

export default async function MemoryEventsPage() {
  let rows: Array<{
    id: string;
    created: string;
    intent: string;
    crop: string;
    disease: string;
    diagnosis: string;
    conf: string;
    feedback: string;
    lang: string;
  }> = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('ai_memory_events')
      .select('id, intent, crop, disease, diagnosis, confidence, feedback_status, language, created_at')
      .order('created_at', { ascending: false })
      .limit(300);

    rows = (data ?? []).map((r) => ({
      id: r.id as string,
      created: new Date(r.created_at as string).toLocaleString(),
      intent: r.intent as string,
      crop: (r.crop as string | null) ?? '—',
      disease: (r.disease as string | null) ?? '—',
      diagnosis: ((r.diagnosis as string | null) ?? '—').slice(0, 80),
      conf: r.confidence != null ? `${Math.round(Number(r.confidence) * 100)}%` : '—',
      feedback: r.feedback_status as string,
      lang: r.language as string,
    }));
  } catch {
    rows = [];
  }

  return (
    <AdminDataList
      title="Memory Events"
      description="Structured learning events — intent, crop, diagnosis, confidence, feedback status."
      rows={rows}
      searchKeys={['intent', 'crop', 'disease', 'diagnosis']}
      searchPlaceholder="Search intent, crop, diagnosis…"
      columns={[
        { key: 'created', header: 'Date' },
        { key: 'intent', header: 'Intent' },
        { key: 'crop', header: 'Crop' },
        { key: 'disease', header: 'Disease' },
        { key: 'diagnosis', header: 'Diagnosis', className: 'max-w-xs truncate' },
        { key: 'conf', header: 'Conf.' },
        { key: 'feedback', header: 'Feedback' },
        { key: 'lang', header: 'Lang' },
      ]}
    />
  );
}
