import { NextResponse } from 'next/server';

import { runKnowledgeIngestionPipeline } from '@nertura/knowledge-ingestion';

import { createAdminClient } from '@/lib/supabase/admin';

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

/** Daily knowledge ingestion — collect, normalize, summarize, queue for review. Never auto-approves. */
export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const url = new URL(request.url);
    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');

    const result = await runKnowledgeIngestionPipeline(admin, {
      triggerType: 'cron',
      latitude: lat ? Number(lat) : null,
      longitude: lon ? Number(lon) : null,
      maxPerSource: 5,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ingestion cron failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
