import type { SupabaseClient } from '@supabase/supabase-js';
import type { RankedSimilarCase } from '@nertura/ai';

export async function findSimilarMemoryEvents(
  supabase: SupabaseClient,
  params: { crop?: string | null; disease?: string | null; limit?: number }
): Promise<RankedSimilarCase[]> {
  if (!params.crop && !params.disease) return [];

  let query = supabase
    .from('ai_memory_events')
    .select('id, crop, diagnosis, confidence, created_at')
    .order('created_at', { ascending: false })
    .limit(params.limit ?? 5);

  if (params.crop) query = query.eq('crop', params.crop);
  if (params.disease) query = query.eq('disease', params.disease);

  const { data } = await query;
  if (!data?.length) return [];

  return data.map((row: { id: string; crop: string | null; diagnosis: string | null }, i: number) => ({
    id: row.id,
    memoryEventId: row.id,
    crop: row.crop ?? '',
    diagnosis: row.diagnosis ?? '',
    score: Math.max(0.5, 0.9 - i * 0.08),
    rankReason: 'recency' as const,
  }));
}
