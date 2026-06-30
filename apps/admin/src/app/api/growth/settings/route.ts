import { NextResponse } from 'next/server';

import { updateGrowthSettings } from '@/lib/growth/scheduler';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    await updateGrowthSettings(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
