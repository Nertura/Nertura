#!/usr/bin/env tsx
/**
 * Vision + Turkish language lock — pnpm test:doctor-vision-language
 */
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const QUERIES = [
  { id: 'yellow-leaf', question: 'bu yaprak neden sarardı' },
  { id: 'disease-what', question: 'bu hastalık nedir' },
  { id: 'blurry', question: 'bu fotoğraftaki bitki sorununu analiz eder misin' },
] as const;

function loadEnv(): void {
  const dashboard = resolve(process.cwd(), 'apps/dashboard/.env.local');
  if (existsSync(dashboard)) config({ path: dashboard });
  else config();
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const failures: string[] = [];
  const results: Record<string, unknown> = {};

  const {
    runIntelligenceEngine,
    collectDoctorVisibleText,
    findEnglishLeaks,
    formatVisionSummaryForEvidence,
    parseVisionAnalysis,
  } = await import('../packages/ai/src/pipeline.ts');

  const englishVision = parseVisionAnalysis(
    '{"plant_species":"Tomato","confidence":0.55,"observations":"Yellow leaves with brown spots","possible_conditions":"Early blight or nutrient deficiency","image_quality":"poor"}'
  );
  const trSummary = formatVisionSummaryForEvidence(englishVision, 'tr');
  if (trSummary && findEnglishLeaks(trSummary).length) {
    failures.push(`unit-vision-summary: English in TR evidence: ${findEnglishLeaks(trSummary).join(',')}`);
  }
  results.unitVisionSummary = trSummary?.slice(0, 200);

  if (!url || !serviceKey) {
    failures.push('Missing Supabase env for integration tests');
    console.log(JSON.stringify({ success: false, failures, results }, null, 2));
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  for (const item of QUERIES) {
    const pipeline = await runIntelligenceEngine(supabase, {
      question: item.question,
      imageBase64: TINY_PNG_BASE64,
      imageMimeType: 'image/png',
      language: 'tr',
    });

    const visible = collectDoctorVisibleText(pipeline.answer);
    const leaks = findEnglishLeaks(visible);
    const evidenceText = (pipeline.evidenceCards ?? [])
      .map((c) => `${c.title}\n${c.summary}`)
      .join('\n');
    const evidenceLeaks = findEnglishLeaks(evidenceText);

    results[item.id] = {
      source: pipeline.answer.source,
      diagnosisPreview: pipeline.answer.diagnosis?.slice(0, 160),
      leaks,
      evidenceLeaks,
    };

    if (leaks.length) failures.push(`${item.id}: answer leaks ${leaks.join(',')}`);
    if (evidenceLeaks.length) failures.push(`${item.id}: evidence leaks ${evidenceLeaks.join(',')}`);
  }

  const report = { success: failures.length === 0, failures, results };
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.success ? 0 : 1);
}

main().catch((err) => {
  console.error(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }));
  process.exit(1);
});
