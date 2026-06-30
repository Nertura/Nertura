import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

import { resolveRequestOrigin } from '@nertura/utils';

export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const origin = resolveRequestOrigin(request);
  return NextResponse.redirect(new URL('/login', origin));
}

export async function POST(request: Request) {
  return GET(request);
}
