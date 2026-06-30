'use client';

import { AdminDataList } from '@/components/admin-data-list';

interface UserRow {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

export function UsersAdminClient({ rows, configError }: { rows: UserRow[]; configError?: boolean }) {
  return (
    <>
      {configError && (
        <p className="mb-4 text-sm text-amber-700">
          Supabase service role key required — user list could not be loaded.
        </p>
      )}
      <AdminDataList
        title="Kullanıcılar"
        description="Kullanıcı yönetimi, roller ve erişim kontrolü"
        rows={rows}
        searchPlaceholder="Search by email…"
        searchKeys={['email', 'status']}
        emptyMessage="Henüz kayıtlı kullanıcı yok."
        columns={[
          { key: 'email', header: 'Email', render: (r) => <span className="font-medium">{r.email}</span> },
          { key: 'status', header: 'Status', render: (r) => r.status },
          {
            key: 'created',
            header: 'Created',
            render: (r) => new Date(r.created_at).toLocaleString('tr-TR'),
          },
        ]}
      />
    </>
  );
}
