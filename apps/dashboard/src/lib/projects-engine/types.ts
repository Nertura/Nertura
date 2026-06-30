import type { CaseProgress } from '@nertura/types';

/** Farmer-facing product name — never expose "Project" in UI. */
export const CASE_PRODUCT_LABELS = {
  tr: {
    singular: 'Vaka',
    plural: 'Vakalar',
    tracking: 'Vaka Takibi',
    navShort: 'Vakalar',
  },
  en: {
    singular: 'Case',
    plural: 'Cases',
    tracking: 'Case tracking',
    navShort: 'Cases',
  },
} as const;

export const CASE_PROGRESS_LABELS: Record<CaseProgress, { tr: string; en: string }> = {
  monitoring: { tr: 'Takipte', en: 'Monitoring' },
  improving: { tr: 'İyileşiyor', en: 'Improving' },
  stable: { tr: 'Stabil', en: 'Stable' },
  critical: { tr: 'Kritik', en: 'Critical' },
  recovered: { tr: 'İyileşti', en: 'Recovered' },
  closed: { tr: 'Kapalı', en: 'Closed' },
};

export const CASE_STATUS_LABELS: Record<string, { tr: string; en: string }> = {
  open: { tr: 'Açık', en: 'Open' },
  monitoring: { tr: 'Takipte', en: 'Monitoring' },
  resolved: { tr: 'Çözüldü', en: 'Resolved' },
};

export const CASE_RISK_LABELS: Record<string, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  critical: 'Kritik',
};

export const CASE_TIMELINE_EVENT_LABELS: Record<string, string> = {
  case_created: 'Vaka oluşturuldu',
  photo_uploaded: 'Fotoğraf yüklendi',
  diagnosis_created: 'Teşhis oluşturuldu',
  treatment_generated: 'Tedavi planı',
  reminder_scheduled: 'Hatırlatma',
  follow_up_analysis: 'Takip analizi',
  progress_updated: 'Durum güncellendi',
  feedback_received: 'Geri bildirim',
  recovered: 'İyileşme',
  completed: 'Tamamlandı',
  note_added: 'Not eklendi',
};
