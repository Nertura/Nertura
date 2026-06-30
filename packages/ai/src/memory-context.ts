import type { IntelligenceContext } from './intelligence-engine';
import type { QueryLanguage } from './question-analyzer';

/** Format field memory, similar cases, and conversation for LLM prompts. */
export function formatMemoryContextForPrompt(
  context: IntelligenceContext | undefined,
  language: QueryLanguage = 'en'
): string {
  if (!context) return '';

  const blocks: string[] = [];
  const isTr = language === 'tr';

  if (context.conversationHistory?.length) {
    const recent = context.conversationHistory.slice(-8);
    const lines = recent
      .map((m) => `${m.role === 'user' ? (isTr ? 'Çiftçi' : 'Farmer') : 'Nertura'}: ${m.content.slice(0, 500)}`)
      .join('\n');
    blocks.push(
      isTr ? `--- Önceki konuşma ---\n${lines}` : `--- Recent conversation ---\n${lines}`
    );
  }

  if (context.diseaseHistory?.length) {
    const lines = context.diseaseHistory
      .slice(0, 5)
      .map(
        (h) =>
          `${h.crop}${h.disease ? ` / ${h.disease}` : ''}: ${h.occurrenceCount}x${
            h.lastOutcome ? ` (${h.lastOutcome})` : ''
          }`
      )
      .join('\n');
    blocks.push(
      isTr
        ? `--- Tarla hastalık geçmişi ---\n${lines}`
        : `--- Field disease history ---\n${lines}`
    );
  }

  if (context.similarCases?.length) {
    const lines = context.similarCases
      .slice(0, 4)
      .map((c) => `${c.crop ?? 'crop'}: ${c.diagnosis} (${Math.round(c.score * 100)}% match)`)
      .join('\n');
    blocks.push(
      isTr ? `--- Benzer vakalar ---\n${lines}` : `--- Similar cases ---\n${lines}`
    );
  }

  if (context.projectMemory?.length) {
    const names = context.projectMemory.map((p) => p.projectName).join(', ');
    blocks.push(isTr ? `--- Projeler ---\n${names}` : `--- Projects ---\n${names}`);
  }

  return blocks.filter(Boolean).join('\n\n');
}
