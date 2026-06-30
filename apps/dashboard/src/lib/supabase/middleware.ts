import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { AUTH_ROUTES } from '@/lib/auth/constants';

const PUBLIC_PREFIXES = [
  AUTH_ROUTES.login,
  AUTH_ROUTES.register,
  AUTH_ROUTES.forgotPassword,
  AUTH_ROUTES.resetPassword,
  AUTH_ROUTES.magicLink,
  AUTH_ROUTES.phoneLogin,
  AUTH_ROUTES.callback,
  AUTH_ROUTES.signOut,
  '/api/auth',
  '/api/webhooks',
];

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith('/api/auth')) return true;
  if (pathname.startsWith('/api/webhooks')) return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isAuthPage(pathname: string): boolean {
  return (
    pathname === AUTH_ROUTES.login ||
    pathname === AUTH_ROUTES.register ||
    pathname === AUTH_ROUTES.forgotPassword ||
    pathname === AUTH_ROUTES.magicLink ||
    pathname === AUTH_ROUTES.phoneLogin
  );
}

async function userNeedsOnboarding(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<boolean> {
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

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const { pathname } = request.nextUrl;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isPublicPath(pathname)) {
      return NextResponse.next({ request });
    }
    console.error('[middleware] Missing Supabase public env vars');
    return new NextResponse('Server configuration error: Supabase credentials missing.', {
      status: 503,
    });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_ROUTES.login;
    if (pathname !== '/') {
      url.searchParams.set('next', pathname);
    }
    return NextResponse.redirect(url);
  }

  if (user) {
    const needsOnboarding = await userNeedsOnboarding(supabase, user.id);

    if (isAuthPage(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = needsOnboarding ? AUTH_ROUTES.onboarding : '/doctor';
      url.search = '';
      return NextResponse.redirect(url);
    }

    if (needsOnboarding && pathname !== AUTH_ROUTES.onboarding && !pathname.startsWith('/api/auth') && !pathname.startsWith('/api/onboarding')) {
      const url = request.nextUrl.clone();
      url.pathname = AUTH_ROUTES.onboarding;
      return NextResponse.redirect(url);
    }

    if (!needsOnboarding && pathname === AUTH_ROUTES.onboarding) {
      const url = request.nextUrl.clone();
      url.pathname = '/doctor';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
