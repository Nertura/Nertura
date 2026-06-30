import { NextResponse } from 'next/server';

import { listDraftEmails } from '@/lib/outreach/db';

export async function GET() {
  try {
    const drafts = await listDraftEmails();
    return NextResponse.json({ drafts });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load drafts';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
