import { NextResponse } from 'next/server';

import { getUserUsage } from '@/lib/ai/usage-limits';
import { getDashboardContext } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const ctx = await getDashboardContext();
    const supabase = await createClient();
    const usage = await getUserUsage(supabase, ctx.userId, ctx.organizationId);

    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('slug, name, monthly_questions, monthly_credits, price_cents')
      .eq('slug', 'free')
      .maybeSingle();

    return NextResponse.json({
      usage,
      plan: plan ?? { slug: 'free', name: 'Free', monthly_questions: 10 },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load usage';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
