import { createAdminClient } from '@/lib/supabase/admin';

export default async function UsagePage() {
  let userRows: {
    user_id: string;
    question_count: number;
    free_limit: number;
    credits_balance: number;
    updated_at: string;
  }[] = [];
  let guestRows: {
    guest_id: string;
    question_count: number;
    free_limit: number;
    last_question_at: string | null;
  }[] = [];
  let configError = false;

  try {
    const admin = createAdminClient();
    const [usersRes, guestsRes] = await Promise.all([
      admin
        .from('user_usage_limits')
        .select('user_id, question_count, free_limit, credits_balance, updated_at')
        .order('updated_at', { ascending: false })
        .limit(50),
      admin
        .from('guest_usage')
        .select('guest_id, question_count, free_limit, last_question_at')
        .order('last_question_at', { ascending: false })
        .limit(50),
    ]);
    userRows = usersRes.data ?? [];
    guestRows = guestsRes.data ?? [];
  } catch {
    configError = true;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-void">Kullanım / Krediler</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Kayıtlı kullanıcılar: 10 ücretsiz soru · Misafirler: 3 soru · Kredi sistemi (ödeme TBD)
      </p>

      {configError && (
        <p className="mt-4 text-sm text-amber-700">
          Supabase service role key gerekli — kullanım verisi yüklenemedi.
        </p>
      )}

      <h2 className="mt-8 text-lg font-medium text-void">Registered users</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">User ID</th>
              <th className="px-4 py-3 font-medium">Questions</th>
              <th className="px-4 py-3 font-medium">Free limit</th>
              <th className="px-4 py-3 font-medium">Credits</th>
            </tr>
          </thead>
          <tbody>
            {userRows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Henüz kayıtlı kullanım yok.
                </td>
              </tr>
            )}
            {userRows.map((r) => (
              <tr key={r.user_id} className="border-b last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{r.user_id.slice(0, 8)}…</td>
                <td className="px-4 py-3">{r.question_count}</td>
                <td className="px-4 py-3">{r.free_limit}</td>
                <td className="px-4 py-3">{r.credits_balance ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 text-lg font-medium text-void">Guests</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Guest ID</th>
              <th className="px-4 py-3 font-medium">Questions</th>
              <th className="px-4 py-3 font-medium">Limit</th>
              <th className="px-4 py-3 font-medium">Last question</th>
            </tr>
          </thead>
          <tbody>
            {guestRows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Henüz misafir kullanımı yok.
                </td>
              </tr>
            )}
            {guestRows.map((r) => (
              <tr key={r.guest_id} className="border-b last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{r.guest_id.slice(0, 8)}…</td>
                <td className="px-4 py-3">{r.question_count}</td>
                <td className="px-4 py-3">{r.free_limit}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {r.last_question_at
                    ? new Date(r.last_question_at).toLocaleString('tr-TR')
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
