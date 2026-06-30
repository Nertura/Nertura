import { NextResponse } from 'next/server';

import { OutreachSendError, sendApprovedDrafts } from '@/lib/outreach/send-approved';

export async function POST() {
  try {
    const result = await sendApprovedDrafts();
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof OutreachSendError && err.code === 'NOT_CONFIGURED') {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    const message = err instanceof Error ? err.message : 'Send failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
