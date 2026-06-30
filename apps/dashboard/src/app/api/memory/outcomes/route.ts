import { NextResponse } from 'next/server';
import { z } from 'zod';

import { OUTCOME_TYPE_VALUES } from '@nertura/ai';

import { getDashboardContext } from '@/lib/auth/context';
import { submitDiagnosisOutcome } from '@/lib/ai/memory-engine';
import { createClient } from '@/lib/supabase/server';

const bodySchema = z.object({
  diagnosisId: z.string().uuid(),
  outcome: z.enum(OUTCOME_TYPE_VALUES),
  daysSince: z.union([z.literal(7), z.literal(14), z.literal(30)]),
  notes: z.string().max(1000).optional(),
  memoryEventId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const ctx = await getDashboardContext();
    const body = bodySchema.parse(await request.json());
    const supabase = await createClient();

    const result = await submitDiagnosisOutcome(supabase, {
      diagnosisId: body.diagnosisId,
      userId: ctx.userId,
      outcome: body.outcome,
      daysSince: body.daysSince,
      notes: body.notes ?? null,
      memoryEventId: body.memoryEventId ?? null,
    });

    if (!result?.success) {
      return NextResponse.json({ error: result?.error ?? 'Failed to save outcome' }, { status: 400 });
    }

    return NextResponse.json({ success: true, outcomeId: result.outcome_id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Outcome save failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
