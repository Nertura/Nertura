export type FeedbackType =
  | 'helpful'
  | 'not_helpful'
  | 'problem_solved'
  | 'still_sick'
  | 'wrong_diagnosis';

export interface EvidenceCard {
  type: string;
  title: string;
  summary: string;
  confidence?: number;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface IntelligenceApiResponse {
  analysisId?: string | null;
  memoryEventId?: string | null;
  evidenceCards?: EvidenceCard[];
  intent?: string;
  entities?: Record<string, unknown>;
}

export type DiagnosisOutcomeType = 'solved' | 'improved' | 'no_change' | 'worse';
