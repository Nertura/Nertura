#!/usr/bin/env tsx
/**
 * Projects Engine smoke test — pnpm test:projects-engine
 */
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const TEXT_QUESTION = 'Domates yapraklarında sararma var, vaka testi.';
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function loadEnv(): void {
  const dashboard = resolve(process.cwd(), 'apps/dashboard/.env.local');
  if (existsSync(dashboard)) config({ path: dashboard });
  else config();
}

async function verifyMigrationSchema(supabase: SupabaseClient): Promise<Record<string, unknown>> {
  const checks: Record<string, unknown> = {};

  const { error: timelineErr } = await supabase.from('case_timeline_events').select('id').limit(1);
  checks.case_timeline_events = timelineErr ? timelineErr.message : 'ok';

  const { error: tasksErr } = await supabase.from('case_tasks').select('id').limit(1);
  checks.case_tasks = tasksErr ? tasksErr.message : 'ok';

  const { data: fieldCaseProbe, error: fieldCaseErr } = await supabase
    .from('field_cases')
    .select('progress, last_analysis_id, confidence, risk_level, crop_label')
    .limit(1);
  checks.field_cases_columns = fieldCaseErr
    ? fieldCaseErr.message
    : fieldCaseProbe !== null
      ? 'ok'
      : 'missing';

  const { data: analysisProbe, error: analysisErr } = await supabase
    .from('ai_analyses')
    .select('field_case_id')
    .limit(1);
  checks.ai_analyses_field_case_id = analysisErr
    ? analysisErr.message
    : analysisProbe !== null
      ? 'ok'
      : 'missing';

  return checks;
}

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  const report: Record<string, unknown> = {
    steps: [] as string[],
    success: false,
  };

  if (!url || !serviceKey) {
    report.error = 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY';
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const steps = report.steps as string[];

  steps.push('schema_verify');
  report.schema = await verifyMigrationSchema(supabase);
  const schemaOk = Object.values(report.schema as Record<string, string>).every((v) => v === 'ok');
  if (!schemaOk) {
    report.error = 'Migration schema verification failed';
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const { runIntelligenceEngine, answerToDiagnosis } = await import('../packages/ai/src/index.ts');
  const {
    syncCaseAfterDiagnosis,
    loadCaseOverview,
    buildCaseTimeline,
    appendCaseTimelineEvent,
    shouldAutoCreateFieldCase,
    linkDiagnosisToFieldCase,
    loadCaseList,
  } = await import('../apps/dashboard/src/lib/projects-engine/index.ts');
  const { validateImageInput } = await import('../packages/utils/src/image-validation.ts');

  const { data: membership, error: memberErr } = await supabase
    .from('memberships')
    .select('user_id, organization_id')
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle();

  if (memberErr || !membership) {
    report.error = memberErr?.message ?? 'No membership row found';
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const userId = membership.user_id as string;
  const organizationId = membership.organization_id as string;

  steps.push('create_field_case');
  const { data: fieldCase, error: caseErr } = await supabase
    .from('field_cases')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      status: 'open',
      raw_intake: TEXT_QUESTION,
      symptom: 'Sararma',
      intake_metadata: { crop: 'Domates' },
    })
    .select('id')
    .single();

  if (caseErr || !fieldCase) {
    report.error = caseErr?.message ?? 'Failed to create field case';
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const caseId = fieldCase.id as string;
  report.caseId = caseId;

  steps.push('doctor:intelligence_engine');
  const pipeline = await runIntelligenceEngine(supabase, { question: TEXT_QUESTION, language: 'tr' });
  const diagnosis = answerToDiagnosis(pipeline.answer, 'tr');
  if (!diagnosis.treatment) {
    diagnosis.treatment = 'Yaprakları inceleyin ve sulamayı ayarlayın.';
  }

  steps.push('image:upload');
  const validated = validateImageInput(TINY_PNG_BASE64, 'image/png');
  if (!validated.ok) throw new Error(validated.error);
  const imagePath = `${userId}/${Date.now()}-case-smoke.png`;
  const imageBuffer = Buffer.from(TINY_PNG_BASE64, 'base64');
  const { error: uploadErr } = await supabase.storage
    .from('analysis-images')
    .upload(imagePath, imageBuffer, { contentType: 'image/png', upsert: false });
  if (uploadErr) throw uploadErr;

  steps.push('doctor:save_conversation');
  const now = new Date().toISOString();
  const { data: conv, error: convErr } = await supabase
    .from('ai_conversations')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      title: TEXT_QUESTION.slice(0, 80),
      language: 'tr',
      metadata: { type: 'doctor', language: 'tr' },
    })
    .select('id')
    .single();
  if (convErr || !conv) throw convErr ?? new Error('Conversation insert failed');
  const conversationId = conv.id as string;

  const { error: msgErr } = await supabase.from('ai_messages').insert([
    {
      conversation_id: conversationId,
      organization_id: organizationId,
      user_id: userId,
      role: 'user',
      content: TEXT_QUESTION,
      metadata: { image_path: imagePath },
    },
    {
      conversation_id: conversationId,
      organization_id: organizationId,
      user_id: userId,
      role: 'assistant',
      content: diagnosis.diagnosis,
      metadata: { diagnosis },
    },
  ]);
  if (msgErr) throw msgErr;

  const { data: analysis, error: analysisErr } = await supabase
    .from('ai_analyses')
    .insert({
      conversation_id: conversationId,
      organization_id: organizationId,
      user_id: userId,
      question: TEXT_QUESTION,
      diagnosis: diagnosis.diagnosis,
      symptoms: diagnosis.symptoms,
      risk_level: diagnosis.risk_level,
      treatment: diagnosis.treatment,
      prevention: diagnosis.prevention,
      confidence: diagnosis.confidence,
      source: diagnosis.source,
      status: 'completed',
    })
    .select('id')
    .single();
  if (analysisErr || !analysis) throw analysisErr ?? new Error('Analysis insert failed');

  await supabase.from('analysis_images').insert({
    analysis_id: analysis.id,
    user_id: userId,
    storage_path: imagePath,
    mime_type: 'image/png',
  });

  const saved = {
    conversationId,
    analysisId: analysis.id as string,
    memoryEventId: null as string | null,
  };
  report.analysisId = saved.analysisId;
  report.conversationId = saved.conversationId;

  steps.push('bridge:sync_case_after_diagnosis');
  let bridgeThrew = false;
  try {
    await syncCaseAfterDiagnosis(supabase, {
      organizationId,
      userId,
      caseId,
      conversationId: saved.conversationId,
      analysisId: saved.analysisId,
      memoryEventId: saved.memoryEventId,
      diagnosis,
      imagePath,
      imageAnalysisId: saved.analysisId,
    });
  } catch (err) {
    bridgeThrew = true;
    report.bridgeError = err instanceof Error ? err.message : String(err);
  }
  report.bridgeNonFatal = !bridgeThrew;

  steps.push('verify:analysis_field_case_id');
  const { data: analysisRow } = await supabase
    .from('ai_analyses')
    .select('field_case_id')
    .eq('id', saved.analysisId)
    .single();
  report.analysisFieldCaseId = analysisRow?.field_case_id ?? null;

  steps.push('verify:timeline_events');
  const { data: timelineRows } = await supabase
    .from('case_timeline_events')
    .select('event_type')
    .eq('field_case_id', caseId);
  const eventTypes = [...new Set((timelineRows ?? []).map((r) => r.event_type as string))];
  report.timelineEventTypes = eventTypes;

  steps.push('verify:load_case_overview');
  const overview = await loadCaseOverview(supabase, organizationId, caseId);
  report.overview = overview
    ? {
        status: overview.status,
        crop: overview.crop,
        confidence: overview.confidence,
        riskLevel: overview.riskLevel,
        lastActivityAt: overview.lastActivityAt,
        currentDiagnosis: overview.currentDiagnosis?.slice(0, 80) ?? null,
      }
    : null;

  steps.push('verify:build_case_timeline');
  const timeline = await buildCaseTimeline(supabase, caseId);
  report.timelineCount = timeline.length;

  steps.push('verify:timeline_insert_non_fatal');
  const badInsert = await appendCaseTimelineEvent(supabase, {
    fieldCaseId: '00000000-0000-0000-0000-000000000000',
    organizationId,
    userId,
    eventType: 'note_added',
    title: 'Should fail gracefully',
  });
  report.timelineInsertReturnsNullOnFailure = badInsert === null;

  const requiredEvents = ['diagnosis_created', 'treatment_generated', 'photo_uploaded'];
  const missingEvents = requiredEvents.filter((t) => !eventTypes.includes(t));
  if (missingEvents.length > 0) {
    report.missingTimelineEvents = missingEvents;
  }

  steps.push('verify:should_auto_create');
  report.shouldAutoCreate = shouldAutoCreateFieldCase({
    question: TEXT_QUESTION,
    diagnosis,
    intent: 'diagnosis',
    hasImage: true,
  });

  steps.push('verify:timeline_dedupe');
  await syncCaseAfterDiagnosis(supabase, {
    organizationId,
    userId,
    caseId,
    conversationId: saved.conversationId,
    analysisId: saved.analysisId,
    diagnosis,
    imagePath,
    imageAnalysisId: saved.analysisId,
  });
  const { data: dedupeRows } = await supabase
    .from('case_timeline_events')
    .select('id')
    .eq('field_case_id', caseId)
    .eq('event_type', 'diagnosis_created')
    .eq('ref_table', 'ai_analyses')
    .eq('ref_id', saved.analysisId);
  report.timelineDiagnosisDeduped = (dedupeRows?.length ?? 0) === 1;

  steps.push('verify:auto_create_without_case_id');
  const autoQuestion = 'Domates yaprak lekeleri vaka otomatik oluşturma testi.';
  const autoPipeline = await runIntelligenceEngine(supabase, { question: autoQuestion, language: 'tr' });
  const autoDiagnosis = answerToDiagnosis(autoPipeline.answer, 'tr');
  if (!autoDiagnosis.treatment) {
    autoDiagnosis.treatment =
      'Yaprakları kontrol edin ve havalandırmayı artırın. Hafta sonra tekrar kontrol edin.';
  }

  const { data: autoConv } = await supabase
    .from('ai_conversations')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      title: autoQuestion.slice(0, 80),
      language: 'tr',
      metadata: { type: 'doctor' },
    })
    .select('id')
    .single();
  const autoConversationId = autoConv!.id as string;

  const { data: autoAnalysis } = await supabase
    .from('ai_analyses')
    .insert({
      conversation_id: autoConversationId,
      organization_id: organizationId,
      user_id: userId,
      question: autoQuestion,
      diagnosis: autoDiagnosis.diagnosis,
      treatment: autoDiagnosis.treatment,
      risk_level: autoDiagnosis.risk_level,
      confidence: autoDiagnosis.confidence,
      source: autoDiagnosis.source,
      status: 'completed',
    })
    .select('id')
    .single();

  const autoLink = await linkDiagnosisToFieldCase(supabase, {
    organizationId,
    userId,
    conversationId: autoConversationId,
    analysisId: autoAnalysis!.id as string,
    diagnosis: autoDiagnosis,
    intent: autoPipeline.intent,
    question: autoQuestion,
    hasImage: false,
  });
  report.autoCreateCaseId = autoLink.caseId;
  report.autoCreateLinked = autoLink.linked;
  report.autoCreateFlag = autoLink.autoCreated;

  steps.push('verify:case_list_loader');
  const caseList = await loadCaseList(supabase, {
    organizationId,
    userId,
    filter: 'all',
    search: 'domates',
  });
  report.caseListCount = caseList.length;
  report.caseListHasAuto = caseList.some((c) => c.id === autoLink.caseId);

  steps.push('verify:status_action');
  let statusUpdateOk = false;
  if (autoLink.caseId) {
    const { error: statusErr } = await supabase
      .from('field_cases')
      .update({ status: 'resolved', progress: 'closed', updated_at: new Date().toISOString() })
      .eq('id', autoLink.caseId);
    statusUpdateOk = !statusErr;
  }
  report.statusUpdateOk = statusUpdateOk;

  report.success =
    report.analysisFieldCaseId === caseId &&
    missingEvents.length === 0 &&
    Boolean(overview?.status) &&
    (timeline.length ?? 0) > 0 &&
    report.bridgeNonFatal === true &&
    report.timelineInsertReturnsNullOnFailure === true &&
    report.shouldAutoCreate === true &&
    report.timelineDiagnosisDeduped === true &&
    Boolean(autoLink.caseId) &&
    autoLink.linked === true &&
    autoLink.autoCreated === true &&
    report.caseListHasAuto === true &&
    statusUpdateOk === true;

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.success ? 0 : 1);
}

main().catch((err) => {
  console.log(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }, null, 2));
  process.exit(1);
});
