import { NextResponse } from 'next/server';
import { z } from 'zod';

import { updateEmailDraft } from '@/lib/outreach/db';

const bodySchema = z.object({
  subject: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(10000).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = bodySchema.parse(await request.json());
    await updateEmailDraft(id, body, { requireStatus: 'taslak' });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    const status = message.includes('not found') || message.includes('Only taslak') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await updateEmailDraft(id, { status: 'onaylandi' }, { requireStatus: 'taslak' });
    return NextResponse.json({ success: true, status: 'onaylandi' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Approve failed';
    const status = message.includes('not found') || message.includes('Only taslak') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await updateEmailDraft(id, { status: 'reddedildi' }, { requireStatus: 'taslak' });
    return NextResponse.json({ success: true, status: 'reddedildi' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Reject failed';
    const status = message.includes('not found') || message.includes('Only taslak') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
