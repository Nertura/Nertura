import { NextResponse } from 'next/server';

import { z } from 'zod';

import { isImageOnlySubmission, userFacingUploadError } from '@nertura/ai';

import type { DoctorDiagnosis } from '@nertura/types';

import { getDashboardContext } from '@/lib/auth/context';
import {
  logDoctorFailure,
  logDoctorStep,
  userFacingDoctorError,
  type DoctorPipelineStep,
} from '@/lib/ai/doctor-errors';
import {
  answerToDiagnosis,
  formatDiagnosisMessage,
  runDoctorAnalysis,
  saveDoctorConversation,
  saveImageAttachmentConversation,
  uploadAnalysisImage,
} from '@/lib/ai/doctor-service';
import { loadConversationHistoryForPrompt, signedImageUrl } from '@/lib/ai/conversations';
import { resolveLockedConversationLanguage } from '@/lib/ai/conversation-language-service';
import { validateImageInput } from '@/lib/ai/image-validation';
import { checkRateLimit } from '@/lib/ai/rate-limit';
import { getUserUsage, incrementUserUsage } from '@/lib/ai/usage-limits';
import {
  buildCaseContextBlock,
  linkDiagnosisToFieldCase,
  loadCaseOverview,
} from '@/lib/projects-engine';
import { createClient } from '@/lib/supabase/server';

const bodySchema = z
  .object({
    conversationId: z.string().uuid().optional(),
    message: z.string().max(4000).optional(),
    imageBase64: z.string().optional(),
    imageMimeType: z.string().optional(),
    fieldId: z.string().uuid().optional(),
    caseId: z.string().uuid().optional(),
  })
  .refine((data) => Boolean(data.message?.trim()) || Boolean(data.imageBase64), {
    message: 'Message or image is required',
  });

async function runStep<T>(
  step: DoctorPipelineStep,
  detail: Record<string, unknown> | undefined,
  fn: () => Promise<T>
): Promise<T> {
  logDoctorStep(step, detail);
  try {
    return await fn();
  } catch (err) {
    logDoctorFailure(step, err, detail);
    throw err;
  }
}

export async function POST(request: Request) {
  let step: DoctorPipelineStep = 'request_received';
  let conversationLanguage: import('@nertura/ai').ConversationLanguage = 'tr';

  try {
    logDoctorStep('request_received', {
      contentType: request.headers.get('content-type'),
    });

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const rate = checkRateLimit(`doctor:${ip}`);
    if (!rate.ok) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait and try again.', errorCode: 'rate_limited', step: 'request_received', retryable: true },
        { status: 429, headers: rate.retryAfter ? { 'Retry-After': String(rate.retryAfter) } : {} }
      );
    }

    step = 'usage_check';
    const ctx = await getDashboardContext();
    const body = bodySchema.parse(await request.json());
    const supabase = await createClient();

    const usage = await runStep('usage_check', { userId: ctx.userId }, () =>
      getUserUsage(supabase, ctx.userId, ctx.organizationId)
    );

    if (usage.limitReached) {
      return NextResponse.json(
        {
          error: 'Analiz hakkınız kalmadı.',
          errorCode: 'usage_limit',
          step: 'usage_check',
          limitReached: true,
          usage: { used: usage.used, limit: usage.limit, remaining: 0, credits: usage.credits ?? 0 },
        },
        { status: 402 }
      );
    }

    const question = (body.message ?? '').trim();
    conversationLanguage = await resolveLockedConversationLanguage({
      supabase,
      request,
      userId: ctx.userId,
      organizationId: ctx.organizationId,
      conversationId: body.conversationId,
      userMessage: question,
    });

    let imageBase64: string | null = null;
    let imageMimeType: string | null = null;
    let imagePath: string | null = null;
    const hasImage = Boolean(body.imageBase64);

    if (hasImage) {
      step = 'image_validation';
      const validated = validateImageInput(body.imageBase64!, body.imageMimeType ?? null);
      if (!validated.ok) {
        logDoctorFailure('image_validation', new Error(validated.error), { code: validated.code });
        return NextResponse.json(
          {
            error: userFacingUploadError(validated.code, conversationLanguage),
            errorCode: 'image_validation',
            step: 'image_validation',
            retryable: true,
          },
          { status: 400 }
        );
      }
      imageBase64 = validated.data;
      imageMimeType = validated.mime;
      logDoctorStep('image_validation', { mime: imageMimeType, bytes: imageBase64.length });
    }

    if (isImageOnlySubmission(question, hasImage)) {
      step = 'image_upload';
      imagePath = await runStep('image_upload', { userId: ctx.userId }, () =>
        uploadAnalysisImage(supabase, ctx.userId, imageBase64!, imageMimeType!)
      );

      step = 'conversation_save';
      const saved = await runStep('conversation_save', { imageOnly: true }, () =>
        saveImageAttachmentConversation(supabase, {
          organizationId: ctx.organizationId,
          userId: ctx.userId,
          conversationId: body.conversationId,
          imagePath: imagePath!,
          language: conversationLanguage,
        })
      );

      const userImageUrl = await signedImageUrl(supabase, imagePath);
      const now = new Date().toISOString();

      logDoctorStep('complete', { conversationId: saved.conversationId, imageOnly: true });

      return NextResponse.json({
        conversationId: saved.conversationId,
        imageOnly: true,
        language: conversationLanguage,
        usage: {
          used: usage.used,
          limit: usage.limit,
          remaining: usage.remaining,
          credits: usage.credits,
        },
        message: {
          id: crypto.randomUUID(),
          role: 'assistant' as const,
          content: saved.assistantContent,
          created_at: now,
        },
        userMessage: { imageUrl: userImageUrl },
      });
    }

    if (!question) {
      return NextResponse.json({ error: 'Message is required', errorCode: 'unknown', step }, { status: 400 });
    }

    if (imagePath == null && imageBase64 && imageMimeType) {
      step = 'image_upload';
      imagePath = await runStep('image_upload', { userId: ctx.userId }, () =>
        uploadAnalysisImage(supabase, ctx.userId, imageBase64!, imageMimeType!)
      );
    }

    const conversationHistory = body.conversationId
      ? await loadConversationHistoryForPrompt(supabase, body.conversationId, ctx.userId)
      : [];

    let caseContextBlock: string | undefined;
    if (body.caseId) {
      const caseOverview = await loadCaseOverview(supabase, ctx.organizationId, body.caseId);
      caseContextBlock = buildCaseContextBlock(caseOverview);
    }

    step = 'intelligence_engine';
    const pipeline = await runStep('intelligence_engine', {
      hasImage,
      fieldId: body.fieldId ?? null,
      caseId: body.caseId ?? null,
      historyLength: conversationHistory.length,
    }, () =>
      runDoctorAnalysis(supabase, {
        question,
        imageBase64,
        imageMimeType,
        userId: ctx.userId,
        organizationId: ctx.organizationId,
        fieldId: body.fieldId,
        caseContextBlock,
        conversationHistory,
        language: conversationLanguage,
      })
    );

    logDoctorStep('intelligence_engine', {
      source: pipeline.answer.source,
      kbHits: pipeline.knowledgeHits.length,
      intent: pipeline.intent,
    });

    const diagnosis: DoctorDiagnosis = {
      ...answerToDiagnosis(pipeline.answer),
      language: conversationLanguage,
    };

    step = 'conversation_save';
    const saved = await runStep('conversation_save', {
      conversationId: body.conversationId ?? null,
      hasImage: Boolean(imagePath),
    }, () =>
      saveDoctorConversation(supabase, {
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        conversationId: body.conversationId,
        question,
        diagnosis,
        pipeline,
        imagePath,
        imageMimeType,
        language: conversationLanguage,
      })
    );

    step = 'usage_debit';
    try {
      await runStep('usage_debit', { userId: ctx.userId }, () =>
        incrementUserUsage(supabase, ctx.userId)
      );
    } catch (debitErr) {
      logDoctorFailure('usage_debit', debitErr, { conversationId: saved.conversationId });
      // Analysis already saved — do not fail the farmer-facing response.
    }

    const updatedUsage = await getUserUsage(supabase, ctx.userId, ctx.organizationId);
    const newUsage = {
      used: updatedUsage.used,
      limit: updatedUsage.limit,
      remaining: updatedUsage.remaining,
      credits: updatedUsage.credits,
    };

    let fieldCaseLinked = false;
    let resolvedCaseId: string | null = body.caseId ?? null;
    let caseAutoCreated = false;

    step = 'field_case_link';
    try {
      const linkResult = await linkDiagnosisToFieldCase(supabase, {
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        conversationId: saved.conversationId,
        analysisId: saved.analysisId,
        memoryEventId: saved.memoryEventId,
        diagnosis,
        intent: pipeline.intent,
        question,
        hasImage: Boolean(imagePath),
        imagePath,
        explicitCaseId: body.caseId,
        fieldId: body.fieldId,
        existingConversationId: body.conversationId,
      });
      resolvedCaseId = linkResult.caseId;
      fieldCaseLinked = linkResult.linked;
      caseAutoCreated = linkResult.autoCreated;
      if (fieldCaseLinked) {
        logDoctorStep('field_case_link', { caseId: resolvedCaseId, autoCreated: caseAutoCreated });
      }
    } catch (linkErr) {
      logDoctorFailure('field_case_link', linkErr, { caseId: body.caseId ?? null });
    }

    try {
      await supabase.rpc('log_auth_event', {
        p_action: 'ai.doctor',
        p_category: 'ai',
        p_organization_id: ctx.organizationId,
        p_metadata: {
          conversation_id: saved.conversationId,
          source: diagnosis.source,
          intent: pipeline.intent,
          field_case_id: resolvedCaseId,
          language: conversationLanguage,
        },
      });
    } catch {
      // optional audit RPC
    }

    const userImageUrl = imagePath ? await signedImageUrl(supabase, imagePath) : null;

    const caseSavedNote =
      conversationLanguage === 'tr'
        ? '**Bu vaka takip ediliyor.** Yeni teşhis ve öneriler vaka dosyanıza kaydedildi.\n\n'
        : '**This case is being tracked.** New diagnosis and recommendations were saved to your case file.\n\n';

    const assistantContent = fieldCaseLinked
      ? `${caseSavedNote}${formatDiagnosisMessage(diagnosis)}`
      : formatDiagnosisMessage(diagnosis);

    const now = new Date().toISOString();

    logDoctorStep('complete', {
      conversationId: saved.conversationId,
      analysisId: saved.analysisId,
      source: diagnosis.source,
    });

    return NextResponse.json({
      conversationId: saved.conversationId,
      analysisId: saved.analysisId,
      memoryEventId: saved.memoryEventId,
      fieldCaseLinked,
      caseAutoCreated,
      caseId: resolvedCaseId,
      intent: pipeline.intent,
      entities: pipeline.entities,
      evidenceCards: pipeline.evidenceCards,
      diagnosis,
      language: conversationLanguage,
      usage: newUsage,
      message: {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: assistantContent,
        created_at: now,
        diagnosis,
        analysisId: saved.analysisId,
        memoryEventId: saved.memoryEventId,
        evidenceCards: pipeline.evidenceCards,
      },
      userMessage: { imageUrl: userImageUrl },
    });
  } catch (err) {
    const facing = userFacingDoctorError(err, conversationLanguage);
    logDoctorFailure(facing.step, err, { code: facing.code });
    return NextResponse.json(
      {
        error: facing.message,
        errorCode: facing.code,
        step: facing.step,
        retryable: facing.retryable,
        ...(facing.detail ? { detail: facing.detail } : {}),
      },
      { status: facing.code === 'rate_limited' ? 429 : facing.code === 'usage_limit' ? 402 : 400 }
    );
  }
}
