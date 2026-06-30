import type { DoctorDiagnosis } from '@nertura/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface GuestConversationSummary {
  id: string;
  title: string | null;
  updated_at: string;
}

export interface GuestChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  diagnosis?: DoctorDiagnosis;
}

export async function listGuestConversations(
  admin: SupabaseClient,
  guestId: string
): Promise<GuestConversationSummary[]> {
  const { data, error } = await admin
    .from('ai_conversations')
    .select('id, title, updated_at')
    .eq('guest_id', guestId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}

export async function loadGuestConversationMessages(
  admin: SupabaseClient,
  guestId: string,
  conversationId: string
): Promise<GuestChatMessage[]> {
  const { data: conversation, error: convErr } = await admin
    .from('ai_conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('guest_id', guestId)
    .is('deleted_at', null)
    .maybeSingle();

  if (convErr) throw convErr;
  if (!conversation) return [];

  const { data: rows, error } = await admin
    .from('ai_messages')
    .select('id, role, content, metadata, created_at')
    .eq('conversation_id', conversationId)
    .eq('guest_id', guestId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (rows ?? []).map((row) => {
    const metadata = (row.metadata ?? {}) as Record<string, unknown>;
    const diagnosis = metadata.diagnosis as DoctorDiagnosis | undefined;
    return {
      id: row.id,
      role: row.role as 'user' | 'assistant',
      content: row.content,
      created_at: row.created_at,
      ...(diagnosis ? { diagnosis } : {}),
    };
  });
}
