'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { SubscriptionTier } from '@/lib/navigation-tier';

const TierContext = createContext<SubscriptionTier>('free');

export function TierProvider({
  tier,
  children,
}: {
  tier: SubscriptionTier;
  children: ReactNode;
}) {
  return <TierContext.Provider value={tier}>{children}</TierContext.Provider>;
}

export function useSubscriptionTier(): SubscriptionTier {
  return useContext(TierContext);
}
