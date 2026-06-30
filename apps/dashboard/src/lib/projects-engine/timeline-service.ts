import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  CaseNotificationChannel,
  CaseTimelineEventType,
} from '@nertura/types';

export interface AppendTimelineEventInput {
  fieldCaseId: string;
  organizationId: string;
  userId: string;
  eventType: CaseTimelineEventType;
  title: string;
  summary?: string | null;
  refTable?: string | null;
  refId?: string | null;
  metadata?: Record<string, unknown>;
  notificationChannels?: CaseNotificationChannel[];
  notifyAt?: string | null;
}

const DEDUPE_TIMELINE_EVENTS = new Set<CaseTimelineEventType>([
  'photo_uploaded',
  'diagnosis_created',
  'treatment_generated',
  'reminder_scheduled',
]);

export async function appendCaseTimelineEvent(
  supabase: SupabaseClient,
  input: AppendTimelineEventInput
): Promise<string | null> {
  if (
    DEDUPE_TIMELINE_EVENTS.has(input.eventType) &&
    input.refTable &&
    input.refId
  ) {
    const { data: existing } = await supabase
      .from('case_timeline_events')
      .select('id')
      .eq('field_case_id', input.fieldCaseId)
      .eq('event_type', input.eventType)
      .eq('ref_table', input.refTable)
      .eq('ref_id', input.refId)
      .maybeSingle();

    if (existing?.id) return existing.id as string;
  }

  const { data, error } = await supabase
    .from('case_timeline_events')
    .insert({
      field_case_id: input.fieldCaseId,
      organization_id: input.organizationId,
      user_id: input.userId,
      event_type: input.eventType,
      title: input.title,
      summary: input.summary ?? null,
      ref_table: input.refTable ?? null,
      ref_id: input.refId ?? null,
      metadata: input.metadata ?? {},
      notification_channels: input.notificationChannels ?? [],
      notify_at: input.notifyAt ?? null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[projects-engine] timeline insert failed', error.message);
    return null;
  }
  return data?.id as string;
}

/** Schedule a future notification hook without sending anything in v1. */
export async function scheduleCaseNotificationHook(
  supabase: SupabaseClient,
  input: AppendTimelineEventInput & { notifyAt: string; channels: CaseNotificationChannel[] }
): Promise<string | null> {
  return appendCaseTimelineEvent(supabase, {
    ...input,
    eventType: input.eventType ?? 'reminder_scheduled',
    notificationChannels: input.channels,
    notifyAt: input.notifyAt,
  });
}

export async function listCaseTimelineEvents(
  supabase: SupabaseClient,
  fieldCaseId: string,
  limit = 50
) {
  const { data, error } = await supabase
    .from('case_timeline_events')
    .select('*')
    .eq('field_case_id', fieldCaseId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    fieldCaseId: row.field_case_id as string,
    eventType: row.event_type as CaseTimelineEventType,
    title: row.title as string,
    summary: (row.summary as string | null) ?? null,
    refTable: (row.ref_table as string | null) ?? null,
    refId: (row.ref_id as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    notificationChannels: (row.notification_channels as CaseNotificationChannel[]) ?? [],
    notifyAt: (row.notify_at as string | null) ?? null,
    createdAt: row.created_at as string,
  }));
}

/** Build timeline from persisted events + linked analyses/photos (no duplication). */
export async function buildCaseTimeline(
  supabase: SupabaseClient,
  fieldCaseId: string
) {
  const events = await listCaseTimelineEvents(supabase, fieldCaseId, 100);
  if (events.length > 0) return events;

  const { data: analyses } = await supabase
    .from('ai_analyses')
    .select('id, diagnosis, created_at')
    .eq('field_case_id', fieldCaseId)
    .order('created_at', { ascending: false })
    .limit(20);

  return (analyses ?? []).map((a) => ({
    id: `analysis-${a.id}`,
    fieldCaseId,
    eventType: 'diagnosis_created' as const,
    title: 'Teşhis oluşturuldu',
    summary: (a.diagnosis as string | null)?.slice(0, 200) ?? null,
    refTable: 'ai_analyses',
    refId: a.id as string,
    metadata: {},
    notificationChannels: [] as CaseNotificationChannel[],
    notifyAt: null,
    createdAt: a.created_at as string,
  }));
}
