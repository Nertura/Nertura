import { NextResponse } from 'next/server';
import { z } from 'zod';

import { FEEDBACK_TYPE_VALUES } from '@nertura/ai';

import { getDashboardContext } from '@/lib/auth/context';
import { saveFeedback } from '@/lib/ai/intelligence-persistence';
import { createClient } from '@/lib/supabase/server';

const bodySchema = z.object({
  analysisId: z.string().uuid(),
  memoryEventId: z.string().uuid().optional(),
  feedbackType: z.enum(FEEDBACK_TYPE_VALUES),
  comment: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  try {
    const ctx = await getDashboardContext();
    const body = bodySchema.parse(await request.json());
    const supabase = await createClient();

    const { data: analysis } = await supabase
      .from('ai_analyses')
      .select('id, user_id')
      .eq('id', body.analysisId)
      .maybeSingle();

    if (!analysis || analysis.user_id !== ctx.userId) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    const feedbackId = await saveFeedback(supabase, {
      analysisId: body.analysisId,
      memoryEventId: body.memoryEventId ?? null,
      userId: ctx.userId,
      feedbackType: body.feedbackType,
      comment: body.comment ?? null,
    });

    return NextResponse.json({ success: true, feedbackId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Feedback failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
