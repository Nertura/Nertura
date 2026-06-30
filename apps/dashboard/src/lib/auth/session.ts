import { redirect } from 'next/navigation';

import { AUTH_ROUTES } from '@/lib/auth/constants';
import { createClient } from '@/lib/supabase/server';

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }
  return user;
}

export async function needsOnboarding(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_completed_at')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.onboarding_completed_at) {
    return false;
  }

  const { count } = await supabase
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('deleted_at', null);

  return !count || count === 0;
}

export async function requireOnboardingComplete() {
  const user = await requireAuth();
  if (await needsOnboarding(user.id)) {
    redirect(AUTH_ROUTES.onboarding);
  }
  return user;
}

export async function requireOnboardingPending() {
  const user = await requireAuth();
  if (!(await needsOnboarding(user.id))) {
    redirect('/');
  }
  return user;
}
