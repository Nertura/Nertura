import { LeadDiscoveryClient } from '@/components/growth/lead-discovery-client';
import { listLeads } from '@/lib/growth/leads';

export default async function LeadDiscoveryPage() {
  let leads: Awaited<ReturnType<typeof listLeads>> = [];
  try {
    leads = await listLeads({ limit: 200 });
  } catch {
    leads = [];
  }
  return <LeadDiscoveryClient initialLeads={leads} />;
}
