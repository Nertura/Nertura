/**
 * Intelligence engine smoke test — run: pnpm --filter @nertura/ai exec tsx scripts/test-intelligence.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in env.
 */
import { createClient } from '@supabase/supabase-js';

import {
  classifyIntent,
  extractEntities,
  runIntelligenceEngine,
} from '../src/intelligence-engine';

const QUERIES = [
  'zeytin ağacımda yaprak dökülmesi var',
  'domates yaprakları sararıyor',
  'limon ağacı yaprakları kıvrılıyor',
  'üzümde külleme var mı',
];

const EXPECTED: Record<string, { crop: string; lang: 'tr' | 'en' }> = {
  'zeytin ağacımda yaprak dökülmesi var': { crop: 'olive', lang: 'tr' },
  'domates yaprakları sararıyor': { crop: 'tomato', lang: 'tr' },
  'limon ağacı yaprakları kıvrılıyor': { crop: 'lemon', lang: 'tr' },
  'üzümde külleme var mı': { crop: 'grape', lang: 'tr' },
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, key);
  let passed = 0;

  for (const q of QUERIES) {
    const entities = extractEntities(q);
    const intent = classifyIntent(q, entities);
    const result = await runIntelligenceEngine(supabase, { question: q });
    const exp = EXPECTED[q]!;
    const cropOk = entities.crops.includes(exp.crop as never);
    const langOk = result.entities.language === exp.lang;
    const structured = Boolean(result.answer.sections?.short_diagnosis);
    const evidence = result.evidenceCards.length >= 2;
    const topSlug = result.knowledgeHits[0]?.slug ?? 'none';

    const ok = cropOk && langOk && structured && evidence;
    if (ok) passed++;

    console.log('\n---');
    console.log('Q:', q);
    console.log('Intent:', intent);
    console.log('Crops:', entities.crops, cropOk ? '✓' : '✗');
    console.log('Language:', result.entities.language, langOk ? '✓' : '✗');
    console.log('Top KB:', topSlug, 'score:', result.knowledgeHits[0]?.score ?? 0);
    console.log('Structured:', structured ? '✓' : '✗');
    console.log('Evidence cards:', result.evidenceCards.length, evidence ? '✓' : '✗');
    console.log('Memory event crop:', result.memoryEvent.crop);
    console.log('Provider:', result.providerUsed);
  }

  console.log(`\n=== ${passed}/${QUERIES.length} passed ===`);
  process.exit(passed === QUERIES.length ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
