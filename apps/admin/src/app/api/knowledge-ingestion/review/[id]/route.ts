import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  approveReviewItem,
  markReviewNeedsExpert,
  rejectReviewItem,
} from '@nertura/knowledge-ingestion';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const actionSchema = z.object({
  action: z.enum(['approve', 'reject', 'needs_expert']),
  notes: z.string().max(4000).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = actionSchema.parse(await request.json());
    const admin = createAdminClient();

    let reviewerId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      reviewerId = user?.id ?? null;
    } catch {
      /* service role path */
    }

    if (body.action === 'approve') {
      const result = await approveReviewItem(admin, id, reviewerId);
      return NextResponse.json({ ok: true, ...result });
    }

    if (body.action === 'reject') {
      await rejectReviewItem(admin, id, body.notes, reviewerId);
      return NextResponse.json({ ok: true });
    }

    await markReviewNeedsExpert(admin, id, body.notes);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Review action failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('knowledge_review_queue')
    .select('*, knowledge_ingestion_items(*, knowledge_sources(name))')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data: citations } = await admin
    .from('knowledge_citations')
    .select('*')
    .eq('ingestion_item_id', data.item_id);

  return NextResponse.json({ review: data, citations: citations ?? [] });
}
