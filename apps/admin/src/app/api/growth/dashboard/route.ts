import { NextResponse } from 'next/server';

import { getGrowthDashboardStats } from '@/lib/growth/stats';

export async function GET() {
  try {
    const stats = await getGrowthDashboardStats();
    return NextResponse.json({ stats });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load stats';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
