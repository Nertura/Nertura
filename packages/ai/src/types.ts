export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type DoctorSource = 'knowledge_base' | 'gemini' | 'openai' | 'brain' | 'mock' | 'fallback';

export interface DoctorAnswer {
  diagnosis: string;
  symptoms: string;
  risk_level: RiskLevel;
  treatment: string;
  prevention: string;
  notes: string;
  confidence: number;
  source: DoctorSource;
  disclaimer: string;
  matched_slug?: string;
  matched_type?: string;
  /** Detected response language */
  language?: 'tr' | 'en';
  /** Full formatted Nertura doctor answer for display */
  formatted?: string;
  /** Structured sections for UI rendering */
  sections?: {
    short_diagnosis: string;
    possible_causes: string;
    risk_level: RiskLevel;
    immediate_action: string;
    treatment_plan: string;
    prevention: string;
    expert_warning: string;
  };
}

export interface KnowledgeHit {
  slug: string;
  type: string;
  name_tr: string;
  name_en: string;
  score: number;
  summary_tr?: string | null;
  summary_en?: string | null;
  symptoms?: unknown;
  causes?: unknown;
  treatments?: unknown;
  prevention?: unknown;
}

export interface DoctorPipelineInput {
  question: string;
  imageBase64?: string | null;
  imageMimeType?: string | null;
  language?: 'tr' | 'en';
  /** Onboarding farm profile injected into every doctor answer */
  farmProfile?: import('./farm-profile').FarmIntelligenceProfile | null;
  /** Recent messages for conversational continuity */
  conversationHistory?: Array<{ role: string; content: string }>;
  /** Pre-formatted memory block (similar cases, disease history) */
  memoryContextBlock?: string;
}

export interface DoctorPipelineOutput {
  answer: DoctorAnswer;
  knowledgeHits: KnowledgeHit[];
  rawGemini: unknown | null;
  rawOpenai: unknown | null;
  rawBrain: unknown | null;
}

export const DOCTOR_DISCLAIMER =
  'AI tavsiyesi sertifikalı bir tarım uzmanının yerini almaz. / AI advice does not replace a certified agricultural expert.';

export const GUEST_QUESTION_LIMIT = 10;
export const REGISTERED_FREE_LIMIT = 10;
