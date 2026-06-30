import { NextResponse } from 'next/server';

import { getDashboardContext } from '@/lib/auth/context';
import { loadCaseOverview, buildCaseTimeline } from '@/lib/projects-engine';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ctx = await getDashboardContext();
    const supabase = await createClient();

    const overview = await loadCaseOverview(supabase, ctx.organizationId, id);
    if (!overview) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const timeline = await buildCaseTimeline(supabase, id);

    return NextResponse.json({ overview, timeline });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to load case overview' },
      { status: 500 }
    );
  }
}
