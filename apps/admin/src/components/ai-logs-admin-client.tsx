'use client';

import { AdminDataList } from '@/components/admin-data-list';

interface AiLogRow {
  id: string;
  question: string;
  source: string;
  status: string;
  created_at: string;
}

export function AiLogsAdminClient({
  rows,
  configError,
}: {
  rows: AiLogRow[];
  configError?: boolean;
}) {
  return (
    <>
      {configError && (
        <p className="mb-4 text-sm text-amber-700">
          Supabase service role key required — AI logs could not be loaded.
        </p>
      )}
      <AdminDataList
        title="AI Logları"
        description="Ham model çıktıları ve pipeline logları (kaynak: gemini, knowledge_base, fallback)"
        rows={rows}
        searchPlaceholder="Search question or source…"
        searchKeys={['question', 'source', 'status']}
        emptyMessage="Henüz AI logu yok."
        columns={[
          {
            key: 'question',
            header: 'Question',
            render: (r) => <span className="font-medium">{r.question.slice(0, 100)}</span>,
          },
          { key: 'source', header: 'Source', render: (r) => r.source },
          { key: 'status', header: 'Status', render: (r) => r.status },
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
