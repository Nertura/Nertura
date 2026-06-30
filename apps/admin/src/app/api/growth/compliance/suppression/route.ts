import { NextResponse } from 'next/server';

import { addToSuppressionList } from '@/lib/growth/compliance';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? '').trim();
    const reason = String(body.reason ?? 'Manual blacklist').trim();
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    await addToSuppressionList(email, reason);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add suppression';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
