import { getDoctorUiCopy, type UiLanguage } from '@nertura/ui';

export function getEvidenceCopy(lang: UiLanguage = 'tr') {
  return getDoctorUiCopy(lang).evidence;
}
