import type {
  CollectedIngestionItem,
  IngestionCollectOptions,
  KnowledgeIngestionProvider,
  KnowledgeSourceRow,
} from '../types';

/** Web research — disabled placeholder; requires robots.txt + ToS review. */
export class WebResearchProvider implements KnowledgeIngestionProvider {
  readonly id = 'web_research';
  readonly displayName = 'Web Research';

  isConfigured(): boolean {
    return false;
  }

  async collect(
    _source: KnowledgeSourceRow,
    _options?: IngestionCollectOptions
  ): Promise<CollectedIngestionItem[]> {
    return [];
  }
}
