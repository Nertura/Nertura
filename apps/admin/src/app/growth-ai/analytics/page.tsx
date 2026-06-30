import { AnalyticsClient } from '@/components/growth/analytics-client';
import { getAnalyticsSummary } from '@/lib/growth/email-logs';

export default async function AnalyticsPage() {
  let data: Awaited<ReturnType<typeof getAnalyticsSummary>> = {
    openRate: 0,
    ctr: 0,
    sentTotal: 0,
    newUsersWeek: 0,
    campaignCount: 0,
    topCountries: [],
    topLanguages: [],
    topContent: [],
  };
  try {
    data = await getAnalyticsSummary();
  } catch {
    /* empty */
  }
  return <AnalyticsClient data={data} />;
}
