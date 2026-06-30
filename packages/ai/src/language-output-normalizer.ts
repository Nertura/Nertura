import type { QueryLanguage } from './question-analyzer';
import type { DoctorAnswer, KnowledgeHit } from './types';
import {
  detectMessageLanguage,
  resolveInitialConversationLanguage,
  type ConversationLanguage,
} from './conversation-language';

const ENGLISH_LEAK_PATTERNS = [
  /\bCucumber\b/i,
  /\bPhotograph symptoms\b/i,
  /\bisolate affected leaves\b/i,
  /\bKnowledge Bank\b/i,
  /\bConfidence\b/i,
  /\bGreenhouse cucumber\b/i,
  /\bMonitor plants\b/i,
  /\bRegular monitoring\b/i,
  /\bNot specified\b/i,
  /\bShort diagnosis\b/i,
  /\bWhat to do today\b/i,
  /\bSHORT DIAGNOSIS\b/i,
  /\bWHAT TO DO TODAY\b/i,
  /\bGeneral guidance\b/i,
  /\bNo farm records yet\b/i,
];

export { ENGLISH_LEAK_PATTERNS as BANNED_ENGLISH_VISIBLE_PATTERNS };

export function resolveDoctorLanguage(input: {
  question: string;
  language?: ConversationLanguage | null;
  acceptLanguage?: string | null;
  profileLanguage?: string | null;
}): ConversationLanguage {
  return (
    input.language ??
    detectMessageLanguage(input.question) ??
    resolveInitialConversationLanguage({
      messageLanguage: detectMessageLanguage(input.question),
      acceptLanguage: input.acceptLanguage,
      profileLanguage: input.profileLanguage,
    })
  );
}

export function pickLocalizedKbName(hit: KnowledgeHit, language: QueryLanguage): string {
  if (language === 'tr') {
    return hit.name_tr?.trim() || '';
  }
  return hit.name_en?.trim() || hit.name_tr?.trim() || '';
}

export function pickLocalizedKbSummary(hit: KnowledgeHit, language: QueryLanguage): string {
  if (language === 'tr') {
    return hit.summary_tr?.trim() || '';
  }
  return hit.summary_en?.trim() || hit.summary_tr?.trim() || '';
}

/** Direct KB serve only when Turkish body exists — never fall back to English fields. */
export function canServeKbDirectly(hit: KnowledgeHit, language: QueryLanguage): boolean {
  if (language === 'tr') {
    return Boolean(hit.summary_tr?.trim() && hit.name_tr?.trim());
  }
  return Boolean(hit.summary_en?.trim() || hit.name_tr?.trim() || hit.name_en?.trim());
}

function looksEnglish(text: string): boolean {
  if (!text.trim()) return false;
  if (ENGLISH_LEAK_PATTERNS.some((re) => re.test(text))) return true;
  const turkishChars = /[çğıöşüÇĞİÖŞÜ]/;
  if (turkishChars.test(text)) return false;
  const englishWords =
    /\b(the|and|for|with|your|plant|leaves|symptoms|treatment|monitor|field|crop|disease|apply|use|when|should|please|upload|photo|yellow|brown|spots|blight|deficiency|early|nutrient)\b/i;
  return englishWords.test(text);
}

/** True when text likely contains English farmer-visible content. */
export function containsFarmerVisibleEnglish(text: string): boolean {
  return looksEnglish(text) || ENGLISH_LEAK_PATTERNS.some((re) => re.test(text));
}

function trExpertFooter(): string {
  return 'AI tavsiyesi sertifikalı bir tarım uzmanının yerini almaz.';
}

function enExpertFooter(): string {
  return 'AI advice does not replace a certified agricultural expert.';
}

export function disclaimerForLanguage(language: ConversationLanguage): string {
  return language === 'tr' ? trExpertFooter() : enExpertFooter();
}

/** Strip English leakage from visible doctor fields when target is Turkish. */
export function normalizeDoctorAnswerLanguage(
  answer: DoctorAnswer,
  target: ConversationLanguage
): DoctorAnswer {
  if (target !== 'tr') {
    return { ...answer, language: target, disclaimer: disclaimerForLanguage(target) };
  }

  const fields = [
    answer.diagnosis,
    answer.symptoms,
    answer.treatment,
    answer.prevention,
    answer.notes,
    answer.formatted,
    answer.sections?.short_diagnosis,
    answer.sections?.possible_causes,
    answer.sections?.immediate_action,
    answer.sections?.treatment_plan,
    answer.sections?.prevention,
    answer.sections?.expert_warning,
  ].filter(Boolean) as string[];

  const hasLeak = fields.some(looksEnglish);
  if (!hasLeak) {
    return {
      ...answer,
      language: 'tr',
      disclaimer: disclaimerForLanguage('tr'),
    };
  }

  const safe = (text: string | undefined, fallback: string) => {
    if (!text?.trim() || looksEnglish(text)) return fallback;
    return text;
  };

  const sections = answer.sections
    ? {
        ...answer.sections,
        short_diagnosis: safe(
          answer.sections.short_diagnosis,
          'Fotoğrafa ve tarif ettiğiniz belirtiye göre en olası durum değerlendiriliyor. Kesin teşhis için yerel uzmana danışın.'
        ),
        possible_causes: safe(answer.sections.possible_causes, 'Belirtiler tek başına birçok nedene işaret edebilir.'),
        immediate_action: safe(
          answer.sections.immediate_action,
          'Bitkileri yakından gözlemleyin; belirtiler yayılıyorsa net bir fotoğraf çekip tekrar sorun.'
        ),
        treatment_plan: safe(answer.sections.treatment_plan, 'Yerel iklim ve ürün rehberine göre bakım planı oluşturun.'),
        prevention: safe(answer.sections.prevention, 'Düzenli gözlem, dengeli sulama ve uygun gübreleme yapın.'),
        expert_warning: safe(
          answer.sections.expert_warning,
          'Tarla koşulları değişkendir. Kesin teşhis için yerel ziraat mühendisine danışın.'
        ),
      }
    : undefined;

  return {
    ...answer,
    language: 'tr',
    disclaimer: disclaimerForLanguage('tr'),
    diagnosis: sections?.short_diagnosis ?? safe(answer.diagnosis, answer.diagnosis),
    symptoms: sections?.possible_causes ?? safe(answer.symptoms, answer.symptoms),
    treatment: sections
      ? `${sections.immediate_action}\n\n${sections.treatment_plan}`.trim()
      : safe(answer.treatment, answer.treatment),
    prevention: sections?.prevention ?? safe(answer.prevention, answer.prevention),
    notes: sections?.expert_warning ?? safe(answer.notes, answer.notes),
    sections,
  };
}

const TR_CITIES: Array<{ re: RegExp; label: string }> = [
  { re: /ankara/i, label: 'Ankara' },
  { re: /istanbul/i, label: 'İstanbul' },
  { re: /izmir/i, label: 'İzmir' },
  { re: /antalya/i, label: 'Antalya' },
  { re: /adana/i, label: 'Adana' },
  { re: /bursa/i, label: 'Bursa' },
  { re: /konya/i, label: 'Konya' },
  { re: /osmaniye/i, label: 'Osmaniye' },
];

function extractTurkishLocation(question: string): string | null {
  for (const { re, label } of TR_CITIES) {
    if (re.test(question)) return label;
  }
  return null;
}

export function buildTurkishKbDiagnosis(nameTr: string, summaryTr: string, question: string): string {
  const q = question.toLowerCase();
  const isGrowingQuestion = /yetiş|yetis|dikim|ekim|yetiştir|yetistir|yetişir|yetisir/.test(q);
  const location = extractTurkishLocation(question);
  const cropLabel = nameTr.toLowerCase();

  if (isGrowingQuestion && location) {
    return `${location}'da ${cropLabel} yetiştirilebilir. Açık alanda en uygun dönem don riskinin geçtiği ilkbahar sonu ve yaz aylarıdır. Serada ise daha uzun süre üretim yapılabilir.`;
  }

  if (isGrowingQuestion) {
    return `${nameTr} Türkiye'de açık alanda ilkbahar sonu ve yaz aylarında, serada ise daha uzun dönem yetiştirilebilir.`;
  }

  if (summaryTr && !looksEnglish(summaryTr)) {
    return `Fotoğrafa/metne göre en olası durum: ${nameTr} — ${summaryTr.slice(0, 200)}`;
  }
  return `Fotoğrafa/metne göre en olası durum: ${nameTr}.`;
}

/** Collect all farmer-visible text from a DoctorAnswer for language QA. */
export function collectDoctorVisibleText(answer: DoctorAnswer): string {
  const parts: string[] = [
    answer.diagnosis,
    answer.symptoms,
    answer.treatment,
    answer.prevention,
    answer.notes,
    answer.formatted,
    answer.disclaimer,
  ].filter(Boolean) as string[];

  if (answer.sections) {
    parts.push(
      answer.sections.short_diagnosis,
      answer.sections.possible_causes,
      answer.sections.immediate_action,
      answer.sections.treatment_plan,
      answer.sections.prevention,
      answer.sections.expert_warning
    );
  }

  return parts.join('\n');
}

/** Return matched banned English patterns in visible doctor text. */
export function findEnglishLeaks(text: string): string[] {
  return ENGLISH_LEAK_PATTERNS.filter((re) => re.test(text)).map(String);
}

const EVIDENCE_TITLE_TR: Record<string, string> = {
  knowledge_bank: 'Bilgi Bankası',
  farm_memory: 'Tarla Profili',
  project_memory: 'Proje Hafızası',
  disease_history: 'Hastalık Geçmişi',
  conversation_history: 'Konuşma Geçmişi',
  image_analysis: 'Görsel Analiz',
  weather_regional: 'Hava / Bölgesel Risk',
  similar_cases: 'Benzer Vakalar',
};

/** Normalize evidence card summaries for Turkish farmers. */
export function normalizeEvidenceCardsLanguage(
  cards: import('./types-intelligence').EvidenceCard[],
  language: ConversationLanguage
): import('./types-intelligence').EvidenceCard[] {
  if (language !== 'tr') return cards;

  return cards.map((card) => {
    const title = EVIDENCE_TITLE_TR[card.type] ?? card.title;
    let summary = card.summary?.trim() ?? '';

    if (summary && looksEnglish(summary)) {
      if (card.type === 'image_analysis') {
        summary = 'Fotoğraftan görsel analiz yapıldı; belirtiler değerlendirildi.';
      } else if (card.type === 'farm_memory') {
        summary = 'Henüz tarla profili eklenmedi.';
      } else if (card.type === 'similar_cases') {
        summary = 'Benzer vaka bulunamadı.';
      } else if (card.type === 'knowledge_bank') {
        summary = summary.replace(/\bCucumber\b/gi, 'Salatalık').replace(/\bGreenhouse cucumber\b/gi, 'Sera salatalığı');
        if (looksEnglish(summary)) {
          summary = 'Bilgi bankasından eşleşen kayıt bulundu.';
        }
      } else {
        summary = 'Bölgesel bağlam değerlendirildi.';
      }
    }

    return { ...card, title, summary };
  });
}
