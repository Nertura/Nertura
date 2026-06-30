#!/usr/bin/env tsx
/**
 * Dashboard AI Doctor pipeline smoke test — pnpm test:dashboard-doctor
 */
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const TEXT_QUESTION = 'Domates yapraklarında sararma ve leke var, ne yapmalıyım?';
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

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
    geminiConfigured: (process.env.GEMINI_API_KEY?.trim() ?? '').length >= 20,
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    steps: [] as string[],
    success: false,
  };

  if (!url || !serviceKey) {
    report.error = 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY';
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const { runIntelligenceEngine, answerToDiagnosis } = await import('../packages/ai/src/index.ts');
  const { validateImageInput } = await import('../packages/utils/src/image-validation.ts');

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const steps = report.steps as string[];

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

  steps.push('usage_before');
  const { data: usageBeforeRow } = await supabase
    .from('user_usage_limits')
    .select('credits_balance, question_count')
    .eq('user_id', userId)
    .maybeSingle();
  report.usageBefore = usageBeforeRow;

  steps.push('text:intelligence_engine');
  const pipeline = await runIntelligenceEngine(supabase, { question: TEXT_QUESTION, language: 'tr' });
  const diagnosis = answerToDiagnosis(pipeline.answer, 'tr');
  report.textSource = diagnosis.source;

  steps.push('text:conversation_save');
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
  if (convErr) throw convErr;
  const conversationId = conv.id as string;

  const { error: msgErr } = await supabase.from('ai_messages').insert([
    { conversation_id: conversationId, organization_id: organizationId, user_id: userId, role: 'user', content: TEXT_QUESTION, metadata: {} },
    { conversation_id: conversationId, organization_id: organizationId, user_id: userId, role: 'assistant', content: diagnosis.diagnosis, metadata: { diagnosis } },
  ]);
  if (msgErr) throw msgErr;

  steps.push('text:history_read');
  const { data: messages } = await supabase
    .from('ai_messages')
    .select('id, role')
    .eq('conversation_id', conversationId);
  report.textMessageCount = messages?.length ?? 0;

  steps.push('text:usage_debit');
  const { data: debitText, error: debitTextErr } = await supabase.rpc('debit_user_credit', {
    p_user_id: userId,
    p_description: 'smoke test text',
    p_reference_id: conversationId,
  });
  if (debitTextErr) throw debitTextErr;
  report.textDebit = debitText;

  steps.push('image:validation');
  const validated = validateImageInput(TINY_PNG_BASE64, 'image/png');
  if (!validated.ok) throw new Error(validated.error);

  steps.push('image:upload');
  const imagePath = `${userId}/${Date.now()}-smoke.png`;
  const imageBuffer = Buffer.from(TINY_PNG_BASE64, 'base64');
  const { error: uploadErr } = await supabase.storage
    .from('analysis-images')
    .upload(imagePath, imageBuffer, { contentType: 'image/png', upsert: false });
  if (uploadErr) throw uploadErr;
  report.imagePath = imagePath;

  steps.push('image_text:intelligence_engine');
  const imageQuestion = 'Bu fotoğraftaki bitki sorununu analiz eder misin?';
  const pipelineImage = await runIntelligenceEngine(supabase, {
    question: imageQuestion,
    imageBase64: TINY_PNG_BASE64,
    imageMimeType: 'image/png',
    language: 'tr',
  });

  steps.push('image_text:conversation_append');
  const diagnosisImage = answerToDiagnosis(pipelineImage.answer, 'tr');
  const { error: appendErr } = await supabase.from('ai_messages').insert([
    { conversation_id: conversationId, organization_id: organizationId, user_id: userId, role: 'user', content: imageQuestion, metadata: { image_path: imagePath } },
    { conversation_id: conversationId, organization_id: organizationId, user_id: userId, role: 'assistant', content: diagnosisImage.diagnosis, metadata: { diagnosis: diagnosisImage } },
  ]);
  if (appendErr) throw appendErr;

  const { data: historyAfter } = await supabase
    .from('ai_messages')
    .select('id')
    .eq('conversation_id', conversationId);
  report.historyMessageCount = historyAfter?.length ?? 0;

  steps.push('image:usage_debit');
  const { data: debitImage, error: debitImageErr } = await supabase.rpc('debit_user_credit', {
    p_user_id: userId,
    p_description: 'smoke test image',
    p_reference_id: conversationId,
  });
  if (debitImageErr) throw debitImageErr;
  report.imageDebit = debitImage;

  const { data: usageAfterRow } = await supabase
    .from('user_usage_limits')
    .select('credits_balance, question_count')
    .eq('user_id', userId)
    .maybeSingle();
  report.usageAfter = usageAfterRow;

  report.conversationId = conversationId;
  report.success =
    Boolean(conversationId) &&
    (messages?.length ?? 0) >= 2 &&
    Boolean(imagePath) &&
    (historyAfter?.length ?? 0) >= 4;

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.success ? 0 : 1);
}

main().catch((err) => {
  console.error(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err), cause: err }, null, 2));
  process.exit(1);
});
