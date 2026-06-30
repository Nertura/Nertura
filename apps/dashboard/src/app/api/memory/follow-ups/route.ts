import { NextResponse } from 'next/server';

import { getDashboardContext } from '@/lib/auth/context';
import { getPendingFollowUps } from '@/lib/ai/memory-engine';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const ctx = await getDashboardContext();
    const supabase = await createClient();
    const followUps = await getPendingFollowUps(supabase, ctx.userId);
    return NextResponse.json({ followUps });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load follow-ups';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
