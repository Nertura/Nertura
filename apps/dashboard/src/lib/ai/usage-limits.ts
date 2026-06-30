import type { SupabaseClient } from '@supabase/supabase-js';

import { GUEST_QUESTION_LIMIT, REGISTERED_FREE_LIMIT } from '@nertura/ai';

export { GUEST_QUESTION_LIMIT, REGISTERED_FREE_LIMIT };

export interface UsageStatus {
  used: number;
  limit: number;
  remaining: number;
  limitReached: boolean;
  credits: number;
}

export async function getUserUsage(
  supabase: SupabaseClient,
  userId: string,
  _organizationId?: string | null
): Promise<UsageStatus> {
  const { data } = await supabase
    .from('user_usage_limits')
    .select('credits_balance, question_count, free_limit')
    .eq('user_id', userId)
    .maybeSingle();

  const remaining = data?.credits_balance ?? REGISTERED_FREE_LIMIT;
  const used = data?.question_count ?? 0;
  const limit = REGISTERED_FREE_LIMIT;

  return {
    used,
    limit,
    remaining: Math.max(0, remaining),
    limitReached: remaining <= 0,
    credits: Math.max(0, remaining),
  };
}

export async function debitUserCredit(
  supabase: SupabaseClient,
  userId: string,
  description = 'AI Agriculture Doctor question',
  referenceId?: string
): Promise<{ success: boolean; balanceAfter: number; error?: string }> {
  const { data, error } = await supabase.rpc('debit_user_credit', {
    p_user_id: userId,
    p_description: description,
    p_reference_id: referenceId ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  const result = data as {
    success?: boolean;
    balance_after?: number;
    error?: string;
  };

  return {
    success: Boolean(result?.success),
    balanceAfter: result?.balance_after ?? 0,
    error: result?.error,
  };
}

/** @deprecated Use debitUserCredit */
export async function incrementUserUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const result = await debitUserCredit(supabase, userId);
  if (!result.success) {
    throw new Error(result.error ?? 'No credits remaining');
  }
}

export async function getGuestUsage(
  admin: SupabaseClient,
  guestId: string
): Promise<UsageStatus> {
  const { data } = await admin
    .from('guest_usage')
    .select('question_count, free_limit')
    .eq('guest_id', guestId)
    .maybeSingle();

  if (!data) {
    await admin.from('guest_usage').insert({
      guest_id: guestId,
      question_count: 0,
      free_limit: GUEST_QUESTION_LIMIT,
    });
    return {
      used: 0,
      limit: GUEST_QUESTION_LIMIT,
      remaining: GUEST_QUESTION_LIMIT,
      limitReached: false,
      credits: GUEST_QUESTION_LIMIT,
    };
  }

  const used = data.question_count ?? 0;
  const limit = data.free_limit ?? GUEST_QUESTION_LIMIT;
  const remaining = Math.max(0, limit - used);
  return {
    used,
    limit,
    remaining,
    limitReached: used >= limit,
    credits: remaining,
  };
}

export async function incrementGuestUsage(
  admin: SupabaseClient,
  guestId: string
): Promise<void> {
  const { data } = await admin
    .from('guest_usage')
    .select('question_count')
    .eq('guest_id', guestId)
    .maybeSingle();

  const now = new Date().toISOString();
  if (data) {
    await admin
      .from('guest_usage')
      .update({
        question_count: (data.question_count ?? 0) + 1,
        last_question_at: now,
      })
      .eq('guest_id', guestId);
  } else {
    await admin.from('guest_usage').insert({
      guest_id: guestId,
      question_count: 1,
      free_limit: GUEST_QUESTION_LIMIT,
      last_question_at: now,
    });
  }
}
