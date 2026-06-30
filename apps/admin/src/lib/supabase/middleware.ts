import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { isPlatformAdmin } from '@/lib/auth/platform-admin';

const PUBLIC_PATHS = ['/login', '/auth/callback', '/unauthorized'];

function isCronPath(pathname: string, request: NextRequest): boolean {
  if (!pathname.startsWith('/api/cron/')) return false;
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function authDisabled(): boolean {
  if (process.env.NODE_ENV === 'production' && process.env.ADMIN_AUTH_DISABLED === 'true') {
    console.error('[admin middleware] ADMIN_AUTH_DISABLED is forbidden in production');
    return false;
  }
  return process.env.ADMIN_AUTH_DISABLED === 'true';
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (authDisabled()) {
    return NextResponse.next({ request });
  }

  if (isCronPath(pathname, request)) {
    return NextResponse.next({ request });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isPublicPath(pathname)) return NextResponse.next({ request });
    return new NextResponse('Admin auth not configured. Set Supabase keys or ADMIN_AUTH_DISABLED=true for local dev.', {
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
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = isPlatformAdmin(user) ? '/' : '/unauthorized';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (user && !isPublicPath(pathname) && !isPlatformAdmin(user)) {
    const url = request.nextUrl.clone();
    url.pathname = '/unauthorized';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
