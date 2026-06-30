export type DiagnosisOutcomeType = 'solved' | 'improved' | 'no_change' | 'worse';

export const OUTCOME_TYPE_VALUES = [
  'solved',
  'improved',
  'no_change',
  'worse',
] as const satisfies readonly DiagnosisOutcomeType[];

export const FOLLOW_UP_DAYS = [7, 14, 30] as const;

export type FollowUpDay = (typeof FOLLOW_UP_DAYS)[number];

export interface RankedSimilarCase {
  id: string;
  memoryEventId?: string;
  diagnosisId?: string;
  crop?: string;
  disease?: string;
  diagnosis?: string;
  treatment?: string;
  outcome?: DiagnosisOutcomeType | null;
  climateZone?: string | null;
  score: number;
  rankReason: string;
}

export interface FarmMemorySummary {
  farmId: string;
  farmName: string;
  cropCount?: number;
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

const OUTCOME_BONUS: Record<string, number> = {
  solved: 0.25,
  improved: 0.15,
  no_change: 0,
  worse: -0.1,
};

/** Rank similar cases by crop, disease, climate match and successful outcomes. */
export function rankSimilarCases(
  cases: Array<{
    id: string;
    memoryEventId?: string;
    diagnosisId?: string;
    crop?: string | null;
    disease?: string | null;
    diagnosis?: string | null;
    treatment?: string | null;
    outcome?: DiagnosisOutcomeType | null;
    climateZone?: string | null;
    confidence?: number | null;
  }>,
  query: {
    crop?: string | null;
    disease?: string | null;
    climateZone?: string | null;
  },
  limit = 5
): RankedSimilarCase[] {
  const ranked = cases.map((c) => {
    let score = c.confidence ?? 0.5;
    const reasons: string[] = [];

    if (query.crop && c.crop === query.crop) {
      score += 0.35;
      reasons.push('same_crop');
    }
    if (query.disease && c.disease === query.disease) {
      score += 0.35;
      reasons.push('same_disease');
    }
    if (query.climateZone && c.climateZone === query.climateZone) {
      score += 0.15;
      reasons.push('same_climate');
    }
    if (c.outcome) {
      score += OUTCOME_BONUS[c.outcome] ?? 0;
      reasons.push(`outcome_${c.outcome}`);
    }

    return {
      id: c.id,
      memoryEventId: c.memoryEventId,
      diagnosisId: c.diagnosisId,
      crop: c.crop ?? undefined,
      disease: c.disease ?? undefined,
      diagnosis: c.diagnosis ?? undefined,
      treatment: c.treatment ?? undefined,
      outcome: c.outcome ?? null,
      climateZone: c.climateZone ?? null,
      score: Math.min(0.99, Math.max(0, score)),
      rankReason: reasons.join(', ') || 'general_match',
    };
  });

  return ranked.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Adjust confidence based on historical outcome success rate for crop+disease. */
export function adjustConfidenceFromOutcomes(
  baseConfidence: number,
  stats: { solved: number; improved: number; noChange: number; worse: number; total: number }
): number {
  if (stats.total === 0) return baseConfidence;

  const successRate = (stats.solved + stats.improved * 0.5) / stats.total;
  const failureRate = stats.worse / stats.total;
  const delta = successRate * 0.08 - failureRate * 0.12;

  return Math.min(0.98, Math.max(0.2, baseConfidence + delta));
}
