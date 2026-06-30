#!/usr/bin/env tsx
/**
 * Subscription tier wiring — pnpm test:tier-navigation
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { planToSubscriptionTier } from '../apps/dashboard/src/lib/billing/tier-resolver.ts';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function main() {
  const failures: string[] = [];

  try {
    assert(planToSubscriptionTier('starter', 'active') === 'free', 'starter should be free');
    assert(planToSubscriptionTier('professional', 'active') === 'plus', 'professional active = plus');
    assert(planToSubscriptionTier('business', 'trialing') === 'plus', 'business trialing = plus');
    assert(planToSubscriptionTier('professional', 'cancelled') === 'free', 'cancelled = free');
    assert(planToSubscriptionTier(null, null) === 'free', 'no sub = free');

    const prev = process.env.NEXT_PUBLIC_NERTURA_DEV_TIER;
    process.env.NEXT_PUBLIC_NERTURA_DEV_TIER = 'plus';
    assert(planToSubscriptionTier('starter', 'active') === 'plus', 'dev override = plus');
    process.env.NEXT_PUBLIC_NERTURA_DEV_TIER = prev;

    const navTierSrc = readFileSync(
      resolve(process.cwd(), 'apps/dashboard/src/lib/navigation-tier.ts'),
      'utf8'
    );
    assert(navTierSrc.includes('planToSubscriptionTier'), 'navigation-tier uses planToSubscriptionTier');
    assert(navTierSrc.includes('ctx?.tier'), 'resolveUserTier reads ctx.tier');

    const ctxSrc = readFileSync(
      resolve(process.cwd(), 'apps/dashboard/src/lib/auth/context.ts'),
      'utf8'
    );
    assert(ctxSrc.includes('fetchOrganizationTier'), 'dashboard context loads org tier');
    assert(ctxSrc.includes('tier:'), 'dashboard context exposes tier');
  } catch (e) {
    failures.push(e instanceof Error ? e.message : String(e));
  }

  const report = { success: failures.length === 0, failures };
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.success ? 0 : 1);
}

main();
