import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDataList } from '@/components/admin-data-list';

export default async function OutcomesPage() {
  let rows: Array<{
    id: string;
    date: string;
    days: string;
    crop: string;
    disease: string;
    outcome: string;
    conf: string;
    notes: string;
  }> = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('diagnosis_outcomes')
      .select('id, crop, disease, outcome, days_since, confidence, notes, created_at')
      .order('created_at', { ascending: false })
      .limit(300);

    rows = (data ?? []).map((r) => ({
      id: r.id as string,
      date: new Date(r.created_at as string).toLocaleString(),
      days: String(r.days_since),
      crop: (r.crop as string | null) ?? '—',
      disease: (r.disease as string | null) ?? '—',
      outcome: r.outcome as string,
      conf: r.confidence != null ? `${Math.round(Number(r.confidence) * 100)}%` : '—',
      notes: ((r.notes as string | null) ?? '—').slice(0, 60),
    }));
  } catch {
    rows = [];
  }

  return (
    <AdminDataList
      title="Diagnosis Outcomes"
      description="7 / 14 / 30-day follow-up results — powers confidence scoring and treatment success analysis."
      rows={rows}
      searchKeys={['crop', 'disease', 'outcome']}
      columns={[
        { key: 'date', header: 'Date' },
        { key: 'days', header: 'Days' },
        { key: 'crop', header: 'Crop' },
        { key: 'disease', header: 'Disease' },
        { key: 'outcome', header: 'Outcome' },
        { key: 'conf', header: 'Conf.' },
        { key: 'notes', header: 'Notes' },
      ]}
    />
  );
}
