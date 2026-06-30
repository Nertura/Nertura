import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDataList } from '@/components/admin-data-list';

export default async function ProviderOutputsPage() {
  let rows: Array<{
    id: string;
    date: string;
    provider: string;
    type: string;
    model: string;
    analysis: string;
  }> = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('ai_provider_outputs')
      .select('id, provider, model, request_type, created_at, analysis_id')
      .order('created_at', { ascending: false })
      .limit(300);

    rows = (data ?? []).map((r) => ({
      id: r.id as string,
      date: new Date(r.created_at as string).toLocaleString(),
      provider: r.provider as string,
      type: r.request_type as string,
      model: (r.model as string | null) ?? '—',
      analysis: (r.analysis_id as string | null)?.slice(0, 8) ?? '—',
    }));
  } catch {
    rows = [];
  }

  return (
    <AdminDataList
      title="Provider Outputs"
      description="Raw provider responses saved server-side (Gemini, synthesis). Keys never exposed."
      rows={rows}
      searchKeys={['provider', 'type', 'model']}
      columns={[
        { key: 'date', header: 'Date' },
        { key: 'provider', header: 'Provider' },
        { key: 'type', header: 'Type' },
        { key: 'model', header: 'Model' },
        { key: 'analysis', header: 'Analysis' },
      ]}
    />
  );
}
