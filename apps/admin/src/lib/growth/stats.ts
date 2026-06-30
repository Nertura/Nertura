import { createAdminClient } from '@/lib/supabase/admin';

export interface GrowthDashboardStats {
  newLeadsToday: number;
  emailsGenerated: number;
  pendingApprovals: number;
  scheduled: number;
  sentToday: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounceRate: number;
  spamScore: number;
  newUsers: number;
  appInstalls: number;
  premiumConversions: number;
  estimatedReach: number;
  globalCountriesActive: number;
}

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function getGrowthDashboardStats(): Promise<GrowthDashboardStats> {
  const admin = createAdminClient();
  const today = startOfToday();

  const [
    newLeadsRes,
    draftsRes,
    approvedRes,
    scheduledRes,
    sentTodayRes,
    deliveredRes,
    openedRes,
    clickedRes,
    bouncedRes,
    sentTotalRes,
    newUsersRes,
    premiumRes,
    leadsTotalRes,
    countriesRes,
    emailsTodayRes,
    complianceRes,
    contentDraftsRes,
  ] = await Promise.all([
    admin.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', today),
    admin.from('email_log').select('id', { count: 'exact', head: true }).eq('status', 'taslak'),
    admin.from('email_log').select('id', { count: 'exact', head: true }).eq('status', 'onaylandi'),
    admin
      .from('growth_scheduled_items')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'scheduled']),
    admin
      .from('email_log')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'sent')
      .gte('sent_at', today),
    admin
      .from('email_log')
      .select('id', { count: 'exact', head: true })
      .eq('delivery_status', 'delivered'),
    admin.from('email_log').select('id', { count: 'exact', head: true }).eq('opened', true),
    admin.from('email_log').select('id', { count: 'exact', head: true }).eq('clicked', true),
    admin.from('email_log').select('id', { count: 'exact', head: true }).eq('bounced', true),
    admin.from('email_log').select('id', { count: 'exact', head: true }).eq('status', 'sent'),
    admin.from('users').select('id', { count: 'exact', head: true }).gte('created_at', today).is('deleted_at', null),
    admin
      .from('credit_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('transaction_type', 'purchase')
      .gte('created_at', today),
    admin.from('leads').select('id', { count: 'exact', head: true }),
    admin.from('leads').select('country').not('country', 'is', null),
    admin.from('email_log').select('id', { count: 'exact', head: true }).gte('created_at', today),
    admin.from('growth_compliance_settings').select('global_spam_score').limit(1).maybeSingle(),
    admin.from('media_content_queue').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
  ]);

  const sentTotal = sentTotalRes.count ?? 0;
  const bounced = bouncedRes.count ?? 0;
  const uniqueCountries = new Set(
    (countriesRes.data ?? []).map((r) => r.country as string).filter(Boolean)
  );

  return {
    newLeadsToday: newLeadsRes.count ?? 0,
    emailsGenerated:
      (emailsTodayRes.count ?? 0) + (contentDraftsRes.count ?? 0) + (draftsRes.count ?? 0),
    pendingApprovals: (draftsRes.count ?? 0) + (approvedRes.count ?? 0),
    scheduled: scheduledRes.count ?? 0,
    sentToday: sentTodayRes.count ?? 0,
    delivered: deliveredRes.count ?? 0,
    opened: openedRes.count ?? 0,
    clicked: clickedRes.count ?? 0,
    bounceRate: sentTotal > 0 ? Math.round((bounced / sentTotal) * 1000) / 10 : 0,
    spamScore: Number(complianceRes.data?.global_spam_score ?? 0),
    newUsers: newUsersRes.count ?? 0,
    appInstalls: newUsersRes.count ?? 0,
    premiumConversions: premiumRes.count ?? 0,
    estimatedReach: leadsTotalRes.count ?? 0,
    globalCountriesActive: uniqueCountries.size,
  };
}
