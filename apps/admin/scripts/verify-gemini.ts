#!/usr/bin/env npx tsx
/** Gemini + env integration verification (marketing .env.local) */
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '../marketing/.env.local') });

const TEST_QUESTIONS = [
  'zeytin ağacımda yaprak dökülmesi var',
  'domates yaprakları sararıyor',
  'limon ağacı yaprakları kıvrılıyor',
];

async function main() {
  const { getGeminiKeyStatus, isGeminiConfigured, runIntelligenceEngine, extractEntities } =
    await import('../../../packages/ai/src/index.ts');

  const geminiStatus = getGeminiKeyStatus();
  const report: Record<string, unknown> = {
    geminiKey: geminiStatus,
    isGeminiConfigured: isGeminiConfigured(),
    tests: [] as Array<Record<string, unknown>>,
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env missing');

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  for (const question of TEST_QUESTIONS) {
    const entry: Record<string, unknown> = { question };
    const entities = extractEntities(question);
    entry.detectedCrops = entities.crops;
    entry.language = entities.language;

    const pipeline = await runIntelligenceEngine(supabase, { question });
    entry.provider = pipeline.answer.source;
    entry.geminiMode = (pipeline.rawBrain as { mode?: string })?.mode;
    entry.diagnosisPreview = pipeline.answer.diagnosis.slice(0, 120);
    entry.isTurkish = /[çğıöşüÇĞİÖŞÜ]/.test(pipeline.answer.diagnosis);
    entry.cropMismatch =
      entities.crops.length > 0 &&
      pipeline.answer.matched_slug &&
      !entities.crops.some((c) => String(pipeline.answer.matched_slug).includes(c));

    (report.tests as unknown[]).push(entry);
  }

  const { count: providerCount } = await supabase
    .from('ai_provider_outputs')
    .select('id', { count: 'exact', head: true });
  const { count: memoryCount } = await supabase
    .from('ai_memory_events')
    .select('id', { count: 'exact', head: true });
  report.db = { ai_provider_outputs: providerCount ?? 0, ai_memory_events: memoryCount ?? 0 };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
