import type { ExtractedEntities } from './entity-extractor';

export type AgricultureIntent =
  | 'diagnosis'
  | 'pest'
  | 'fertilizer'
  | 'irrigation'
  | 'soil'
  | 'crop_care'
  | 'weather_risk'
  | 'farm_history'
  | 'general';

const INTENT_PATTERNS: Array<{ intent: AgricultureIntent; patterns: RegExp[] }> = [
  {
    intent: 'diagnosis',
    patterns: [
      /teşhis|teshis|hastalık|hastalik|hasta|neden|niye|ne oluyor|what is wrong|disease|symptom|problem/i,
      /sarar|dökül|dokul|kıvrıl|kivril|leke|solma|wilt|yellow|curl|drop|spot/i,
    ],
  },
  {
    intent: 'pest',
    patterns: [/zararlı|zararli|böcek|bocek|pest|insect|mite|aphid|yaprak biti|thrips|akari/i],
  },
  {
    intent: 'fertilizer',
    patterns: [/gübre|gubre|fertiliz|besin|npk|azot|potasyum|phosphor|nutrient|toprak besin/i],
  },
  {
    intent: 'irrigation',
    patterns: [/sulama|irrigation|water|su ver|drip|damla|kurak|drought|overwater/i],
  },
  {
    intent: 'soil',
    patterns: [/toprak|soil|ph\b|tuz|salinity|compaction|humus|organic matter/i],
  },
  {
    intent: 'crop_care',
    patterns: [/bakım|bakim|care|prune|pruning|hasat|harvest|ekim|planting|dikim|budama/i],
  },
  {
    intent: 'weather_risk',
    patterns: [/don|frost|hava|weather|yağmur|yagmur|rain|drought|kuraklık|sıcak|sicak|heat|wind|rüzgar/i],
  },
  {
    intent: 'farm_history',
    patterns: [/geçmiş|gecmis|history|record|log|previous|önceki|onceki|last season|geçen sezon/i],
  },
];

export function classifyIntent(question: string, entities: Pick<ExtractedEntities, 'diseases' | 'symptoms'>): AgricultureIntent {
  const q = question.toLowerCase();

  if (entities.diseases.length || entities.symptoms.length) {
    if (/zararlı|zararli|pest|böcek|bocek/i.test(q)) return 'pest';
    return 'diagnosis';
  }

  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some((p) => p.test(q))) return intent;
  }

  return 'general';
}
