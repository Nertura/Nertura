import { NextResponse } from 'next/server';

import { addLeadNote } from '@/lib/growth/leads';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const noteBody = String(body.body ?? '').trim();
    if (!noteBody) {
      return NextResponse.json({ error: 'Note body required' }, { status: 400 });
    }
    await addLeadNote(id, noteBody);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add note';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
