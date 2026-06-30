import type { SupabaseClient } from '@supabase/supabase-js';

import {
  detectExplicitLanguageSwitch,
  detectMessageLanguage,
  resolveInitialConversationLanguage,
  type ConversationLanguage,
} from '@nertura/ai';

import { isMissingLanguageColumnError } from '@/lib/ai/doctor-errors';

export type { ConversationLanguage };

export function geoCountryFromRequest(request: Request): string | null {
  return (
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('cf-ipcountry') ??
    request.headers.get('x-country-code') ??
    null
  );
}

export async function loadUserProfileLanguage(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string
): Promise<string | null> {
  const [{ data: userRow }, { data: orgRow }] = await Promise.all([
    supabase.from('users').select('language').eq('id', userId).maybeSingle(),
    supabase.from('organizations').select('default_language').eq('id', organizationId).maybeSingle(),
  ]);
  return userRow?.language ?? orgRow?.default_language ?? null;
}

async function readConversationLanguageFromRow(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string
): Promise<ConversationLanguage | null> {
  const withLang = await supabase
    .from('ai_conversations')
    .select('language, metadata')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!withLang.error && withLang.data) {
    const lang =
      withLang.data.language ??
      (typeof withLang.data.metadata === 'object' &&
      withLang.data.metadata &&
      'language' in withLang.data.metadata
        ? (withLang.data.metadata as { language?: string }).language
        : null);
    return lang === 'tr' || lang === 'en' ? lang : null;
  }

  if (withLang.error && isMissingLanguageColumnError(withLang.error)) {
    const metaOnly = await supabase
      .from('ai_conversations')
      .select('metadata')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();
    const lang =
      typeof metaOnly.data?.metadata === 'object' &&
      metaOnly.data.metadata &&
      'language' in metaOnly.data.metadata
        ? (metaOnly.data.metadata as { language?: string }).language
        : null;
    return lang === 'tr' || lang === 'en' ? lang : null;
  }

  return null;
}

export async function loadPreviousConversationLanguage(
  supabase: SupabaseClient,
  userId: string,
  excludeConversationId?: string
): Promise<ConversationLanguage | null> {
  let query = supabase
    .from('ai_conversations')
    .select('language, metadata')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (excludeConversationId) {
    query = query.neq('id', excludeConversationId);
  }

  const { data, error } = await query.maybeSingle();
  if (error && isMissingLanguageColumnError(error)) {
    return null;
  }
  const lang =
    data?.language ??
    (typeof data?.metadata === 'object' && data.metadata && 'language' in data.metadata
      ? (data.metadata as { language?: string }).language
      : null);
  return lang === 'tr' || lang === 'en' ? lang : null;
}

export async function loadConversationLanguage(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string
): Promise<ConversationLanguage | null> {
  return readConversationLanguageFromRow(supabase, conversationId, userId);
}

export async function persistConversationLanguage(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string,
  language: ConversationLanguage
): Promise<void> {
  const { error } = await supabase
    .from('ai_conversations')
    .update({ language, updated_at: new Date().toISOString() })
    .eq('id', conversationId)
    .eq('user_id', userId);

  if (!error) return;

  if (isMissingLanguageColumnError(error)) {
    const { data: row } = await supabase
      .from('ai_conversations')
      .select('metadata')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();
    const metadata =
      typeof row?.metadata === 'object' && row.metadata
        ? { ...(row.metadata as Record<string, unknown>), language }
        : { language };
    await supabase
      .from('ai_conversations')
      .update({
        updated_at: new Date().toISOString(),
        metadata,
      })
      .eq('id', conversationId)
      .eq('user_id', userId);
    return;
  }

  throw error;
}

export async function resolveLockedConversationLanguage(params: {
  supabase: SupabaseClient;
  request: Request;
  userId: string;
  organizationId: string;
  conversationId?: string;
  userMessage: string;
}): Promise<ConversationLanguage> {
  const explicitSwitch = detectExplicitLanguageSwitch(params.userMessage);

  if (params.conversationId) {
    const existing = await loadConversationLanguage(
      params.supabase,
      params.conversationId,
      params.userId
    );
    if (existing) {
      if (explicitSwitch && explicitSwitch !== existing) {
        await persistConversationLanguage(
          params.supabase,
          params.conversationId,
          params.userId,
          explicitSwitch
        );
        return explicitSwitch;
      }
      return existing;
    }
  }

  const initial = resolveInitialConversationLanguage({
    profileLanguage: await loadUserProfileLanguage(
      params.supabase,
      params.userId,
      params.organizationId
    ),
    conversationLanguage: params.conversationId
      ? await loadConversationLanguage(params.supabase, params.conversationId, params.userId)
      : null,
    acceptLanguage: params.request.headers.get('accept-language'),
    messageLanguage: detectMessageLanguage(params.userMessage),
  });

  return explicitSwitch ?? initial;
}
