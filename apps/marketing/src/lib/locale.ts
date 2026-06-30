/** Simple locale detection until full i18n (Gate 5). */

export type MarketingLocale = 'tr' | 'en';



export function detectMarketingLocale(acceptLanguage: string | null | undefined): MarketingLocale {

  if (!acceptLanguage?.trim()) return 'en';

  const first = acceptLanguage.split(',')[0]?.trim().toLowerCase() ?? '';

  return first.startsWith('tr') ? 'tr' : 'en';

}



export {

  buildDashboardUrl,

  dashboardAppUrl,

  getDashboardBaseUrl,

  getDashboardDoctorUrl,

  getDashboardLoginUrl,

  getDashboardRegisterUrl,

} from './app-urls';

