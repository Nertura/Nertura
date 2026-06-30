import { NextResponse } from 'next/server';

import { parseFarmIntake } from '@nertura/ai';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: string };
    const text = body.text?.trim();
    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }
    const parsed = parseFarmIntake(text);
    return NextResponse.json({ parsed });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Parse failed' },
      { status: 500 }
    );
  }
}
