export type KnowledgeSourceType =
  | 'official_api'
  | 'open_dataset'
  | 'website'
  | 'manual'
  | 'research'
  | 'internal';

export type IngestionItemStatus =
  | 'collected'
  | 'normalized'
  | 'summarized'
  | 'summary_pending'
  | 'review_pending'
  | 'approved'
  | 'rejected';

export type ReviewQueueStatus = 'pending' | 'approved' | 'rejected' | 'needs_expert';

export interface KnowledgeSourceRow {
  id: string;
  name: string;
  type: KnowledgeSourceType;
  base_url: string | null;
  license_notes: string | null;
  trust_level: 'high' | 'medium' | 'low';
  enabled: boolean;
  schedule: string | null;
  config: Record<string, unknown>;
}

export interface CollectedIngestionItem {
  title: string;
  rawText: string;
  language?: string;
  crop?: string | null;
  disease?: string | null;
  pest?: string | null;
  symptom?: string | null;
  region?: string | null;
  sourceUrl?: string | null;
  citation: string;
  metadata?: Record<string, unknown>;
}

export interface IngestionCollectOptions {
  limit?: number;
  /** Optional coordinates for geo providers */
  latitude?: number | null;
  longitude?: number | null;
  searchTerms?: string[];
}

export interface KnowledgeIngestionProvider {
  readonly id: string;
  readonly displayName: string;
  isConfigured(): boolean;
  collect(source: KnowledgeSourceRow, options?: IngestionCollectOptions): Promise<CollectedIngestionItem[]>;
}

export interface IngestionSummaryResult {
  shortSummary: string;
  crop?: string | null;
  disease?: string | null;
  pest?: string | null;
  symptom?: string | null;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  suggestedCategory: string;
  citations: string[];
  uncertaintyNotes: string;
  proposedKnowledgeItem: Record<string, unknown>;
}

export interface PipelineRunResult {
  jobId: string;
  sourcesProcessed: number;
  itemsCollected: number;
  itemsDuplicated: number;
  itemsQueued: number;
  errors: string[];
}
