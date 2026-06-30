'use client';

import { AdminDataList } from '@/components/admin-data-list';

interface OrgRow {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export function OrganizationsAdminClient({
  rows,
  configError,
}: {
  rows: OrgRow[];
  configError?: boolean;
}) {
  return (
    <>
      {configError && (
        <p className="mb-4 text-sm text-amber-700">
          Supabase service role key required — organization list could not be loaded.
        </p>
      )}
      <AdminDataList
        title="Organizasyonlar"
        description="Çiftlik, kooperatif ve şirket organizasyonları"
        rows={rows}
        searchPlaceholder="Search by name or slug…"
        searchKeys={['name', 'slug']}
        emptyMessage="Henüz organizasyon yok."
        columns={[
          { key: 'name', header: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
          { key: 'slug', header: 'Slug', render: (r) => r.slug },
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
