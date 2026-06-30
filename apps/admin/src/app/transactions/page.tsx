import { createAdminClient } from '@/lib/supabase/admin';
import { TransactionsAdminClient } from '@/components/transactions-admin-client';

export default async function TransactionsPage() {
  let rows: {
    id: string;
    user_id: string;
    amount: number;
    balance_after: number;
    transaction_type: string;
    description: string | null;
    created_at: string;
  }[] = [];
  let configError = false;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('credit_transactions')
      .select('id, user_id, amount, balance_after, transaction_type, description, created_at')
      .order('created_at', { ascending: false })
      .limit(500);
    rows = data ?? [];
  } catch {
    configError = true;
  }

  return <TransactionsAdminClient rows={rows} configError={configError} />;
}
