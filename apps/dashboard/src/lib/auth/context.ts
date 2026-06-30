import { redirect } from 'next/navigation';

import { requireOnboardingComplete } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

import { fetchOrganizationTier } from '@/lib/billing/tier-resolver';
import type { SubscriptionTier } from '@/lib/navigation-tier';

export interface DashboardContext {
  userId: string;
  email: string;
  organizationId: string;
  organizationName: string;
  role: string;
  canWrite: boolean;
  canAdmin: boolean;
  tier: SubscriptionTier;
}

export async function getDashboardContext(): Promise<DashboardContext> {
  const user = await requireOnboardingComplete();
  const supabase = await createClient();

  const { data: membership, error } = await supabase
    .from('memberships')
    .select('role, organization_id, organizations(id, name)')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle();

  if (error || !membership) {
    redirect('/onboarding');
  }

  const orgRaw = membership.organizations;
  const org = (Array.isArray(orgRaw) ? orgRaw[0] : orgRaw) as { id: string; name: string } | null;

  if (!org) {
    redirect('/onboarding');
  }

  const role = membership.role as string;
  const writeRoles = ['owner', 'admin', 'manager', 'operator'];
  const tier = await fetchOrganizationTier(supabase, membership.organization_id);

  return {
    userId: user.id,
    email: user.email ?? '',
    organizationId: membership.organization_id,
    organizationName: org.name,
    role,
    canWrite: writeRoles.includes(role),
    canAdmin: ['owner', 'admin'].includes(role),
    tier,
  };
}
