import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { FEEDBACK_TYPE_VALUES } from '@nertura/ai';

import { saveFeedback } from '@/lib/intelligence-persistence';
import { GUEST_ID_COOKIE } from '@/lib/guest-usage';
import { tryCreateAdminClient } from '@/lib/supabase/admin';

const bodySchema = z.object({
  analysisId: z.string().uuid(),
  memoryEventId: z.string().uuid().optional(),
  feedbackType: z.enum(FEEDBACK_TYPE_VALUES),
  comment: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  try {
    const admin = tryCreateAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Feedback unavailable' }, { status: 503 });
    }

    const cookieStore = await cookies();
    const guestId = cookieStore.get(GUEST_ID_COOKIE)?.value;
    if (!guestId) {
      return NextResponse.json({ error: 'Guest session required' }, { status: 401 });
    }

    const body = bodySchema.parse(await request.json());

    const { data: analysis } = await admin
      .from('ai_analyses')
      .select('id, guest_id')
      .eq('id', body.analysisId)
      .maybeSingle();

    if (!analysis || String(analysis.guest_id) !== guestId) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    const feedbackId = await saveFeedback(admin, {
      analysisId: body.analysisId,
      memoryEventId: body.memoryEventId ?? null,
      guestId,
      feedbackType: body.feedbackType,
      comment: body.comment ?? null,
    });

    return NextResponse.json({ success: true, feedbackId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Feedback failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
