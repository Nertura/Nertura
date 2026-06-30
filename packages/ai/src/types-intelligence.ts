export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type EvidenceCardType =
  | 'knowledge_bank'
  | 'farm_memory'
  | 'project_memory'
  | 'disease_history'
  | 'image_analysis'
  | 'weather_regional'
  | 'similar_cases'
  | 'conversation_history';

export interface EvidenceCard {
  type: EvidenceCardType;
  title: string;
  summary: string;
  confidence?: number;
  source?: string;
  metadata?: Record<string, unknown>;
}

export type FeedbackType =
  | 'helpful'
  | 'not_helpful'
  | 'problem_solved'
  | 'still_sick'
  | 'wrong_diagnosis';

export const FEEDBACK_TYPE_VALUES = [
  'helpful',
  'not_helpful',
  'problem_solved',
  'still_sick',
  'wrong_diagnosis',
] as const satisfies readonly FeedbackType[];
