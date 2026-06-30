import { NextResponse } from 'next/server';

import { getOAuthProviderStatus } from '@/lib/auth/oauth-providers';

export async function GET() {
  const providers = await getOAuthProviderStatus();
  return NextResponse.json(providers);
}
