'use client';

import { AdminDataList } from '@/components/admin-data-list';

interface SecurityLogRow {
  id: string;
  action: string;
  actor_type: string;
  created_at: string;
}

export function SecurityLogsAdminClient({
  rows,
  configError,
}: {
  rows: SecurityLogRow[];
  configError?: boolean;
}) {
  return (
    <>
      {configError && (
        <p className="mb-4 text-sm text-amber-700">
          Supabase service role key required — security logs could not be loaded.
        </p>
      )}
      <AdminDataList
        title="Güvenlik Logları"
        description="Platform audit trail — kim, ne zaman, hangi işlem"
        rows={rows}
        searchPlaceholder="Search action…"
        searchKeys={['action', 'actor_type']}
        emptyMessage="Henüz güvenlik logu yok."
        columns={[
          { key: 'action', header: 'Action', render: (r) => r.action },
          { key: 'actor', header: 'Actor', render: (r) => r.actor_type },
          {
            key: 'time',
            header: 'Time',
            render: (r) => new Date(r.created_at).toLocaleString('tr-TR'),
          },
        ]}
      />
    </>
  );
}
