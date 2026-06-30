import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

import { resolveRequestOrigin, sanitizeInternalPath } from '@nertura/utils';

import { AUTH_ROUTES } from '@/lib/auth/constants';

async function userNeedsOnboarding(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_completed_at')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.onboarding_completed_at) return false;

  const { count } = await supabase
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('deleted_at', null);

  return !count || count === 0;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = resolveRequestOrigin(request);
  const code = searchParams.get('code');
  const next = sanitizeInternalPath(searchParams.get('next'), '/doctor', {
    hostname: new URL(origin).hostname,
    protocol: new URL(origin).protocol,
  });

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && (await userNeedsOnboarding(supabase, user.id))) {
        return NextResponse.redirect(`${origin}${AUTH_ROUTES.onboarding}`);
      }

      const dest = next === '/' || next === '/login' ? '/doctor' : next;
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
