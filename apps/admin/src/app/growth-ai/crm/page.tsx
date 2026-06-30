import { CrmClient } from '@/components/growth/crm-client';
import { listLeads } from '@/lib/growth/leads';

export default async function CrmPage() {
  let leads: Awaited<ReturnType<typeof listLeads>> = [];
  try {
    leads = await listLeads({ limit: 500 });
  } catch {
    leads = [];
  }
  return <CrmClient leads={leads} />;
}
