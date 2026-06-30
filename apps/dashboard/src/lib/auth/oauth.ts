import { getBrowserDashboardContext, sanitizeInternalPath } from '@nertura/utils';

import { AUTH_ROUTES, getAuthCallbackUrl } from '@/lib/auth/constants';
import { createClient } from '@/lib/supabase/client';

export type OAuthProvider = 'google' | 'apple';

export async function signInWithOAuthProvider(
  provider: OAuthProvider,
  next = '/doctor'
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const context = getBrowserDashboardContext();
  const safeNext = sanitizeInternalPath(next, '/doctor', context);

  const options: {
    redirectTo: string;
    scopes?: string;
    queryParams?: Record<string, string>;
  } = {
    redirectTo: getAuthCallbackUrl(safeNext, context),
  };

  if (provider === 'apple') {
    options.scopes = 'name email';
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options,
  });

  return { error: error?.message ?? null };
}

export const AUTH_EMAIL_ROUTE = AUTH_ROUTES.magicLink;
export const AUTH_PHONE_ROUTE = AUTH_ROUTES.phoneLogin;
