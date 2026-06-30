import { NextResponse } from 'next/server';

import { getUserUsage } from '@/lib/ai/usage-limits';
import { getDashboardContext } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const ctx = await getDashboardContext();
    const supabase = await createClient();

    const { data: conversations } = await supabase
      .from('ai_conversations')
      .select('id, title, updated_at')
      .eq('user_id', ctx.userId)
      .order('updated_at', { ascending: false })
      .limit(50);

    const usage = await getUserUsage(supabase, ctx.userId, ctx.organizationId);

    return NextResponse.json({
      conversations: conversations ?? [],
      usage,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load conversations';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
