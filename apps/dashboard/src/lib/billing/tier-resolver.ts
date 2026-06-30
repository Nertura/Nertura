import type { SupabaseClient } from '@supabase/supabase-js';

export type BillingTier = 'free' | 'plus';

const PLUS_PLANS = new Set(['professional', 'business', 'enterprise']);
const ACTIVE_STATUSES = new Set(['trialing', 'active', 'past_due']);

export function planToSubscriptionTier(
  plan: string | null | undefined,
  status: string | null | undefined
): BillingTier {
  if (process.env.NEXT_PUBLIC_NERTURA_DEV_TIER === 'plus') return 'plus';
  if (plan && PLUS_PLANS.has(plan) && status && ACTIVE_STATUSES.has(status)) {
    return 'plus';
  }
  return 'free';
}

export async function fetchOrganizationTier(
  supabase: SupabaseClient,
  organizationId: string
): Promise<BillingTier> {
  if (process.env.NEXT_PUBLIC_NERTURA_DEV_TIER === 'plus') return 'plus';

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .in('status', ['trialing', 'active', 'past_due', 'paused'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return planToSubscriptionTier(sub?.plan as string | null, sub?.status as string | null);
}
