import type { QueryLanguage } from './question-analyzer';
import type { DoctorAnswer, KnowledgeHit, RiskLevel } from './types';

export interface NerturaDoctorSections {
  short_diagnosis: string;
  possible_causes: string;
  risk_level: RiskLevel;
  immediate_action: string;
  treatment_plan: string;
  prevention: string;
  expert_warning: string;
}

const RISK_TR: Record<RiskLevel, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  critical: 'Kritik',
};

const RISK_EN: Record<RiskLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

function riskLabel(level: RiskLevel, lang: QueryLanguage): string {
  return lang === 'tr' ? RISK_TR[level] : RISK_EN[level];
}

function normalizeDoctorPunctuation(text: string): string {
  if (!text?.trim()) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/,\s*\./g, '.')
    .replace(/\.\s*,/g, '. ')
    .replace(/\.,/g, '. ')
    .replace(/([.!?])([A-ZÇĞİÖŞÜ])/g, '$1 $2')
    .replace(/\.{2,}/g, '.')
    .trim();
}

export function formatNaturalDoctorSummary(
  answer: import('./types').DoctorAnswer,
  lang: QueryLanguage
): string {
  const s = answer.sections;
  const pct = Math.round(answer.confidence * 100);
  const short = normalizeDoctorPunctuation(s?.short_diagnosis ?? answer.diagnosis);
  const action = normalizeDoctorPunctuation(
    s?.immediate_action ?? answer.treatment.split('\n\n')[0] ?? answer.treatment
  );
  const monitor =
    lang === 'tr'
      ? 'Belirtileri izleyin; değişirse yeni bir fotoğraf yükleyin.'
      : 'Monitor symptoms; upload a new photo if things change.';

  const conf =
    lang === 'tr' ? `Güven: yaklaşık %${pct}` : `Confidence: ~${pct}%`;

  return [short, '', action, '', conf, '', monitor].join('\n');
}

export function buildNerturaSections(params: {
  language: QueryLanguage;
  diagnosis: string;
  possibleCauses: string;
  riskLevel: RiskLevel;
  immediateAction: string;
  treatmentPlan: string;
  prevention: string;
  expertWarning?: string;
  topHit?: KnowledgeHit;
}): NerturaDoctorSections {
  const lang = params.language;
  const cropNote =
    params.topHit && lang === 'tr'
      ? `${params.topHit.name_tr} için değerlendirme.`
      : params.topHit
        ? `Assessment for ${params.topHit.name_en}.`
        : '';

  return {
    short_diagnosis: normalizeDoctorPunctuation(params.diagnosis),
    possible_causes: normalizeDoctorPunctuation(
      params.possibleCauses || (lang === 'tr' ? 'Belirtilmemiş' : 'Not specified')
    ),
    risk_level: params.riskLevel,
    immediate_action: normalizeDoctorPunctuation(
      params.immediateAction ||
        (lang === 'tr'
          ? 'Bitkileri yakından gözlemleyin; belirtiler yayılıyorsa fotoğraf çekip tekrar sorun.'
          : 'Monitor plants closely; if symptoms spread, take photos and ask again.')
    ),
    treatment_plan: normalizeDoctorPunctuation(params.treatmentPlan),
    prevention: normalizeDoctorPunctuation(params.prevention),
    expert_warning: normalizeDoctorPunctuation(
      params.expertWarning ||
        (lang === 'tr'
          ? `Tarla koşulları değişkendir. ${cropNote} Kesin teşhis için yerel ziraat mühendisine danışın.`
          : `Field conditions vary. ${cropNote} Consult a local agronomist for definitive diagnosis.`)
    ),
  };
}

export function formatNerturaAnswerText(sections: NerturaDoctorSections, lang: QueryLanguage): string {
  if (lang === 'tr') {
    return [
      `**Kısa Teşhis**\n${sections.short_diagnosis}`,
      `**Olası Nedenler**\n${sections.possible_causes}`,
      `**Risk Seviyesi**\n${riskLabel(sections.risk_level, lang)}`,
      `**Şimdi Ne Yapmalı**\n${sections.immediate_action}`,
      `**Tedavi Planı**\n${sections.treatment_plan}`,
      `**Önleme**\n${sections.prevention}`,
      `**Uzman Uyarısı**\n${sections.expert_warning}`,
    ].join('\n\n');
  }

  return [
    `**Short diagnosis**\n${sections.short_diagnosis}`,
    `**Possible causes**\n${sections.possible_causes}`,
    `**Risk level**\n${riskLabel(sections.risk_level, lang)}`,
    `**Immediate action**\n${sections.immediate_action}`,
    `**Treatment plan**\n${sections.treatment_plan}`,
    `**Prevention**\n${sections.prevention}`,
    `**Expert note**\n${sections.expert_warning}`,
  ].join('\n\n');
}

export function sectionsToDoctorAnswer(
  sections: NerturaDoctorSections,
  lang: QueryLanguage,
  meta: {
    confidence: number;
    source: DoctorAnswer['source'];
    matched_slug?: string;
    matched_type?: string;
    disclaimer: string;
    internalNotes?: string;
  }
): DoctorAnswer {
  return {
    diagnosis: sections.short_diagnosis,
    symptoms: sections.possible_causes,
    risk_level: sections.risk_level,
    treatment: `${sections.immediate_action}\n\n${sections.treatment_plan}`.trim(),
    prevention: sections.prevention,
    notes: [sections.expert_warning, meta.internalNotes].filter(Boolean).join(' | '),
    confidence: meta.confidence,
    source: meta.source,
    disclaimer: meta.disclaimer,
    matched_slug: meta.matched_slug,
    matched_type: meta.matched_type,
    language: lang,
    formatted: formatNerturaAnswerText(sections, lang),
    sections,
  };
}
