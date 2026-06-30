import { buildStrictLanguageBlock } from './conversation-language';

export class GeminiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly detail?: unknown
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

export interface GeminiTextResult {
  answer: string;
  provider: 'gemini';
  model: string;
}

const MIN_GEMINI_KEY_LENGTH = 20;

function resolveGeminiApiKey(): string | null {
  const key =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    null;

  if (!key || key.length < MIN_GEMINI_KEY_LENGTH) return null;

  return key;
}

function getGeminiApiKey(): string | null {
  return resolveGeminiApiKey();
}

export function getGeminiKeyStatus(): {
  configured: boolean;
  valid: boolean;
  prefix?: string;
  reason?: string;
} {
  const raw =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    '';

  if (!raw) {
    return { configured: false, valid: false, reason: 'GEMINI_API_KEY is not set' };
  }

  if (raw.length < MIN_GEMINI_KEY_LENGTH) {
    return {
      configured: true,
      valid: false,
      reason: `GEMINI_API_KEY is too short (minimum ${MIN_GEMINI_KEY_LENGTH} characters)`,
    };
  }

  return { configured: true, valid: true, prefix: raw.slice(0, 4) };
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableGeminiStatus(status?: number): boolean {
  return status === 429 || status === 503 || status === 500;
}

async function geminiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new GeminiError('Missing Gemini API key');
  }

  const baseUrl = `https://generativelanguage.googleapis.com/v1beta/${path}`;
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const authAttempts: Array<{ label: string; url: string; headers: Headers }> = [
    {
      label: 'query_key',
      url: `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}key=${encodeURIComponent(apiKey)}`,
      headers: new Headers(headers),
    },
    {
      label: 'header_key',
      url: baseUrl,
      headers: new Headers({ ...Object.fromEntries(headers), 'x-goog-api-key': apiKey }),
    },
    {
      label: 'bearer_token',
      url: baseUrl,
      headers: new Headers({ ...Object.fromEntries(headers), Authorization: `Bearer ${apiKey}` }),
    },
  ];

  let lastResponse: Response | null = null;
  for (const attempt of authAttempts) {
    const res = await fetch(attempt.url, { ...init, headers: attempt.headers });
    if (res.status !== 401) return res;
    lastResponse = res;
  }

  return lastResponse ?? fetch(baseUrl, { ...init, headers });
}

async function callGeminiGenerateContent(
  model: string,
  body: Record<string, unknown>,
  attempt = 1
): Promise<{ text: string; raw: unknown }> {
  const maxAttempts = 3;

  let res: Response;
  try {
    res = await geminiFetch(`models/${model}:generateContent`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    if (attempt < maxAttempts) {
      console.warn('[gemini] network retry', { attempt, model });
      await sleep(800 * attempt);
      return callGeminiGenerateContent(model, body, attempt + 1);
    }
    console.error('[gemini] fetch failed', { model, message });
    throw new GeminiError(`Gemini request failed: ${message}`);
  }

  let json: Record<string, unknown> | null = null;
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const errorObj = json?.error as { message?: string } | undefined;
    const message = errorObj?.message ?? `Gemini API error (${res.status})`;
    if (isRetryableGeminiStatus(res.status) && attempt < maxAttempts) {
      console.warn('[gemini] retryable error, retrying', { status: res.status, attempt, model });
      await sleep(1000 * attempt);
      return callGeminiGenerateContent(model, body, attempt + 1);
    }
    console.error('[gemini] generateContent failed', {
      status: res.status,
      model,
      error: errorObj,
    });
    throw new GeminiError(message, res.status, errorObj);
  }

  type GeminiCandidate = { content?: { parts?: Array<{ text?: string }> } };
  const candidates = json?.candidates as GeminiCandidate[] | undefined;
  const text = candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) {
    console.error('[gemini] empty response', { model, json });
    throw new GeminiError('Gemini returned no text');
  }

  return { text, raw: json };
}

export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey());
}

/** Smoke-test helper — lists available Gemini models. */
export async function listGeminiModels(): Promise<{ count: number }> {
  const res = await geminiFetch('models');
  if (!res.ok) {
    const body = await res.text();
    throw new GeminiError(`Models list failed (${res.status}): ${body.slice(0, 200)}`, res.status);
  }
  const json = (await res.json()) as { models?: unknown[] };
  return { count: json.models?.length ?? 0 };
}

export interface GeminiDoctorDiagnosis {
  diagnosis: string;
  symptoms: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  treatment: string;
  prevention: string;
  notes: string;
  possible_causes?: string;
  immediate_action?: string;
  expert_warning?: string;
}

export interface GeminiDoctorResult extends GeminiTextResult {
  diagnosis: GeminiDoctorDiagnosis;
  raw: unknown;
}

function parseRiskLevel(value: unknown): GeminiDoctorDiagnosis['risk_level'] {
  const level = String(value ?? 'medium').toLowerCase();
  if (level === 'low' || level === 'medium' || level === 'high' || level === 'critical') {
    return level;
  }
  return 'medium';
}

/**
 * Agriculture doctor prompt — structured JSON from Gemini Flash.
 */
export async function askGeminiAgricultureDoctor(
  question: string,
  focusCrops: string[] = [],
  language: 'tr' | 'en' = 'en',
  farmContextBlock = '',
  memoryContextBlock = ''
): Promise<GeminiDoctorResult> {
  const model = getGeminiModel();
  const trimmed = question.trim();

  if (!trimmed) {
    throw new GeminiError('Question is required');
  }

  const langInstruction =
    language === 'tr'
      ? 'Yanıtı TÜRKÇE ver. JSON değerleri de Türkçe olsun.'
      : 'Respond in ENGLISH. JSON values must be in English.';

  const strictLanguageBlock = buildStrictLanguageBlock(language);

  const cropInstruction =
    focusCrops.length > 0
      ? language === 'tr'
        ? `\nÇiftçinin ürünü: ${focusCrops.join(', ')}. Yalnızca bu ürün için yanıt ver; alakasız ürünlerden bahsetme.`
        : `\nThe farmer's crop is: ${focusCrops.join(', ')}. Answer ONLY for this crop. Do not mention unrelated crops.`
      : '';

  const prompt = [
    'You are Nertura Brain, an expert AI Agriculture Doctor for global farmers.',
    'Provide practical, safe, crop-specific agricultural guidance.',
    strictLanguageBlock,
    langInstruction,
    'Return JSON only with these keys:',
    'diagnosis (short diagnosis), possible_causes, risk_level (low|medium|high|critical),',
    'immediate_action (what to do now), treatment (treatment plan), prevention, expert_warning.',
    'Also include symptoms as alias for possible_causes if needed.',
    cropInstruction,
    farmContextBlock ? `\n${farmContextBlock}` : '',
    memoryContextBlock ? `\n${memoryContextBlock}` : '',
    '',
    `Question: ${trimmed}`,
  ].join('\n');

  console.info('[gemini] askGeminiAgricultureDoctor', { model, questionLength: trimmed.length });

  const { text, raw } = await callGeminiGenerateContent(model, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    console.error('[gemini] invalid JSON from agriculture doctor', { model, text: text.slice(0, 200) });
    throw new GeminiError('Gemini returned invalid JSON for agriculture doctor');
  }

  const diagnosis: GeminiDoctorDiagnosis = {
    diagnosis: String(parsed.diagnosis ?? '').trim() || text,
    symptoms: String(parsed.symptoms ?? parsed.possible_causes ?? '').trim(),
    possible_causes: String(parsed.possible_causes ?? parsed.symptoms ?? '').trim(),
    risk_level: parseRiskLevel(parsed.risk_level),
    immediate_action: String(parsed.immediate_action ?? '').trim(),
    treatment: String(parsed.treatment ?? '').trim(),
    prevention: String(parsed.prevention ?? '').trim(),
    notes: String(parsed.notes ?? parsed.expert_warning ?? '').trim(),
    expert_warning: String(parsed.expert_warning ?? parsed.notes ?? '').trim(),
  };

  return {
    answer: diagnosis.diagnosis,
    provider: 'gemini',
    model,
    diagnosis,
    raw,
  };
}

/**
 * Send a plain-text question to Gemini Flash (server-side only).
 */
export async function askGemini(question: string): Promise<GeminiTextResult> {
  const model = getGeminiModel();
  const trimmed = question.trim();

  if (!trimmed) {
    throw new GeminiError('Question is required');
  }

  console.info('[gemini] askGemini', { model, questionLength: trimmed.length });

  const { text } = await callGeminiGenerateContent(model, {
    contents: [{ parts: [{ text: trimmed }] }],
  });

  return {
    answer: text,
    provider: 'gemini',
    model,
  };
}

export async function analyzeWithGeminiVision(
  imageBase64: string,
  mimeType: string,
  question: string
): Promise<{ text: string; raw: unknown } | null> {
  if (!getGeminiApiKey()) return null;

  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
  const model = getGeminiModel();

  const prompt = [
    'You are an expert agricultural vision system. Analyze this plant photo BEFORE any disease diagnosis.',
    'Return JSON only with these keys:',
    'plant_species (common name), crop_category (olive|tomato|wheat|grape|potato|pepper|corn|citrus|lemon|cotton|rice|apple|unknown),',
    'confidence (0.0-1.0 how sure you are about plant species),',
    'visible_symptoms, possible_conditions (empty if unsure),',
    'image_quality (good|poor|unclear),',
    'needs_clarification (true if species unclear or image too blurry),',
    'clarification_questions (array of 1-2 short questions for the farmer).',
    'Never guess a crop if uncertain — set needs_clarification true and confidence below 0.5.',
    question ? `Farmer question context: ${question}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const { text, raw } = await callGeminiGenerateContent(model, {
      contents: [
        {
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: base64Data } },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });
    return { text, raw };
  } catch (err) {
    console.error('[gemini] vision analysis failed', {
      model,
      message: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
