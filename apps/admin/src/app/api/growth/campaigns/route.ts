import { NextResponse } from 'next/server';

import { createCampaign, listCampaigns } from '@/lib/growth/campaigns';

export async function GET() {
  try {
    const campaigns = await listCampaigns();
    return NextResponse.json({ campaigns });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list campaigns';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Campaign name required' }, { status: 400 });
    }
    const id = await createCampaign({
      name,
      target_country: body.target_country,
      target_language: body.target_language,
      target_industry: body.target_industry,
      target_crop: body.target_crop,
      target_problem: body.target_problem,
    });
    return NextResponse.json({ id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create campaign';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
