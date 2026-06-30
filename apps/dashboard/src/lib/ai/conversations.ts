import type { DoctorDiagnosis, EvidenceCard } from '@nertura/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface DoctorChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  diagnosis?: DoctorDiagnosis;
  evidenceCards?: EvidenceCard[];
  imageUrl?: string | null;
  analysisId?: string | null;
  memoryEventId?: string | null;
}

async function signedImageUrl(
  supabase: SupabaseClient,
  storagePath: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('analysis-images')
    .createSignedUrl(storagePath, 60 * 60 * 24);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function loadConversationMessages(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string
): Promise<DoctorChatMessage[]> {
  const { data: conversation } = await supabase
    .from('ai_conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!conversation) return [];

  const { data: rows } = await supabase
    .from('ai_messages')
    .select('id, role, content, metadata, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  const messages: DoctorChatMessage[] = [];

  for (const row of rows ?? []) {
    const meta = (row.metadata as Record<string, unknown>) ?? {};
    const diagnosis = meta.diagnosis as DoctorDiagnosis | undefined;
    const evidenceCards = meta.evidence_cards as EvidenceCard[] | undefined;
    const imagePath =
      typeof meta.image_path === 'string' ? meta.image_path : null;

    let imageUrl: string | null = null;
    if (imagePath) {
      imageUrl = await signedImageUrl(supabase, imagePath);
    }

    messages.push({
      id: row.id,
      role: row.role as 'user' | 'assistant',
      content: row.content,
      created_at: row.created_at,
      diagnosis,
      evidenceCards,
      imageUrl,
      analysisId: typeof meta.analysis_id === 'string' ? meta.analysis_id : null,
      memoryEventId:
        typeof meta.memory_event_id === 'string' ? meta.memory_event_id : null,
    });
  }

  return messages;
}

export async function loadConversationHistoryForPrompt(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string
): Promise<Array<{ role: string; content: string }>> {
  const messages = await loadConversationMessages(supabase, conversationId, userId);
  return messages
    .filter((m) => m.content.trim())
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 800) }));
}

export { signedImageUrl };
