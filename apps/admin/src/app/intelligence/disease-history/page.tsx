import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDataList } from '@/components/admin-data-list';

export default async function DiseaseHistoryAdminPage() {
  let rows: Array<{
    id: string;
    crop: string;
    disease: string;
    count: string;
    outcome: string;
    seen: string;
  }> = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('disease_history')
      .select('id, crop, disease, occurrence_count, last_outcome, last_seen_at')
      .order('last_seen_at', { ascending: false })
      .limit(300);

    rows = (data ?? []).map((r) => ({
      id: r.id as string,
      crop: r.crop as string,
      disease: (r.disease as string | null) ?? '—',
      count: String(r.occurrence_count),
      outcome: (r.last_outcome as string | null) ?? '—',
      seen: new Date(r.last_seen_at as string).toLocaleString(),
    }));
  } catch {
    rows = [];
  }

  return (
    <AdminDataList
      title="Disease History"
      description="Aggregated crop/disease ledger — occurrence counts and last reported outcomes."
      rows={rows}
      searchKeys={['crop', 'disease']}
      columns={[
        { key: 'crop', header: 'Crop' },
        { key: 'disease', header: 'Disease' },
        { key: 'count', header: 'Count' },
        { key: 'outcome', header: 'Last outcome' },
        { key: 'seen', header: 'Last seen' },
      ]}
    />
  );
}
