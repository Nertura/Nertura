import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDataList } from '@/components/admin-data-list';

export default async function WrongDiagnosesPage() {
  let rows: Array<{
    id: string;
    date: string;
    crop: string;
    diagnosis: string;
    status: string;
  }> = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('ai_memory_events')
      .select('id, crop, diagnosis, feedback_status, created_at')
      .eq('feedback_status', 'wrong_diagnosis')
      .order('created_at', { ascending: false })
      .limit(200);

    rows = (data ?? []).map((r) => ({
      id: r.id as string,
      date: new Date(r.created_at as string).toLocaleString(),
      crop: (r.crop as string | null) ?? '—',
      diagnosis: ((r.diagnosis as string | null) ?? '—').slice(0, 100),
      status: r.feedback_status as string,
    }));
  } catch {
    rows = [];
  }

  return (
    <AdminDataList
      title="Wrong Diagnoses"
      description="Cases users flagged as incorrect — prioritize for knowledge bank updates."
      rows={rows}
      emptyMessage="No wrong-diagnosis feedback yet."
      searchKeys={['crop', 'diagnosis']}
      columns={[
        { key: 'date', header: 'Date' },
        { key: 'crop', header: 'Crop' },
        { key: 'diagnosis', header: 'Diagnosis' },
        { key: 'status', header: 'Status' },
      ]}
    />
  );
}
