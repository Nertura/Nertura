import type { AgricultureIntent } from './intent-classifier';
import type { ExtractedEntities } from './entity-extractor';
import type { EvidenceCard } from './types-intelligence';
import type { RankedSimilarCase } from './similar-case-ranking';
import type { KnowledgeHit } from './types';

export type { EvidenceCardType } from './types-intelligence';

interface BuildEvidenceInput {
  language: 'tr' | 'en';
  intent: AgricultureIntent;
  entities: ExtractedEntities;
  knowledgeHits: KnowledgeHit[];
  topHit?: KnowledgeHit;
  visionSummary?: string | null;
  similarCases?: RankedSimilarCase[];
  hasConversationHistory?: boolean;
  farmMemory?: Array<{ farmName: string; location?: string | null; crops?: string[]; siteType?: string | null }>;
  farmProfile?: import('./farm-profile').FarmIntelligenceProfile | null;
  projectMemory?: Array<{ projectName: string }>;
  diseaseHistory?: Array<{ crop: string; disease: string | null; occurrenceCount: number; lastOutcome?: string | null }>;
  weather?: {
    location?: string | null;
    temperature?: number | null;
    humidity?: number | null;
    rainfall?: number | null;
    climateZone?: string | null;
  } | null;
}

export function buildEvidenceCards(input: BuildEvidenceInput): EvidenceCard[] {
  const cards: EvidenceCard[] = [];
  const isTr = input.language === 'tr';

  if (input.topHit || input.knowledgeHits.length) {
    const hit = input.topHit ?? input.knowledgeHits[0];
    cards.push({
      type: 'knowledge_bank',
      title: isTr ? 'Bilgi Bankası' : 'Knowledge Bank',
      summary: isTr
        ? hit
          ? `${hit.name_tr} — eşleşme skoru ${Math.round(hit.score * 100)}%`
          : `${input.knowledgeHits.length} bilgi kaydı bulundu`
        : hit
          ? `${hit.name_en} — match score ${Math.round(hit.score * 100)}%`
          : `${input.knowledgeHits.length} knowledge records found`,
      confidence: hit?.score,
      source: hit?.slug,
      metadata: { hits: input.knowledgeHits.slice(0, 5).map((h) => ({ slug: h.slug, score: h.score })) },
    });
  }

  if (input.farmMemory?.length || input.farmProfile) {
    const profile = input.farmProfile;
    const loc = profile?.locationLabel ?? profile?.city ?? null;
    const crops = profile?.crops?.join(', ') ?? input.farmMemory?.[0]?.crops?.join(', ');
    cards.push({
      type: 'farm_memory',
      title: isTr ? 'Tarla Profili' : 'Farm Profile',
      summary: profile
        ? isTr
          ? `${profile.organizationName}${loc ? ` — ${loc}` : ''}${crops ? `. Ürünler: ${crops}` : ''}`
          : `${profile.organizationName}${loc ? ` — ${loc}` : ''}${crops ? `. Crops: ${crops}` : ''}`
        : isTr
          ? `${input.farmMemory!.length} kayıtlı çiftlik: ${input.farmMemory!.map((f) => f.farmName).join(', ')}`
          : `${input.farmMemory!.length} saved farm(s): ${input.farmMemory!.map((f) => f.farmName).join(', ')}`,
      metadata: { farms: input.farmMemory, profile },
    });
  } else {
    cards.push({
      type: 'farm_memory',
      title: isTr ? 'Tarla Profili' : 'Farm Profile',
      summary: isTr
        ? 'Henüz tarla profili eklenmedi.'
        : 'No farm records yet — general guidance applied.',
    });
  }

  if (input.projectMemory?.length) {
    cards.push({
      type: 'project_memory',
      title: isTr ? 'Proje Hafızası' : 'Project Memory',
      summary: isTr
        ? `${input.projectMemory.length} proje: ${input.projectMemory.map((p) => p.projectName).join(', ')}`
        : `${input.projectMemory.length} project(s): ${input.projectMemory.map((p) => p.projectName).join(', ')}`,
      metadata: { projects: input.projectMemory },
    });
  }

  if (input.diseaseHistory?.length) {
    const match = input.diseaseHistory.find(
      (h) =>
        input.entities.crops.some((c) => c === h.crop) ||
        (h.disease && input.entities.diseases.includes(h.disease))
    );
    cards.push({
      type: 'disease_history',
      title: isTr ? 'Hastalık Geçmişi' : 'Disease History',
      summary: match
        ? isTr
          ? `${match.crop}${match.disease ? ` / ${match.disease}` : ''} — ${match.occurrenceCount} kez görüldü${match.lastOutcome ? `, son sonuç: ${match.lastOutcome}` : ''}`
          : `${match.crop}${match.disease ? ` / ${match.disease}` : ''} — seen ${match.occurrenceCount} time(s)${match.lastOutcome ? `, last: ${match.lastOutcome}` : ''}`
        : isTr
          ? `${input.diseaseHistory.length} hastalık kaydı mevcut.`
          : `${input.diseaseHistory.length} disease record(s) on file.`,
      metadata: { history: input.diseaseHistory.slice(0, 5) },
    });
  }

  if (input.hasConversationHistory) {
    cards.push({
      type: 'conversation_history',
      title: isTr ? 'Konuşma Geçmişi' : 'Conversation History',
      summary: isTr
        ? 'Önceki mesajlar bağlam olarak kullanıldı.'
        : 'Previous messages used as context.',
    });
  }

  if (input.visionSummary) {
    const summary =
      input.visionSummary === '[object Object]'
        ? null
        : input.visionSummary.trim();
    if (summary) {
      cards.push({
        type: 'image_analysis',
        title: isTr ? 'Fotoğraf Analizi' : 'Image Analysis',
        summary: summary.slice(0, 400),
        confidence: 0.7,
      });
    }
  }

  const w = input.weather;
  const profileLoc = input.farmProfile?.locationLabel ?? input.farmProfile?.city;
  cards.push({
    type: 'weather_regional',
    title: isTr ? 'Hava ve Bölgesel Risk' : 'Weather',
    summary: isTr
      ? w?.temperature != null
        ? `${w.location ?? profileLoc ?? 'Konum'}: ${w.temperature}°C, nem %${w.humidity ?? '—'}, yağış ${w.rainfall ?? '—'} mm`
        : profileLoc
          ? `${profileLoc} — bölgesel iklim profili onboarding'den yüklendi; canlı hava verisi yakında.`
          : w?.location
            ? `${w.location} — hava verisi yakında eklenecek.`
            : 'Konum belirtilmedi — mevsimsel risk değerlendirmesi uygulandı.'
      : w?.temperature != null
        ? `${w.location ?? profileLoc ?? 'Location'}: ${w.temperature}°C, humidity ${w.humidity ?? '—'}%, rain ${w.rainfall ?? '—'} mm`
        : profileLoc
          ? `${profileLoc} — regional climate profile loaded from onboarding; live weather coming soon.`
          : w?.location
            ? `${w.location} — weather data coming soon.`
            : 'No location — seasonal risk assessment applied.',
    metadata: {
      location: w?.location ?? profileLoc ?? input.entities.location,
      climateZone: w?.climateZone ?? input.entities.season,
      temperature: w?.temperature,
      humidity: w?.humidity,
      rainfall: w?.rainfall,
      placeholder: w?.temperature == null,
    },
  });

  if (input.similarCases?.length) {
    const top = input.similarCases[0];
    cards.push({
      type: 'similar_cases',
      title: isTr ? 'Benzer Vakalar' : 'Similar Cases',
      summary: isTr
        ? `${input.similarCases.length} vaka — en iyi eşleşme: ${top?.crop ?? '?'}${top?.outcome ? ` (${top.outcome})` : ''}, skor ${Math.round((top?.score ?? 0) * 100)}%`
        : `${input.similarCases.length} case(s) — best: ${top?.crop ?? '?'}${top?.outcome ? ` (${top.outcome})` : ''}, score ${Math.round((top?.score ?? 0) * 100)}%`,
      confidence: top?.score,
      metadata: { cases: input.similarCases },
    });
  }

  return cards;
}
