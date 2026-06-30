'use client';

import { AdminDataList } from '@/components/admin-data-list';

interface ConversationRow {
  id: string;
  title: string | null;
  user_id: string | null;
  guest_id: string | null;
  updated_at: string;
}

export function ConversationsAdminClient({
  rows,
  configError,
}: {
  rows: ConversationRow[];
  configError?: boolean;
}) {
  return (
    <>
      {configError && (
        <p className="mb-4 text-sm text-amber-700">
          Supabase service role key required — conversations could not be loaded.
        </p>
      )}
      <AdminDataList
        title="Konuşmalar"
        description="AI Tarım Doktoru konuşma izleme ve moderasyon"
        rows={rows}
        searchPlaceholder="Search by title…"
        searchKeys={['title']}
        emptyMessage="Henüz konuşma yok."
        columns={[
          {
            key: 'title',
            header: 'Title',
            render: (r) => r.title?.slice(0, 80) ?? 'Untitled',
          },
          {
            key: 'actor',
            header: 'User / Guest',
            render: (r) =>
              r.user_id
                ? `user:${r.user_id.slice(0, 8)}…`
                : r.guest_id
                  ? `guest:${r.guest_id.slice(0, 8)}…`
                  : '—',
            className: 'font-mono text-xs text-muted-foreground',
          },
          {
            key: 'updated',
            header: 'Updated',
            render: (r) => new Date(r.updated_at).toLocaleString('tr-TR'),
          },
        ]}
      />
    </>
  );
}
