/** Shared domain types — extend as Supabase schema is generated. */

export type AppName = 'marketing' | 'dashboard' | 'admin';

export type OrganizationType =
  | 'farm'
  | 'cooperative'
  | 'ag_company'
  | 'supplier'
  | 'exporter';

export type SubscriptionTier = 'starter' | 'professional' | 'business' | 'enterprise';

export type AppRole = 'owner' | 'admin' | 'manager' | 'operator' | 'viewer';

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export type {
  AiConversation,
  AiMessage,
  AreaUnit,
  Crop,
  CropStatus,
  Farm,
  FarmStatus,
  Field,
  FieldGeoMetadata,
  FieldStatus,
  GeoJsonPolygonLike,
} from './database';

export type { DoctorApiResponse, DoctorDiagnosis, DoctorSource } from './doctor';
export type {
  EvidenceCard,
  FeedbackType,
  IntelligenceApiResponse,
  DiagnosisOutcomeType,
} from './intelligence';
export type {
  CaseOverview,
  CasePhotoRef,
  CaseProgress,
  CaseTask,
  CaseTaskSource,
  CaseTaskStatus,
  CaseTimelineEvent,
  CaseTimelineEventType,
  CaseNotificationChannel,
  FieldCaseStatus,
} from './projects-engine';
