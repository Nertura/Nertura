import { NextResponse } from 'next/server';

import { LEAD_DISCOVERY_CATEGORIES } from '@/lib/growth/discovery-categories';
import { logGrowthAudit } from '@/lib/growth/compliance';
import { createAdminClient } from '@/lib/supabase/admin';
import { runFindLeads, runGenerateDrafts } from '@/lib/outreach/pipeline';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const categoryId = body.category as string | undefined;
    const category = LEAD_DISCOVERY_CATEGORIES.find((c) => c.id === categoryId);
    const sector =
      (body.sector as string | undefined)?.trim() ||
      category?.sector ||
      process.env.OUTREACH_DEFAULT_SECTOR ||
      'sera';

    const result = await runFindLeads(sector);

    const admin = createAdminClient();
    if (category) {
      await admin
        .from('leads')
        .update({ category: category.label })
        .eq('source', 'web_search')
        .is('category', null);
    }

    await logGrowthAudit({
      action: 'lead_discovery',
      entity_type: 'leads',
      details: { sector, category: category?.label, ...result },
    });

    if (body.generateDrafts) {
      await runGenerateDrafts();
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Discovery failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
