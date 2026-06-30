'use client';

import { AdminDataList } from '@/components/admin-data-list';

interface AnalysisRow {
  id: string;
  question: string;
  diagnosis: string | null;
  source: string;
  created_at: string;
}

export function AnalysesAdminClient({ rows }: { rows: AnalysisRow[] }) {
  return (
    <AdminDataList
      title="AI Analizleri"
      description="Son AI doktor analizleri"
      rows={rows}
      searchPlaceholder="Search question or diagnosis…"
      searchKeys={['question', 'diagnosis', 'source']}
      emptyMessage="Henüz analiz yok."
      columns={[
        {
          key: 'question',
          header: 'Question',
          render: (r) => <span className="font-medium">{r.question.slice(0, 100)}</span>,
        },
        {
          key: 'diagnosis',
          header: 'Diagnosis',
          render: (r) => r.diagnosis?.slice(0, 120) ?? '—',
          className: 'text-muted-foreground',
        },
        { key: 'source', header: 'Source', render: (r) => r.source },
        {
          key: 'created',
          header: 'Time',
          render: (r) => new Date(r.created_at).toLocaleString('tr-TR'),
        },
      ]}
    />
  );
}
