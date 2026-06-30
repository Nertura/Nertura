import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

import {
  GeminiError,
  answerToDiagnosis,
  disclaimerForLanguage,
  resolveDoctorLanguage,
  runIntelligenceEngine,
  extractEntities,
  userFacingUploadError,
} from '@nertura/ai';

import { saveGuestDoctorSession } from '@/lib/guest-doctor';
import { getDashboardRegisterUrl, dashboardContextFromRequest } from '@/lib/app-urls';
import { saveIntelligenceData } from '@/lib/intelligence-persistence';
import { findSimilarMemoryEvents } from '@/lib/similar-cases';
import { validateImageInput } from '@/lib/image-validation';
import {
  GUEST_COUNT_COOKIE,
  GUEST_ID_COOKIE,
  getGuestUsageFromCookie,
  getGuestUsageFromDb,
  incrementGuestUsageDb,
} from '@/lib/guest-usage';
import { checkRateLimit } from '@/lib/rate-limit';
import { createPublicClient, tryCreateAdminClient } from '@/lib/supabase/admin';

const bodySchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().uuid().optional(),
  imageBase64: z.string().optional(),
  imageMimeType: z.string().optional(),
});

function signupUrl(request: Request): string {
  return getDashboardRegisterUrl({ next: '/doctor' }, dashboardContextFromRequest(request));
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const rate = checkRateLimit(`guest-doctor:${ip}`);
    if (!rate.ok) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    const cookieStore = await cookies();
    let guestId = cookieStore.get(GUEST_ID_COOKIE)?.value;
    const isNewGuest = !guestId;
    if (!guestId) guestId = crypto.randomUUID();

    const admin = tryCreateAdminClient();
    const countCookie = cookieStore.get(GUEST_COUNT_COOKIE)?.value;

    const usage = admin
      ? await getGuestUsageFromDb(admin, guestId)
      : getGuestUsageFromCookie(countCookie);

    if (usage.remaining <= 0) {
      return NextResponse.json(
        {
          error: 'Please create an account to continue.',
          limitReached: true,
          usage,
          signupUrl: signupUrl(request),
        },
        { status: 402 }
      );
    }

    const body = bodySchema.parse(await request.json());
    const question = body.message.trim();

    let imageBase64: string | undefined;
    let imageMimeType: string | undefined;
    if (body.imageBase64) {
      const validated = validateImageInput(body.imageBase64, body.imageMimeType ?? null);
      if (!validated.ok) {
        console.error('[marketing/doctor] image validation failed', {
          code: validated.code,
          technical: validated.error,
        });
        return NextResponse.json(
          { error: userFacingUploadError(validated.code, 'tr'), retryable: true },
          { status: 400 }
        );
      }
      imageBase64 = validated.data;
      imageMimeType = validated.mime;
    }

    console.info('[doctor] knowledge-bank request', {
      questionLength: question.length,
      hasImage: Boolean(body.imageBase64),
    });

    const supabase = createPublicClient();
    const entities = extractEntities(question);
    const similarCases = admin
      ? await findSimilarMemoryEvents(admin, {
          crop: entities.crops[0] ?? null,
          disease: entities.diseases[0] ?? null,
          limit: 3,
        }).catch(() => [])
      : [];

    const conversationLanguage = resolveDoctorLanguage({
      question,
      acceptLanguage: request.headers.get('accept-language'),
    });

    const pipeline = await runIntelligenceEngine(
      supabase,
      { question, imageBase64, imageMimeType, language: conversationLanguage },
      { similarCases }
    );

    const diagnosis = {
      ...answerToDiagnosis(pipeline.answer),
      disclaimer: disclaimerForLanguage(conversationLanguage),
      language: conversationLanguage,
    };

    let conversationId: string | undefined = body.conversationId;
    let userMessageId = crypto.randomUUID();
    let assistantMessageId = crypto.randomUUID();
    let analysisId: string | null = null;
    let memoryEventId: string | null = null;
    let persisted = false;
    let persistError: string | null = null;

    if (admin) {
      try {
        const saved = await saveGuestDoctorSession(admin, {
          guestId,
          conversationId: body.conversationId,
          question,
          diagnosis,
          pipeline,
        });
        conversationId = saved.conversationId;
        userMessageId = saved.userMessageId;
        assistantMessageId = saved.assistantMessageId;
        analysisId = saved.analysisId;
        persisted = true;

        const intel = await saveIntelligenceData(admin, {
          conversationId: saved.conversationId,
          analysisId: saved.analysisId,
          guestId,
          assistantMessageId: saved.assistantMessageId,
          intelligence: pipeline,
        });
        memoryEventId = intel.memoryEventId;
      } catch (saveErr) {
        persistError = saveErr instanceof Error ? saveErr.message : 'Failed to save conversation';
        console.error('[doctor] saveGuestDoctorSession failed:', persistError);
      }

      try {
        await incrementGuestUsageDb(admin, guestId);
      } catch (usageErr) {
        console.error('[doctor] incrementGuestUsageDb failed:', usageErr);
      }
    }

    const newUsed = usage.used + 1;
    const newUsage = {
      used: newUsed,
      limit: usage.limit,
      remaining: Math.max(0, usage.limit - newUsed),
    };

    const now = new Date().toISOString();

    console.info('[doctor] success', {
      source: diagnosis.source,
      kbHits: pipeline.knowledgeHits.length,
      topScore: pipeline.knowledgeHits[0]?.score ?? 0,
      persisted,
    });

    const response = NextResponse.json({
      conversationId: conversationId ?? null,
      analysisId,
      memoryEventId,
      intent: pipeline.intent,
      entities: pipeline.entities,
      evidenceCards: pipeline.evidenceCards,
      diagnosis,
      provider: diagnosis.source,
      knowledgeHits: pipeline.knowledgeHits.map((h) => ({
        slug: h.slug,
        type: h.type,
        score: h.score,
      })),
      usage: newUsage,
      limitReached: newUsage.remaining <= 0,
      persisted,
      persistError,
      message: {
        id: assistantMessageId,
        role: 'assistant' as const,
        content: diagnosis.diagnosis,
        created_at: now,
        diagnosis,
        analysisId,
        memoryEventId,
        evidenceCards: pipeline.evidenceCards,
      },
      userMessage: {
        id: userMessageId,
        role: 'user' as const,
        content: question,
        created_at: now,
      },
      signupUrl: signupUrl(request),
    });

    if (isNewGuest) {
      response.cookies.set(GUEST_ID_COOKIE, guestId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }

    if (!admin) {
      response.cookies.set(GUEST_COUNT_COOKIE, String(newUsed), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }

    return response;
  } catch (err) {
    if (err instanceof GeminiError) {
      console.error('[doctor] gemini error', {
        message: err.message,
        status: err.status,
        detail: err.detail,
      });
      const retryable = err.status === 503 || err.status === 429;
      return NextResponse.json(
        {
          error: retryable
            ? 'Gemini is experiencing high demand. Please try again in a moment.'
            : 'AI service temporarily unavailable.',
          retryable,
          provider: 'gemini',
        },
        { status: retryable ? 503 : 502 }
      );
    }

    const message = err instanceof Error ? err.message : 'Request failed';
    console.error('[doctor] unexpected error', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
