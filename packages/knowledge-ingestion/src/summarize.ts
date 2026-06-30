import { askGemini, isGeminiConfigured } from '@nertura/ai';

import type { IngestionSummaryResult } from './types';

const SAFETY_PREAMBLE = `
You are a knowledge ingestion assistant for Nertura agriculture platform.
RULES:
- Summarize ONLY from the provided source text.
- Do NOT invent pesticide dosages, chemical rates, or medical/agronomic prescriptions.
- Flag uncertainty explicitly.
- Output valid JSON only.
- Treat vocabulary references (AGROVOC) as term normalization, NOT treatment advice.
`;

export async function summarizeIngestionItem(input: {
  title: string;
  normalizedText: string;
  citation: string;
  sourceUrl?: string | null;
  crop?: string | null;
  disease?: string | null;
}): Promise<IngestionSummaryResult | null> {
  if (!isGeminiConfigured()) return null;

  const prompt = `${SAFETY_PREAMBLE}

Source citation: ${input.citation}
Source URL: ${input.sourceUrl ?? 'n/a'}

Title: ${input.title}

Source text:
"""
${input.normalizedText.slice(0, 6000)}
"""

Return JSON:
{
  "shortSummary": "2-4 sentences",
  "crop": "string or null",
  "disease": "string or null",
  "pest": "string or null",
  "symptom": "string or null",
  "riskLevel": "low|medium|high|critical",
  "suggestedCategory": "disease|pest|crop|soil|vocabulary|other",
  "citations": ["array of citation strings"],
  "uncertaintyNotes": "what is uncertain or vocabulary-only",
  "proposedKnowledgeItem": {
    "title": "proposed KB title",
    "category": "category slug",
    "crop": "optional",
    "disease": "optional",
    "content": "draft content for reviewer — NO unsourced claims",
    "source": "citation string",
    "language": "en"
  }
}`;

  try {
    const result = await askGemini(prompt);
    const parsed = extractJson(result.answer);
    if (!parsed) return null;
    return validateSummary(parsed, input);
  } catch {
    return null;
  }
}

function extractJson(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function validateSummary(
  raw: Record<string, unknown>,
  input: { title: string; citation: string }
): IngestionSummaryResult {
  const risk = String(raw.riskLevel ?? 'medium');
  const riskLevel = ['low', 'medium', 'high', 'critical'].includes(risk)
    ? (risk as IngestionSummaryResult['riskLevel'])
    : 'medium';

  const proposed = (raw.proposedKnowledgeItem as Record<string, unknown>) ?? {};

  return {
    shortSummary: String(raw.shortSummary ?? input.title),
    crop: raw.crop != null ? String(raw.crop) : null,
    disease: raw.disease != null ? String(raw.disease) : null,
    pest: raw.pest != null ? String(raw.pest) : null,
    symptom: raw.symptom != null ? String(raw.symptom) : null,
    riskLevel,
    suggestedCategory: String(raw.suggestedCategory ?? 'other'),
    citations: Array.isArray(raw.citations)
      ? raw.citations.map(String)
      : [input.citation],
    uncertaintyNotes: String(
      raw.uncertaintyNotes ?? 'Requires human review before publication.'
    ),
    proposedKnowledgeItem: {
      title: String(proposed.title ?? input.title),
      category: String(proposed.category ?? 'reference'),
      crop: proposed.crop ?? null,
      disease: proposed.disease ?? null,
      content: String(proposed.content ?? ''),
      source: String(proposed.source ?? input.citation),
      language: String(proposed.language ?? 'en'),
      requires_review: true,
      auto_ingested: true,
    },
  };
}

export { isGeminiConfigured };
