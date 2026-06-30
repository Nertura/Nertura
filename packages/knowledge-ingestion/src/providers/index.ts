import type { KnowledgeIngestionProvider } from '../types';
import { AgrovocProvider } from './agrovoc';
import { CabiProvider } from './cabi';
import { ManualUploadProvider } from './manual-upload';
import { PlantVillageDatasetProvider } from './plant-village';
import { SoilGridsProvider } from './soilgrids';
import { WebResearchProvider } from './web-research';

export { AgrovocProvider } from './agrovoc';
export { SoilGridsProvider } from './soilgrids';
export { CabiProvider } from './cabi';
export { PlantVillageDatasetProvider } from './plant-village';
export { ManualUploadProvider } from './manual-upload';
export { WebResearchProvider } from './web-research';

const PROVIDERS: KnowledgeIngestionProvider[] = [
  new AgrovocProvider(),
  new SoilGridsProvider(),
  new ManualUploadProvider(),
  new CabiProvider(),
  new PlantVillageDatasetProvider(),
  new WebResearchProvider(),
];

export function getProviderById(id: string): KnowledgeIngestionProvider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export function resolveProvider(source: { config?: Record<string, unknown> }): KnowledgeIngestionProvider | undefined {
  const providerId = String(source.config?.provider ?? '');
  return getProviderById(providerId);
}

export function listProviders(): KnowledgeIngestionProvider[] {
  return PROVIDERS;
}
