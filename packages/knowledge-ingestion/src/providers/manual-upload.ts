import type {
  CollectedIngestionItem,
  IngestionCollectOptions,
  KnowledgeIngestionProvider,
  KnowledgeSourceRow,
} from '../types';

/** Manual uploads are inserted via admin API — provider is a registry stub for cron skip. */
export class ManualUploadProvider implements KnowledgeIngestionProvider {
  readonly id = 'manual_upload';
  readonly displayName = 'Manual Upload';

  isConfigured(): boolean {
    return true;
  }

  async collect(
    _source: KnowledgeSourceRow,
    _options?: IngestionCollectOptions
  ): Promise<CollectedIngestionItem[]> {
    return [];
  }
}
