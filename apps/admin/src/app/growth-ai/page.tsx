import { GrowthDashboardClient } from '@/components/growth/growth-dashboard-client';
import { getGrowthDashboardStats, type GrowthDashboardStats } from '@/lib/growth/stats';
import { syncResendProviderFromEnv } from '@/lib/growth/providers';

const EMPTY_STATS: GrowthDashboardStats = {
  newLeadsToday: 0,
  emailsGenerated: 0,
  pendingApprovals: 0,
  scheduled: 0,
  sentToday: 0,
  delivered: 0,
  opened: 0,
  clicked: 0,
  bounceRate: 0,
  spamScore: 0,
  newUsers: 0,
  appInstalls: 0,
  premiumConversions: 0,
  estimatedReach: 0,
  globalCountriesActive: 0,
};

export default async function GrowthAiDashboardPage() {
  let stats = EMPTY_STATS;

  try {
    await syncResendProviderFromEnv();
    stats = await getGrowthDashboardStats();
  } catch {
    stats = EMPTY_STATS;
  }

  return <GrowthDashboardClient stats={stats} />;
}
