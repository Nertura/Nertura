import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/admin';
import { logGrowthAudit } from '@/lib/growth/compliance';

const ALLOWED = ['draft', 'approved', 'rejected', 'scheduled'] as const;

const bodySchema = z.object({
  status: z.enum(ALLOWED),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = bodySchema.parse(await request.json());
    const admin = createAdminClient();

    const { data: existing, error: fetchErr } = await admin
      .from('media_content_queue')
      .select('id, status')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!existing) {
      return NextResponse.json({ error: 'Content item not found' }, { status: 404 });
    }

    if (existing.status === 'published') {
      return NextResponse.json({ error: 'Published content cannot be changed' }, { status: 409 });
    }

    const { error } = await admin.from('media_content_queue').update({ status }).eq('id', id);

    if (error) throw error;

    await logGrowthAudit({
      action: `content_${status}`,
      entity_type: 'media_content_queue',
      entity_id: id,
      details: { previous_status: existing.status, new_status: status },
    });

    return NextResponse.json({ success: true, status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Update failed' },
      { status: 400 }
    );
  }
}
