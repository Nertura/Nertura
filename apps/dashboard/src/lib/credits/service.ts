/**
 * Central credit economy service — single entry point for all AI feature consumption.
 * Web, mobile, admin, and future partner APIs should use these server-side functions.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import {
  debitUserCredit,
  getGuestUsage,
  getUserUsage,
  type UsageStatus,
} from '@/lib/ai/usage-limits';

export type CreditFeature =
  | 'ai_doctor_question'
  | 'ai_doctor_photo'
  | 'premium_diagnosis'
  | 'regional_report'
  | 'satellite_analysis'
  | 'greenhouse_plan'
  | 'irrigation_plan'
  | 'fertilizer_plan'
  | 'content_generation'
  | 'outreach_enrichment'
  | 'enterprise_report'
  | 'premium_field_care_plan'
  | 'premium_fertilizer_plan'
  | 'premium_irrigation_plan'
  | 'premium_seasonal_program'
  | 'premium_disease_risk'
  | 'premium_satellite_ndvi';

const FEATURE_COST: Record<CreditFeature, number> = {
  ai_doctor_question: 1,
  ai_doctor_photo: 1,
  premium_diagnosis: 2,
  regional_report: 3,
  satellite_analysis: 5,
  greenhouse_plan: 3,
  irrigation_plan: 2,
  fertilizer_plan: 2,
  content_generation: 1,
  outreach_enrichment: 1,
  enterprise_report: 10,
  premium_field_care_plan: 60,
  premium_fertilizer_plan: 70,
  premium_irrigation_plan: 70,
  premium_seasonal_program: 80,
  premium_disease_risk: 90,
  premium_satellite_ndvi: 100,
};

export { GUEST_QUESTION_LIMIT, REGISTERED_FREE_LIMIT } from '@nertura/ai';
export type { UsageStatus };

export function getFeatureCreditCost(feature: CreditFeature): number {
  return FEATURE_COST[feature] ?? 1;
}

export async function getCreditBalance(
  supabase: SupabaseClient,
  userId: string,
  organizationId?: string | null
): Promise<UsageStatus> {
  return getUserUsage(supabase, userId, organizationId);
}

export async function consumeCredits(
  supabase: SupabaseClient,
  userId: string,
  feature: CreditFeature,
  referenceId?: string
): Promise<{ success: boolean; balanceAfter: number; error?: string }> {
  const cost = getFeatureCreditCost(feature);
  if (cost <= 1) {
    return debitUserCredit(supabase, userId, feature.replace(/_/g, ' '), referenceId);
  }
  for (let i = 0; i < cost; i++) {
    const result = await debitUserCredit(
      supabase,
      userId,
      `${feature.replace(/_/g, ' ')} (${i + 1}/${cost})`,
      referenceId
    );
    if (!result.success) return result;
    if (i === cost - 1) return result;
  }
  return { success: false, balanceAfter: 0, error: 'Credit debit failed' };
}

export { getGuestUsage };
