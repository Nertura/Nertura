import { NextResponse } from 'next/server';

import { listLeads } from '@/lib/growth/leads';

export async function GET() {
  try {
    const leads = await listLeads({ limit: 500 });
    return NextResponse.json({ leads });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list leads';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
