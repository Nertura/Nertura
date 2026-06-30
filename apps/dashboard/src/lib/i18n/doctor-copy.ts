import { DOCTOR_UI_COPY, getDoctorUiCopy, type UiLanguage } from '@nertura/ui';

export type DoctorLocale = UiLanguage;

export { DOCTOR_UI_COPY, getDoctorUiCopy };

/** Dashboard-specific doctor strings (already in dashboard-copy; re-export for module parity). */
export function getDashboardDoctorCopy(lang: DoctorLocale = 'tr') {
  return getDoctorUiCopy(lang);
}
