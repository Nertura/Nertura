import type {
  CollectedIngestionItem,
  IngestionCollectOptions,
  KnowledgeIngestionProvider,
  KnowledgeSourceRow,
} from '../types';

/** CABI — placeholder until licensed API is configured. */
export class CabiProvider implements KnowledgeIngestionProvider {
  readonly id = 'cabi';
  readonly displayName = 'CABI Digital Library';

  isConfigured(): boolean {
    return Boolean(process.env.CABI_API_KEY?.trim());
  }

  async collect(
    _source: KnowledgeSourceRow,
    _options?: IngestionCollectOptions
  ): Promise<CollectedIngestionItem[]> {
    if (!this.isConfigured()) return [];
    // Future: licensed CABI API integration with explicit rate limits
    return [];
  }
}
