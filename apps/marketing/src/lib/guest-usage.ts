import type { SupabaseClient } from '@supabase/supabase-js';

import { GUEST_QUESTION_LIMIT } from '@nertura/ai';

export const GUEST_ID_COOKIE = 'nertura_guest_id';
export const GUEST_COUNT_COOKIE = 'nertura_guest_count';

export interface UsageStatus {
  used: number;
  limit: number;
  remaining: number;
}

export async function getGuestUsageFromDb(
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
    return { used: 0, limit: GUEST_QUESTION_LIMIT, remaining: GUEST_QUESTION_LIMIT };
  }

  const used = data.question_count ?? 0;
  const limit = GUEST_QUESTION_LIMIT;
  return { used, limit, remaining: Math.max(0, limit - used) };
}

export async function incrementGuestUsageDb(
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
      .update({ question_count: (data.question_count ?? 0) + 1, last_question_at: now })
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

export function getGuestUsageFromCookie(countCookie: string | undefined): UsageStatus {
  const used = Math.min(GUEST_QUESTION_LIMIT, Number(countCookie) || 0);
  return {
    used,
    limit: GUEST_QUESTION_LIMIT,
    remaining: Math.max(0, GUEST_QUESTION_LIMIT - used),
  };
}
