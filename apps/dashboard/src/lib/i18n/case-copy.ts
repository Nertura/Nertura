import { getDashboardCopy, type DashboardLocale } from '@/lib/i18n/dashboard-copy';

/** Vaka Takibi / case tracking copy — sourced from dashboard-copy.fieldCases. */
export function getCaseCopy(locale: DashboardLocale = 'tr') {
  return getDashboardCopy(locale).fieldCases;
}
