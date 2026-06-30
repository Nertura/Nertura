import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@nertura/ui';

import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminHomePage() {
  const stats = {
    users: 0,
    guestQuestionsToday: 0,
    memberQuestionsToday: 0,
    creditsSold: 0,
    activeUsersWeek: 0,
  };
  let configError = false;

  try {
    const admin = createAdminClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [usersRes, guestRes, txRes, analysesRes] = await Promise.all([
      admin.from('users').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      admin
        .from('guest_usage')
        .select('question_count')
        .gte('last_question_at', today.toISOString()),
      admin
        .from('credit_transactions')
        .select('amount')
        .eq('transaction_type', 'purchase')
        .gte('created_at', weekAgo.toISOString()),
      admin
        .from('ai_analyses')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString()),
    ]);

    stats.users = usersRes.count ?? 0;
    stats.memberQuestionsToday = analysesRes.count ?? 0;
    stats.guestQuestionsToday = (guestRes.data ?? []).reduce(
      (sum, r) => sum + (r.question_count ?? 0),
      0
    );
    stats.creditsSold = (txRes.data ?? []).reduce((sum, r) => sum + (r.amount ?? 0), 0);

    const { count: activeCount } = await admin
      .from('credit_transactions')
      .select('user_id', { count: 'exact', head: true })
      .eq('transaction_type', 'ai_question')
      .gte('created_at', weekAgo.toISOString());

    stats.activeUsersWeek = activeCount ?? 0;
  } catch {
    configError = true;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-void">Kontrol Merkezi</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Nertura AI Tarım Doktoru — platform özeti
      </p>

      {configError && (
        <p className="mt-4 text-sm text-amber-700">
          Supabase service role key required for live stats.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total users</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-void">{stats.users}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Questions today</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-void">
            {stats.memberQuestionsToday}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Credits sold (7d)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-void">{stats.creditsSold}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active users (7d)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-void">{stats.activeUsersWeek}</CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bilgi Bankası</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Link href="/knowledge" className="text-signal underline">
              Manage knowledge
            </Link>{' '}
            ·{' '}
            <Link href="/import" className="text-signal underline">
              Import data
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Credits & usage</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Link href="/usage" className="text-signal underline">
              Usage dashboard
            </Link>{' '}
            ·{' '}
            <Link href="/transactions" className="text-signal underline">
              Transactions
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI monitoring</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Link href="/analyses" className="text-signal underline">
              Analyses
            </Link>{' '}
            ·{' '}
            <Link href="/conversations" className="text-signal underline">
              Conversations
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
