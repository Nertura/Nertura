import { NextResponse } from 'next/server';

import { testProvider } from '@/lib/growth/providers';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await testProvider(id);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Test failed';
    return NextResponse.json({ error: message, ok: false }, { status: 500 });
  }
}
