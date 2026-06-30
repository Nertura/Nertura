import type { SupabaseClient } from '@supabase/supabase-js';

import type { DashboardLocale } from './dashboard-copy';

export type { DashboardLocale };

export async function getUserLocale(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardLocale> {
  const { data } = await supabase
    .from('users')
    .select('language')
    .eq('id', userId)
    .maybeSingle();

  return data?.language === 'en' ? 'en' : 'tr';
}
