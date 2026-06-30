import { NextResponse } from 'next/server';

import { listProviders } from '@/lib/growth/providers';

export async function GET() {
  try {
    const providers = await listProviders();
    return NextResponse.json({ providers });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list providers';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
