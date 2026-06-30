#!/usr/bin/env tsx
/**
 * AI Doctor Turkish language lock — pnpm test:doctor-language
 * Tests engine output + evidence labels for Turkish queries (dashboard path).
 */
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const TEXT_QUERIES = [
  {
    id: 'cucumber-ankara',
    question: 'salatalık yetiştirmek istiyorum ankarada yetişirmi',
    expectGrowing: true,
    rejectDiseaseOnly: true,
  },
  {
    id: 'olive-balcony',
    question: 'yaprakları solmaya başlayan balkonda bir zeytinim var',
    expectCropHint: /zeytin|olive/i,
  },
  {
    id: 'tomato-spots',
    question: 'domates yapraklarında kahverengi lekeler var ne yapmalıyım',
    expectCropHint: /domates|tomato/i,
  },
] as const;

const EVIDENCE_TITLES_TR = [
  'Bilgi Bankası',
  'Tarla Profili',
  'Hava',
  'Benzer Vakalar',
  'Görsel Analiz',
];

function loadEnv(): void {
  const dashboard = resolve(process.cwd(), 'apps/dashboard/.env.local');
  if (existsSync(dashboard)) config({ path: dashboard });
  else config();
}

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  const report: Record<string, unknown> = {
    steps: [] as string[],
    queries: {} as Record<string, unknown>,
    unitNormalizer: null as unknown,
    failures: [] as string[],
    success: false,
  };

  const failures = report.failures as string[];
  const steps = report.steps as string[];

  const {
    runIntelligenceEngine,
    normalizeDoctorAnswerLanguage,
    collectDoctorVisibleText,
    findEnglishLeaks,
    BANNED_ENGLISH_VISIBLE_PATTERNS,
  } = await import('../packages/ai/src/pipeline.ts');

  steps.push('unit:english-kb-simulation');
  const simulatedEnglish = normalizeDoctorAnswerLanguage(
    {
      diagnosis: 'Cucumber: Greenhouse cucumber.',
      symptoms: 'Not specified',
      risk_level: 'low',
      treatment: 'Photograph symptoms; isolate affected leaves if spreading.',
      prevention: 'Regular monitoring and balanced care.',
      notes: 'Knowledge Bank match',
      confidence: 0.9,
      source: 'knowledge_base',
      disclaimer: 'AI advice does not replace expert.',
      sections: {
        short_diagnosis: 'Cucumber: Greenhouse cucumber.',
        possible_causes: 'Not specified',
        risk_level: 'low',
        immediate_action: 'Photograph symptoms; isolate affected leaves.',
        treatment_plan: 'Monitor plants closely.',
        prevention: 'Regular monitoring.',
        expert_warning: 'Consult local expert.',
      },
    },
    'tr'
  );
  const simVisible = collectDoctorVisibleText(simulatedEnglish);
  const simLeaks = findEnglishLeaks(simVisible);
  report.unitNormalizer = {
    diagnosisPreview: simulatedEnglish.diagnosis?.slice(0, 120),
    leaks: simLeaks,
  };
  if (simLeaks.length) {
    failures.push(`unit-normalizer: English leaks after normalization: ${simLeaks.join(', ')}`);
  }

  if (!url || !serviceKey) {
    failures.push('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    report.success = false;
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const queries = report.queries as Record<string, unknown>;

  for (const item of TEXT_QUERIES) {
    steps.push(`engine:${item.id}`);
    const pipeline = await runIntelligenceEngine(supabase, {
      question: item.question,
      language: 'tr',
    });

    const visible = collectDoctorVisibleText(pipeline.answer);
    const leaks = findEnglishLeaks(visible);
    const evidenceLeaks: string[] = [];

    for (const card of pipeline.evidenceCards ?? []) {
      const cardText = `${card.title}\n${card.summary}`;
      for (const re of BANNED_ENGLISH_VISIBLE_PATTERNS) {
        if (re.test(cardText)) evidenceLeaks.push(`${card.type}:${String(re)}`);
      }
      if (/No farm records|Knowledge Bank|Confidence:/i.test(cardText)) {
        evidenceLeaks.push(`${card.type}:english-label`);
      }
    }

    const entry: Record<string, unknown> = {
      source: pipeline.answer.source,
      diagnosisPreview: pipeline.answer.diagnosis?.slice(0, 180),
      leaks,
      evidenceLeaks,
    };

    if (leaks.length) failures.push(`${item.id}: answer leaks: ${leaks.join(', ')}`);
    if (evidenceLeaks.length) failures.push(`${item.id}: evidence leaks: ${evidenceLeaks.join(', ')}`);

    if ('expectGrowing' in item && item.expectGrowing) {
      if (!/yetiştirilebilir|Ankara/i.test(pipeline.answer.diagnosis ?? '')) {
        failures.push(`${item.id}: missing growing/Ankara context in diagnosis`);
      }
      if (/külleme|mildiyö|fungisit/i.test(visible) && item.rejectDiseaseOnly) {
        failures.push(`${item.id}: cultivation question returned disease-focused answer`);
      }
    }

    if ('expectCropHint' in item && item.expectCropHint) {
      if (!item.expectCropHint.test(visible)) {
        failures.push(`${item.id}: answer does not reference expected crop context`);
      }
    }

    const trTitles = pipeline.evidenceCards?.filter((c) =>
      EVIDENCE_TITLES_TR.some((t) => c.title.includes(t) || c.title === t)
    );
    entry.evidenceTitleSample = pipeline.evidenceCards?.slice(0, 3).map((c) => c.title);
    if ((pipeline.evidenceCards?.length ?? 0) > 0 && (trTitles?.length ?? 0) === 0) {
      failures.push(`${item.id}: evidence card titles not Turkish`);
    }

    queries[item.id] = entry;
  }

  steps.push('engine:image-turkish');
  const imageQuestion = 'Bu fotoğraftaki bitki sorununu analiz eder misin?';
  const imagePipeline = await runIntelligenceEngine(supabase, {
    question: imageQuestion,
    imageBase64: TINY_PNG_BASE64,
    imageMimeType: 'image/png',
    language: 'tr',
  });
  const imageVisible = collectDoctorVisibleText(imagePipeline.answer);
  const imageLeaks = findEnglishLeaks(imageVisible);
  queries['image-turkish'] = {
    source: imagePipeline.answer.source,
    diagnosisPreview: imagePipeline.answer.diagnosis?.slice(0, 180),
    leaks: imageLeaks,
  };
  if (imageLeaks.length) {
    failures.push(`image-turkish: answer leaks: ${imageLeaks.join(', ')}`);
  }

  report.success = failures.length === 0;
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.success ? 0 : 1);
}

main().catch((err) => {
  console.error(
    JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }, null, 2)
  );
  process.exit(1);
});
