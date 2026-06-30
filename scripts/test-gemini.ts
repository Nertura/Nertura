#!/usr/bin/env tsx
/**
 * Gemini production smoke test — pnpm test:gemini
 * Loads GEMINI_API_KEY from apps/marketing/.env.local (falls back to dashboard).
 */
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const QUESTION = 'Zeytin ağacında yaprak dökülmesi neden olur?';
const DOCTOR_URL = process.env.DOCTOR_TEST_URL ?? 'http://localhost:3000/api/doctor';

function loadEnv(): void {
  const marketing = resolve(process.cwd(), 'apps/marketing/.env.local');
  const dashboard = resolve(process.cwd(), 'apps/dashboard/.env.local');
  if (existsSync(marketing)) config({ path: marketing });
  else if (existsSync(dashboard)) config({ path: dashboard });
  else config();
}

async function listGeminiModelsWithLatency(key: string): Promise<{ count: number; latencyMs: number }> {
  const start = Date.now();
  process.env.GEMINI_API_KEY = key;
  const { listGeminiModels } = await import('../packages/ai/src/index.ts');
  const result = await listGeminiModels();
  return { count: result.count, latencyMs: Date.now() - start };
}

async function main() {
  loadEnv();

  const key = process.env.GEMINI_API_KEY?.trim() ?? '';
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';

  const report: Record<string, unknown> = {
    keyDetected: key.length >= 20,
    keyPrefix: key ? key.slice(0, 4) : null,
    model,
    success: false,
  };

  if (key.length < 20) {
    report.error = 'Missing Gemini API key (minimum 20 characters)';
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const {
    getGeminiKeyStatus,
    isGeminiConfigured,
    askGeminiAgricultureDoctor,
    runIntelligenceEngine,
  } = await import('../packages/ai/src/index.ts');

  report.keyStatus = getGeminiKeyStatus();
  report.isGeminiConfigured = isGeminiConfigured();

  let models: { count: number; latencyMs: number } | null = null;
  try {
    models = await listGeminiModelsWithLatency(key);
    report.modelsListLatencyMs = models.latencyMs;
    report.modelsCount = models.count;
    report.modelsListOk = true;
  } catch (err) {
    report.modelsListOk = false;
    report.modelsListError = err instanceof Error ? err.message.slice(0, 200) : String(err);
  }

  const directStart = Date.now();
  let direct;
  try {
    direct = await askGeminiAgricultureDoctor(QUESTION, ['olive'], 'tr');
  } catch (err) {
    report.directGeminiError = err instanceof Error ? err.message : String(err);
    report.success = false;
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  report.directGeminiLatencyMs = Date.now() - directStart;
  report.directProvider = direct.provider;
  report.directModel = direct.model;
  report.directDiagnosisPreview = direct.diagnosis.diagnosis.slice(0, 120);

  const pipelineStart = Date.now();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { count: memoryBefore } = await supabase
    .from('ai_memory_events')
    .select('id', { count: 'exact', head: true });

  const pipeline = await runIntelligenceEngine(supabase, { question: QUESTION });
  report.pipelineLatencyMs = Date.now() - pipelineStart;
  report.pipelineProvider = pipeline.answer.source;
  report.pipelineMode = (pipeline.rawBrain as { mode?: string })?.mode;
  report.pipelineDiagnosisPreview = pipeline.answer.diagnosis.slice(0, 120);

  const { count: memoryAfter } = await supabase
    .from('ai_memory_events')
    .select('id', { count: 'exact', head: true });
  report.memoryEventsBefore = memoryBefore ?? 0;
  report.memoryEventsAfter = memoryAfter ?? 0;

  let doctorStatus = 0;
  let doctorProvider: string | null = null;
  let doctorPersisted = false;
  let doctorMemoryEventId: string | null = null;
  const doctorStart = Date.now();

  try {
    const res = await fetch(DOCTOR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: QUESTION }),
    });
    doctorStatus = res.status;
    if (res.ok) {
      const json = (await res.json()) as {
        provider?: string;
        persisted?: boolean;
        memoryEventId?: string | null;
        diagnosis?: { source?: string };
      };
      doctorProvider = json.provider ?? json.diagnosis?.source ?? null;
      doctorPersisted = Boolean(json.persisted);
      doctorMemoryEventId = json.memoryEventId ?? null;
    }
  } catch (err) {
    report.doctorEndpointError = err instanceof Error ? err.message : String(err);
  }

  report.doctorEndpointLatencyMs = Date.now() - doctorStart;
  report.doctorEndpointStatus = doctorStatus;
  report.doctorEndpointProvider = doctorProvider;
  report.doctorEndpointPersisted = doctorPersisted;
  report.doctorEndpointMemoryEventId = doctorMemoryEventId;

  const directOk = direct.provider === 'gemini';
  const notFallback = pipeline.answer.source !== 'fallback';
  const doctorOk = doctorStatus === 200;
  const memoryOk = doctorPersisted && Boolean(doctorMemoryEventId);

  report.providerUsed = direct.provider;
  report.responseLatencyMs = report.directGeminiLatencyMs;
  report.success = directOk && notFallback && doctorOk && memoryOk;

  report.checks = {
    keyDetected: key.length >= 20,
    directProviderGemini: directOk,
    pipelineNotFallback: notFallback,
    doctorEndpoint200: doctorOk,
    memoryPersisted: memoryOk,
  };

  if (pipeline.answer.source === 'knowledge_base') {
    report.note =
      'Pipeline returned knowledge_base because KB confidence ≥ 0.78 for this crop. Direct Gemini call confirms API works.';
  }

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.success ? 0 : 1);
}

main().catch((err) => {
  console.error(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }, null, 2));
  process.exit(1);
});
