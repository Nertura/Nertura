import type { SupabaseClient } from '@supabase/supabase-js';

import {
  adjustConfidenceFromOutcomes,
  rankSimilarCases,
  type DiagnosisOutcomeType,
  type RankedSimilarCase,
} from '@nertura/ai';

export interface FarmMemorySummary {
  farmId: string;
  farmName: string;
}

export interface ProjectMemorySummary {
  projectId: string;
  projectName: string;
}

export interface DiseaseHistoryEntry {
  id: string;
  crop: string;
  disease: string | null;
  occurrenceCount: number;
  lastOutcome: DiagnosisOutcomeType | null;
  lastSeenAt: string;
}

export interface WeatherSnapshotPlaceholder {
  location: string | null;
  climateZone: string | null;
  temperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  source: string;
}

export interface MemoryContext {
  farms: FarmMemorySummary[];
  projects: ProjectMemorySummary[];
  diseaseHistory: DiseaseHistoryEntry[];
  rankedSimilarCases: RankedSimilarCase[];
  weather: WeatherSnapshotPlaceholder | null;
  outcomeStats: { solved: number; improved: number; noChange: number; worse: number; total: number };
}

export async function loadMemoryContext(
  supabase: SupabaseClient,
  params: {
    userId: string;
    organizationId?: string | null;
    crop?: string | null;
    disease?: string | null;
    climateZone?: string | null;
  }
): Promise<MemoryContext> {
  const [farmsRes, projectsRes, historyRes, similarRes, statsRes] = await Promise.all([
    params.organizationId
      ? supabase
          .from('farms')
          .select('id, name')
          .eq('organization_id', params.organizationId)
          .is('deleted_at', null)
          .limit(5)
      : Promise.resolve({ data: [] }),
    supabase
      .from('projects')
      .select('id, name')
      .eq('user_id', params.userId)
      .is('deleted_at', null)
      .limit(5),
    supabase
      .from('disease_history')
      .select('id, crop, disease, occurrence_count, last_outcome, last_seen_at')
      .eq('user_id', params.userId)
      .order('last_seen_at', { ascending: false })
      .limit(10),
    fetchRankedSimilarCases(supabase, params),
    fetchOutcomeStats(supabase, params.crop, params.disease),
  ]);

  const farms: FarmMemorySummary[] = (farmsRes.data ?? []).map((f) => ({
    farmId: f.id as string,
    farmName: f.name as string,
  }));

  const projects: ProjectMemorySummary[] = (projectsRes.data ?? []).map((p) => ({
    projectId: p.id as string,
    projectName: p.name as string,
  }));

  const diseaseHistory: DiseaseHistoryEntry[] = (historyRes.data ?? []).map((h) => ({
    id: h.id as string,
    crop: h.crop as string,
    disease: h.disease as string | null,
    occurrenceCount: h.occurrence_count as number,
    lastOutcome: h.last_outcome as DiagnosisOutcomeType | null,
    lastSeenAt: h.last_seen_at as string,
  }));

  return {
    farms,
    projects,
    diseaseHistory,
    rankedSimilarCases: similarRes,
    weather: null,
    outcomeStats: statsRes,
  };
}

async function fetchRankedSimilarCases(
  supabase: SupabaseClient,
  params: { crop?: string | null; disease?: string | null; climateZone?: string | null }
): Promise<RankedSimilarCase[]> {
  let query = supabase
    .from('ai_memory_events')
    .select(
      `
      id,
      crop,
      disease,
      diagnosis,
      treatment,
      confidence,
      analysis_id
    `
    )
    .order('created_at', { ascending: false })
    .limit(40);

  if (params.crop) query = query.eq('crop', params.crop);

  const { data: events } = await query;
  if (!events?.length) return [];

  const analysisIds = events.map((e) => e.analysis_id).filter(Boolean) as string[];

  const { data: outcomes } = analysisIds.length
    ? await supabase
        .from('diagnosis_outcomes')
        .select('diagnosis_id, outcome, days_since')
        .in('diagnosis_id', analysisIds)
        .order('created_at', { ascending: false })
    : { data: [] };

  const outcomeByDiagnosis = new Map<string, DiagnosisOutcomeType>();
  for (const o of outcomes ?? []) {
    if (!outcomeByDiagnosis.has(o.diagnosis_id as string)) {
      outcomeByDiagnosis.set(o.diagnosis_id as string, o.outcome as DiagnosisOutcomeType);
    }
  }

  const { data: weatherRows } = analysisIds.length
    ? await supabase
        .from('weather_snapshots')
        .select('diagnosis_id, climate_zone')
        .in('diagnosis_id', analysisIds)
    : { data: [] };

  const climateByDiagnosis = new Map<string, string>();
  for (const w of weatherRows ?? []) {
    if (w.diagnosis_id && w.climate_zone) {
      climateByDiagnosis.set(w.diagnosis_id as string, w.climate_zone as string);
    }
  }

  return rankSimilarCases(
    events.map((e) => ({
      id: e.id as string,
      memoryEventId: e.id as string,
      diagnosisId: e.analysis_id as string | undefined,
      crop: e.crop as string | null,
      disease: e.disease as string | null,
      diagnosis: e.diagnosis as string | null,
      treatment: e.treatment as string | null,
      outcome: e.analysis_id ? outcomeByDiagnosis.get(e.analysis_id as string) ?? null : null,
      climateZone: e.analysis_id ? climateByDiagnosis.get(e.analysis_id as string) ?? null : null,
      confidence: e.confidence as number | null,
    })),
    {
      crop: params.crop,
      disease: params.disease,
      climateZone: params.climateZone,
    },
    5
  );
}

async function fetchOutcomeStats(
  supabase: SupabaseClient,
  crop?: string | null,
  disease?: string | null
) {
  let query = supabase.from('diagnosis_outcomes').select('outcome');
  if (crop) query = query.eq('crop', crop);
  if (disease) query = query.eq('disease', disease);

  const { data } = await query.limit(500);
  const stats = { solved: 0, improved: 0, noChange: 0, worse: 0, total: 0 };

  for (const row of data ?? []) {
    stats.total++;
    if (row.outcome === 'solved') stats.solved++;
    else if (row.outcome === 'improved') stats.improved++;
    else if (row.outcome === 'no_change') stats.noChange++;
    else if (row.outcome === 'worse') stats.worse++;
  }

  return stats;
}

export async function persistDiagnosisMemory(
  supabase: SupabaseClient,
  params: {
    diagnosisId: string;
    memoryEventId: string;
    userId: string;
    organizationId?: string | null;
    crop?: string | null;
    disease?: string | null;
    confidence?: number;
    treatment?: string | null;
    location?: string | null;
    season?: string | null;
  }
): Promise<void> {
  await supabase.rpc('schedule_diagnosis_follow_ups', {
    p_diagnosis_id: params.diagnosisId,
    p_user_id: params.userId,
    p_organization_id: params.organizationId ?? null,
    p_crop: params.crop ?? null,
    p_disease: params.disease ?? null,
  });

  const crop = params.crop ?? 'unknown';
  const disease = params.disease ?? null;

  let historyQuery = supabase
    .from('disease_history')
    .select('id, occurrence_count')
    .eq('user_id', params.userId)
    .eq('crop', crop);

  historyQuery = disease
    ? historyQuery.eq('disease', disease)
    : historyQuery.is('disease', null);

  const { data: existing } = await historyQuery.maybeSingle();

  if (existing?.id) {
    await supabase
      .from('disease_history')
      .update({
        occurrence_count: (existing.occurrence_count as number) + 1,
        last_seen_at: new Date().toISOString(),
        last_diagnosis_id: params.diagnosisId,
        last_confidence: params.confidence ?? null,
        last_treatment: params.treatment ?? null,
      })
      .eq('id', existing.id);
  } else if (params.crop) {
    await supabase.from('disease_history').insert({
      user_id: params.userId,
      organization_id: params.organizationId ?? null,
      crop,
      disease,
      last_diagnosis_id: params.diagnosisId,
      last_confidence: params.confidence ?? null,
      last_treatment: params.treatment ?? null,
    });
  }

  await supabase.from('weather_snapshots').insert({
    diagnosis_id: params.diagnosisId,
    memory_event_id: params.memoryEventId,
    user_id: params.userId,
    organization_id: params.organizationId ?? null,
    location: params.location ?? null,
    climate_zone: params.season ?? null,
    temperature: null,
    humidity: null,
    rainfall: null,
    source: 'placeholder',
    metadata: { note: 'Awaiting weather API integration' },
  });
}

export { adjustConfidenceFromOutcomes };

export interface PendingFollowUp {
  id: string;
  diagnosisId: string;
  daysSince: number;
  dueAt: string;
  crop: string | null;
  disease: string | null;
  question: string | null;
}

export async function getPendingFollowUps(
  supabase: SupabaseClient,
  userId: string
): Promise<PendingFollowUp[]> {
  const now = new Date().toISOString();

  const { data } = await supabase
    .from('diagnosis_follow_ups')
    .select(
      `
      id,
      diagnosis_id,
      days_since,
      due_at,
      crop,
      disease,
      ai_analyses ( question )
    `
    )
    .eq('user_id', userId)
    .eq('status', 'pending')
    .lte('due_at', now)
    .order('due_at', { ascending: true })
    .limit(10);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    diagnosisId: row.diagnosis_id as string,
    daysSince: row.days_since as number,
    dueAt: row.due_at as string,
    crop: row.crop as string | null,
    disease: row.disease as string | null,
    question:
      row.ai_analyses &&
      typeof row.ai_analyses === 'object' &&
      'question' in (row.ai_analyses as object)
        ? String((row.ai_analyses as { question?: string }).question)
        : null,
  }));
}

export async function submitDiagnosisOutcome(
  supabase: SupabaseClient,
  params: {
    diagnosisId: string;
    userId: string;
    outcome: DiagnosisOutcomeType;
    daysSince: number;
    notes?: string | null;
    memoryEventId?: string | null;
  }
) {
  const { data, error } = await supabase.rpc('record_diagnosis_outcome', {
    p_diagnosis_id: params.diagnosisId,
    p_user_id: params.userId,
    p_outcome: params.outcome,
    p_days_since: params.daysSince,
    p_notes: params.notes ?? null,
    p_memory_event_id: params.memoryEventId ?? null,
  });

  if (error) throw error;
  return data as { success?: boolean; outcome_id?: string; error?: string };
}
