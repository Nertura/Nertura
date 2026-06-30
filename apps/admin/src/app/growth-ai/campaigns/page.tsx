import { CampaignsClient } from '@/components/growth/campaigns-client';
import { listCampaigns } from '@/lib/growth/campaigns';

export default async function CampaignsPage() {
  let campaigns: Awaited<ReturnType<typeof listCampaigns>> = [];
  try {
    campaigns = await listCampaigns();
  } catch {
    campaigns = [];
  }
  return <CampaignsClient campaigns={campaigns} />;
}
