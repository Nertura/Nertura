export type HealthLabel = 'Healthy' | 'Needs monitoring' | 'High risk';

export interface FieldHealthScore {
  score: number;
  label: HealthLabel;
  hint: string;
}

/** Placeholder health score — improves as boundary, cases, and history accumulate. */
export function computeFieldHealthScore(input: {
  hasBoundary: boolean;
  openCases: number;
  monitoringCases: number;
  highSeverityCases: number;
  hasCrop: boolean;
  hasRecentDiagnosis: boolean;
}): FieldHealthScore {
  let score = 88;

  if (!input.hasBoundary) score -= 12;
  if (!input.hasCrop) score -= 8;
  if (input.openCases > 0) score -= 10 * Math.min(input.openCases, 2);
  if (input.monitoringCases > 0) score -= 6 * Math.min(input.monitoringCases, 2);
  if (input.highSeverityCases > 0) score -= 15;
  if (input.hasRecentDiagnosis) score += 4;

  score = Math.max(25, Math.min(98, score));

  let label: HealthLabel = 'Healthy';
  if (score < 55) label = 'High risk';
  else if (score < 78) label = 'Needs monitoring';

  return {
    score,
    label,
    hint: 'Score improves as you map boundaries, log cases, and complete follow-ups.',
  };
}

export function healthScoreColor(score: number): string {
  if (score >= 78) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 55) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}
