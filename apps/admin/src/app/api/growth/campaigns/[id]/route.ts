import { NextResponse } from 'next/server';

import { duplicateCampaign, updateCampaignStatus } from '@/lib/growth/campaigns';
import { logGrowthAudit } from '@/lib/growth/compliance';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'duplicate') {
      const newId = await duplicateCampaign(id);
      return NextResponse.json({ id: newId });
    }

    if (body.status) {
      await updateCampaignStatus(id, body.status);
      await logGrowthAudit({
        action: `campaign_${body.status}`,
        entity_type: 'growth_campaigns',
        entity_id: id,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Invalid patch' }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
