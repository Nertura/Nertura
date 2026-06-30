/** Farmer-facing text polish for AI Doctor answers — display layer only. */

export function normalizeDoctorPunctuation(text: string): string {
  if (!text?.trim()) return '';

  let t = text
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .replace(/,\s*\./g, '.')
    .replace(/\.\s*,/g, '. ')
    .replace(/\.,/g, '. ')
    .replace(/([.!?])([A-ZÇĞİÖŞÜ])/g, '$1 $2')
    .replace(/([a-zçğışöüA-ZÇĞİÖŞÜ])([.!?])(?=[A-Za-zÇĞİÖŞÜçğışöü])/g, '$1$2 ')
    .replace(/\.{2,}/g, '.')
    .replace(/\s+\./g, '.')
    .trim();

  return t;
}

export function firstSentence(text: string, maxChars = 220): string {
  const normalized = normalizeDoctorPunctuation(text);
  const match = normalized.match(/^[\s\S]+?[.!?](?:\s|$)/);
  if (match) return match[0].trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, maxChars).trim()}…`;
}

const ABSOLUTE_TR = /\b(kesin|mutlaka|tek sebep|budur|tek hastalık)\b/i;
const ABSOLUTE_EN = /\b(certainly|definitely|must be|only cause|this is the disease)\b/i;

export function softenDoctorTone(text: string, language: 'tr' | 'en', confidence?: number): string {
  let t = normalizeDoctorPunctuation(text);
  if (!t) return t;

  if (language === 'tr') {
    if (ABSOLUTE_TR.test(t) && !/olası|fotoğrafa göre|karışabilir/i.test(t)) {
      t = t.replace(/^(Kesin|Mutlaka)\s*/i, '');
      t = `Fotoğrafa göre en olası durum: ${t.charAt(0).toLowerCase()}${t.slice(1)}`;
    } else if (confidence != null && confidence < 0.72 && !/olası|fotoğraf|karış/i.test(t)) {
      t = `Fotoğrafa göre en olası durum: ${t.charAt(0).toLowerCase()}${t.slice(1)}`;
    }
  } else if (ABSOLUTE_EN.test(t) && !/likely|may|could/i.test(t)) {
    t = `Most likely based on your description: ${t.charAt(0).toLowerCase()}${t.slice(1)}`;
  }

  return t;
}

export function extractActionBullets(text: string, max = 5): string[] {
  const normalized = normalizeDoctorPunctuation(text.replace(/\n+/g, ' '));
  if (!normalized) return [];

  const bulletSplit = text
    .split(/\n+|(?:^|\s)[•●▪\-–—]\s*|\d+[.)]\s+/)
    .map((s) => normalizeDoctorPunctuation(s))
    .filter((s) => s.length > 3);

  if (bulletSplit.length > 1) {
    return bulletSplit.slice(0, max).map((s) => s.replace(/[.;]$/, ''));
  }

  if (normalized.includes(';')) {
    const parts = normalized
      .split(/\s*;\s*/)
      .map((s) => s.trim())
      .filter((s) => s.length > 8);
    if (parts.length > 1) return parts.slice(0, max).map((s) => s.replace(/[.;]$/, ''));
  }

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);

  if (sentences.length > 1 && normalized.length > 80) {
    return sentences.slice(0, max).map((s) => s.replace(/[.;]$/, ''));
  }

  if (normalized.length > 100 && normalized.includes(',')) {
    const commaParts = normalized
      .split(/,\s+(?=[A-ZÇĞİÖŞÜ])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
    if (commaParts.length > 1) {
      return commaParts.slice(0, max).map((s) => s.replace(/[.;]$/, ''));
    }
  }

  return [normalized.replace(/[.;]$/, '')];
}

export function buildPhotoRetakeHint(
  language: 'tr' | 'en',
  confidence?: number,
  hasImage?: boolean
): string {
  if (language === 'tr') {
    if (!hasImage || (confidence != null && confidence < 0.72)) {
      return 'Kesinleşmesi için yaprak veya lekeye yakın çekim fotoğraf faydalı olur.';
    }
    return 'Belirtiler değişirse veya tedaviden sonra 3–7 gün içinde yeni fotoğraf yükleyin.';
  }
  if (!hasImage || (confidence != null && confidence < 0.72)) {
    return 'A close-up photo of leaves or spots helps confirm the diagnosis.';
  }
  return 'Upload a new photo in 3–7 days if symptoms change or after treatment.';
}

export function humanReadableEvidenceSummary(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') {
    const t = normalizeDoctorPunctuation(value);
    if (!t || t === '[object Object]') return '';
    return t;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value
      .map(humanReadableEvidenceSummary)
      .filter(Boolean)
      .slice(0, 4)
      .join(' · ');
  }
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>;
    if (typeof o.summary === 'string') return humanReadableEvidenceSummary(o.summary);
    if (typeof o.name === 'string') return o.name;
    if (typeof o.slug === 'string') return o.slug;
    if (typeof o.title === 'string') return o.title;
    const parts: string[] = [];
    if (typeof o.crop === 'string') parts.push(o.crop);
    if (typeof o.disease === 'string') parts.push(o.disease);
    if (typeof o.location === 'string') parts.push(o.location);
    if (parts.length) return parts.join(' · ');
  }
  return '';
}

export interface CompactDoctorView {
  shortDiagnosis: string;
  todayActions: string[];
  photoHint: string;
  expanded: {
    possibleCauses: string;
    riskLevel: string;
    treatmentPlan: string;
    prevention: string;
    expertWarning: string;
  };
}

export function buildCompactDoctorView(
  diagnosis: {
    diagnosis: string;
    symptoms: string;
    risk_level: string;
    treatment: string;
    prevention: string;
    notes: string;
    confidence?: number;
    language?: 'tr' | 'en';
    sections?: {
      short_diagnosis: string;
      possible_causes: string;
      risk_level: string;
      immediate_action: string;
      treatment_plan: string;
      prevention: string;
      expert_warning: string;
    };
  },
  options?: { hasImage?: boolean }
): CompactDoctorView {
  const lang = diagnosis.language ?? 'tr';
  const s = diagnosis.sections;
  const confidence = diagnosis.confidence;

  const rawDiagnosis = s?.short_diagnosis ?? diagnosis.diagnosis;
  const shortDiagnosis = softenDoctorTone(firstSentence(rawDiagnosis), lang, confidence);

  const actionSource = s?.immediate_action ?? diagnosis.treatment.split('\n\n')[0] ?? diagnosis.treatment;
  const todayActions = extractActionBullets(actionSource, 5);

  const photoHint = buildPhotoRetakeHint(lang, confidence, options?.hasImage);

  const treatmentParts = normalizeDoctorPunctuation(diagnosis.treatment).split(/\n\n+/);
  const treatmentPlan =
    s?.treatment_plan ??
    (treatmentParts.length > 1 ? treatmentParts.slice(1).join('\n\n') : treatmentParts[0] ?? '');

  return {
    shortDiagnosis,
    todayActions,
    photoHint,
    expanded: {
      possibleCauses: normalizeDoctorPunctuation(s?.possible_causes ?? diagnosis.symptoms),
      riskLevel: s?.risk_level ?? diagnosis.risk_level,
      treatmentPlan: normalizeDoctorPunctuation(treatmentPlan),
      prevention: normalizeDoctorPunctuation(s?.prevention ?? diagnosis.prevention),
      expertWarning: normalizeDoctorPunctuation(s?.expert_warning ?? diagnosis.notes),
    },
  };
}
