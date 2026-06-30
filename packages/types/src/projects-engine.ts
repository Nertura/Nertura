/** Projects Engine v1 — domain types (internal Project = field_cases / farmer Vaka Takibi). */

export type FieldCaseStatus = 'open' | 'monitoring' | 'resolved';

export type CaseProgress =
  | 'monitoring'
  | 'improving'
  | 'stable'
  | 'critical'
  | 'recovered'
  | 'closed';

export type CaseTimelineEventType =
  | 'case_created'
  | 'photo_uploaded'
  | 'diagnosis_created'
  | 'treatment_generated'
  | 'reminder_scheduled'
  | 'follow_up_analysis'
  | 'progress_updated'
  | 'feedback_received'
  | 'recovered'
  | 'completed'
  | 'note_added';

export type CaseTaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'skipped'
  | 'cancelled';

export type CaseTaskSource = 'ai' | 'farmer' | 'system';

/** Future notification channel identifiers — hooks only in v1. */
export type CaseNotificationChannel = 'in_app' | 'email' | 'push' | 'calendar' | 'sms';

export interface CaseTimelineEvent {
  id: string;
  fieldCaseId: string;
  eventType: CaseTimelineEventType;
  title: string;
  summary: string | null;
  refTable: string | null;
  refId: string | null;
  metadata: Record<string, unknown>;
  notificationChannels: CaseNotificationChannel[];
  notifyAt: string | null;
  createdAt: string;
}

export interface CaseTask {
  id: string;
  fieldCaseId: string;
  analysisId: string | null;
  title: string;
  description: string | null;
  source: CaseTaskSource;
  status: CaseTaskStatus;
  dueAt: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface CasePhotoRef {
  id: string;
  analysisId: string;
  storagePath: string;
  mimeType: string;
  createdAt: string;
}

/** Aggregated case overview — computed from existing tables, no placeholder data. */
export interface CaseOverview {
  id: string;
  status: FieldCaseStatus;
  progress: CaseProgress;
  crop: string | null;
  fieldId: string | null;
  fieldName: string | null;
  farmId: string | null;
  conversationId: string | null;
  createdAt: string;
  updatedAt: string;
  riskLevel: string | null;
  confidence: number | null;
  currentDiagnosis: string | null;
  lastPhoto: CasePhotoRef | null;
  lastActivityAt: string | null;
  nextRecommendation: string | null;
  analysisCount: number;
  photoCount: number;
}
