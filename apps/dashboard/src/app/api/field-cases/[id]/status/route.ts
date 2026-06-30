import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getDashboardContext } from '@/lib/auth/context';
import { appendCaseTimelineEvent } from '@/lib/projects-engine';
import { createClient } from '@/lib/supabase/server';

const bodySchema = z.object({
  action: z.enum(['monitor', 'resolve', 'reopen']),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ctx = await getDashboardContext();
    const supabase = await createClient();
    const body = bodySchema.parse(await request.json());

    const statusMap = {
      monitor: { status: 'monitoring' as const, progress: 'monitoring' as const },
      resolve: { status: 'resolved' as const, progress: 'closed' as const },
      reopen: { status: 'open' as const, progress: 'monitoring' as const },
    };
    const update = statusMap[body.action];

    const { data, error } = await supabase
      .from('field_cases')
      .update({
        status: update.status,
        progress: update.progress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', ctx.organizationId)
      .select('id, status, progress')
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Vaka bulunamadı' }, { status: 404 });
    }

    const eventTitle =
      body.action === 'monitor'
        ? 'Vaka takibe alındı'
        : body.action === 'resolve'
          ? 'Vaka çözüldü'
          : 'Vaka yeniden açıldı';

    await appendCaseTimelineEvent(supabase, {
      fieldCaseId: id,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      eventType: 'progress_updated',
      title: eventTitle,
      summary: null,
      refTable: 'field_cases',
      refId: id,
      metadata: { action: body.action, status: update.status, progress: update.progress },
    });

    try {
      await supabase.rpc('log_auth_event', {
        p_action: `case.${body.action}`,
        p_category: 'case',
        p_organization_id: ctx.organizationId,
        p_metadata: { field_case_id: id, status: update.status },
      });
    } catch {
      // optional audit RPC
    }

    return NextResponse.json({ case: data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Durum güncellenemedi' },
      { status: 400 }
    );
  }
}
