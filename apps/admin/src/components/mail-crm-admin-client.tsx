'use client';

import { AdminDataList } from '@/components/admin-data-list';

interface MailCrmRow {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

export function MailCrmAdminClient({
  rows,
  configError,
}: {
  rows: MailCrmRow[];
  configError?: boolean;
}) {
  return (
    <>
      {configError && (
        <p className="mb-4 text-sm text-amber-700">
          Supabase service role key required — user list could not be loaded.
        </p>
      )}
      <AdminDataList
        title="Mail / CRM"
        description="Registered users — foundation for email campaigns and segmentation"
        rows={rows}
        searchPlaceholder="Search by email…"
        searchKeys={['email', 'status']}
        emptyMessage="Henüz kayıtlı kullanıcı yok."
        columns={[
          { key: 'email', header: 'Email', render: (r) => <span className="font-medium">{r.email}</span> },
          { key: 'status', header: 'Status', render: (r) => r.status },
          {
            key: 'created',
            header: 'Joined',
            render: (r) => new Date(r.created_at).toLocaleString('tr-TR'),
          },
        ]}
      />
    </>
  );
}
