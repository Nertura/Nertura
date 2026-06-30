import type {
  CollectedIngestionItem,
  IngestionCollectOptions,
  KnowledgeIngestionProvider,
  KnowledgeSourceRow,
} from '../types';

/** PlantVillage — placeholder; use official dataset exports only. */
export class PlantVillageDatasetProvider implements KnowledgeIngestionProvider {
  readonly id = 'plant_village';
  readonly displayName = 'PlantVillage Dataset';

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
