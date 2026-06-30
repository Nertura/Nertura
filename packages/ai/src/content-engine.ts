import { buildEvidenceCards } from './evidence-cards';
import { extractEntities } from './entity-extractor';
import { classifyIntent } from './intent-classifier';
import { askGemini, isGeminiConfigured } from './gemini';
import { formatKnowledgeContext } from './knowledge-context';
import { analyzeQuestion } from './question-analyzer';
import {
  searchKnowledgeItems,
  type KnowledgeSearchClient,
} from './knowledge-search';
import { DOCTOR_DISCLAIMER } from './types';
import type { EvidenceCard } from './types-intelligence';

export interface ContentCitation {
  slug: string;
  title: string;
  score: number;
  type?: string;
}

export interface ContentDraftResult {
  script: string;
  citations: ContentCitation[];
  evidenceCards: EvidenceCard[];
  provider: 'intelligence_engine' | 'knowledge_bank_only';
  format: string;
  topic: string;
}

const FORMAT_INSTRUCTIONS: Record<string, string> = {
  blog: 'Write a 400–600 word blog article with headings, intro, body, and conclusion.',
  instagram_caption: 'Write an Instagram caption (max 2200 chars) with hook, value, CTA, and 5–8 hashtags.',
  instagram_carousel: 'Write a 5-slide Instagram carousel script (slide title + bullet points each).',
  reels_script: 'Write a 30–45 second Reels script with hook, problem, insight, CTA.',
  tiktok_script: 'Write a 30–60 second TikTok script with hook, quick tips, CTA.',
  youtube_shorts: 'Write a YouTube Shorts script (under 60 seconds spoken).',
  youtube_long_outline: 'Write a YouTube long-form video outline (sections + key talking points).',
  linkedin: 'Write a professional LinkedIn post (150–250 words) with insight and soft CTA.',
  x_post: 'Write an X/Twitter post thread (3–5 posts, each under 280 chars).',
  newsletter: 'Write a newsletter section (subject line + 300–400 word body + CTA).',
};

function formatLabel(format: string): string {
  return format.replace(/_/g, ' ');
}

function buildCitations(
  hits: Awaited<ReturnType<typeof searchKnowledgeItems>>
): ContentCitation[] {
  return hits.slice(0, 8).map((h) => ({
    slug: h.slug,
    title: h.name_en || h.name_tr || h.slug,
    score: h.score,
    type: h.type,
  }));
}

function formatCitationsBlock(citations: ContentCitation[]): string {
  if (!citations.length) {
    return '\n\n---\n**Citations:** No Knowledge Bank matches — expert review required before publish.\n';
  }
  const lines = citations.map(
    (c, i) => `${i + 1}. [${c.slug}] ${c.title} (match ${Math.round(c.score * 100)}%)`
  );
  return `\n\n---\n**Knowledge Bank citations (review required):**\n${lines.join('\n')}\n`;
}

function knowledgeOnlyDraft(
  topic: string,
  format: string,
  kbContext: string,
  citations: ContentCitation[],
  evidenceCards: EvidenceCard[]
): string {
  const instruction = FORMAT_INSTRUCTIONS[format] ?? `Write ${formatLabel(format)} content.`;
  return [
    `# ${formatLabel(format)} — DRAFT (review required)`,
    '',
    `**Topic:** ${topic}`,
    '',
    instruction,
    '',
    '## Knowledge Bank context',
    kbContext || '_No matching Knowledge Bank records — add citations manually after expert review._',
    '',
    '## Evidence summary',
    evidenceCards
      .map((c) => `- **${c.title}:** ${c.summary}`)
      .join('\n') || '_No evidence cards generated._',
    '',
    '**Safety:** Do not publish treatment or pesticide dosage without expert review.',
    DOCTOR_DISCLAIMER,
    formatCitationsBlock(citations),
    '',
    '_Placeholders: image generation · video · voiceover — not connected yet._',
  ].join('\n');
}

/**
 * Generate agriculture content through Nertura Intelligence Engine + Knowledge Bank.
 * All output is draft/review only — never auto-publish.
 */
export async function runContentIntelligence(
  supabase: KnowledgeSearchClient,
  topic: string,
  format: string
): Promise<ContentDraftResult> {
  const trimmed = topic.trim();
  const { language } = analyzeQuestion(trimmed);
  const entities = extractEntities(trimmed);
  const intent = classifyIntent(trimmed, entities);
  const knowledgeHits = await searchKnowledgeItems(supabase, trimmed);
  const kbContext = formatKnowledgeContext(knowledgeHits);
  const citations = buildCitations(knowledgeHits);
  const evidenceCards = buildEvidenceCards({
    language,
    intent,
    entities,
    knowledgeHits,
    topHit: knowledgeHits[0],
  });

  const instruction = FORMAT_INSTRUCTIONS[format] ?? `Write ${formatLabel(format)} content.`;
  const citationHint = citations.length
    ? citations.map((c) => `[Citation: ${c.slug}]`).join(' ')
    : 'No KB citations available — use general educational tone only.';

  if (!isGeminiConfigured()) {
    return {
      script: knowledgeOnlyDraft(trimmed, format, kbContext, citations, evidenceCards),
      citations,
      evidenceCards,
      provider: 'knowledge_bank_only',
      format,
      topic: trimmed,
    };
  }

  const prompt = [
    'You are the Nertura Content Engine — trusted global agriculture education.',
    'Write content that educates farmers and attracts users to Nertura AI Doctor.',
    '',
    `Format: ${formatLabel(format)}`,
    `Instruction: ${instruction}`,
    `Topic: ${trimmed}`,
    '',
    'RULES:',
    '- Use Knowledge Bank context below for factual agriculture claims.',
    `- Include inline citation markers like ${citationHint.split(' ')[0] ?? '[Citation: slug]'}.`,
    '- Do NOT specify pesticide dosages or chemical rates.',
    '- Add a short safety disclaimer at the end.',
    '- Mark output as DRAFT for human review.',
    '',
    'KNOWLEDGE BANK CONTEXT:',
    kbContext || '(none — use cautious general guidance only)',
    '',
    'Write the draft now:',
  ].join('\n');

  try {
    const gemini = await askGemini(prompt);
    const script = [
      `# ${formatLabel(format)} — DRAFT (review required)`,
      '',
      gemini.answer.trim(),
      '',
      '---',
      '**Safety disclaimer:** Educational content only. Confirm treatment advice with a local agronomist.',
      DOCTOR_DISCLAIMER,
      formatCitationsBlock(citations),
      '',
      '**Evidence cards (Nertura Intelligence Engine):**',
      evidenceCards.map((c) => `- ${c.title}: ${c.summary}`).join('\n') || '_none_',
      '',
      '_Placeholders: image generation · video · voiceover — not connected yet._',
    ].join('\n');

    return {
      script,
      citations,
      evidenceCards,
      provider: 'intelligence_engine',
      format,
      topic: trimmed,
    };
  } catch {
    return {
      script: knowledgeOnlyDraft(trimmed, format, kbContext, citations, evidenceCards),
      citations,
      evidenceCards,
      provider: 'knowledge_bank_only',
      format,
      topic: trimmed,
    };
  }
}
