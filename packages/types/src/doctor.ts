export type DoctorSource = 'knowledge_base' | 'gemini' | 'openai' | 'brain' | 'mock' | 'fallback';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface DoctorDiagnosis {
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
  language?: 'tr' | 'en';
  formatted?: string;
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

export interface DoctorApiResponse {
  conversationId: string;
  diagnosis: DoctorDiagnosis;
  usage?: {
    used: number;
    limit: number;
    remaining: number;
  };
  limitReached?: boolean;
  message: {
    id: string;
    role: 'assistant';
    content: string;
    created_at: string;
    diagnosis?: DoctorDiagnosis;
  };
}
