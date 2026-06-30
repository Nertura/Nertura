import { NextResponse } from 'next/server';
import { z } from 'zod';

import { runKnowledgeIngestionPipeline } from '@nertura/knowledge-ingestion';

import { createAdminClient } from '@/lib/supabase/admin';

const bodySchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

/** Manual ingestion run (platform admin session). */
export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json().catch(() => ({})));
    const admin = createAdminClient();
    const result = await runKnowledgeIngestionPipeline(admin, {
      triggerType: 'manual',
      latitude: body.latitude,
      longitude: body.longitude,
      maxPerSource: 5,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Run failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
