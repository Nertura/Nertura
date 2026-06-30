'use client';

import { AdminDataList } from '@/components/admin-data-list';

interface TransactionRow {
  id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

export function TransactionsAdminClient({
  rows,
  configError,
}: {
  rows: TransactionRow[];
  configError?: boolean;
}) {
  return (
    <>
      {configError && (
        <p className="mb-4 text-sm text-amber-700">
          Supabase service role key required — transactions could not be loaded.
        </p>
      )}
      <AdminDataList
        title="Credit Transactions"
        description="Immutable ledger of all credit grants, purchases and AI debits"
        rows={rows}
        searchPlaceholder="Search user, type, description…"
        searchKeys={['user_id', 'transaction_type', 'description']}
        emptyMessage="No transactions yet."
        pageSize={25}
        columns={[
          {
            key: 'user',
            header: 'User',
            render: (r) => (
              <span className="font-mono text-xs">{r.user_id.slice(0, 8)}…</span>
            ),
          },
          { key: 'type', header: 'Type', render: (r) => r.transaction_type },
          {
            key: 'amount',
            header: 'Amount',
            render: (r) => (
              <span className={r.amount > 0 ? 'text-emerald-700' : 'text-void'}>
                {r.amount > 0 ? `+${r.amount}` : r.amount}
              </span>
            ),
          },
          { key: 'balance', header: 'Balance', render: (r) => r.balance_after },
          {
            key: 'desc',
            header: 'Description',
            render: (r) => r.description?.slice(0, 60) ?? '—',
            className: 'text-muted-foreground',
          },
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
