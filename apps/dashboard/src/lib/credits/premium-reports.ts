/**

 * Premium report actions — credit costs and feature gates.

 * No charges until Stripe/credit checkout is fully wired.

 */



export interface PremiumReportAction {

  id: string;

  label: string;

  description: string;

  credits: number;

  featureKey: string;

  comingSoon?: boolean;

}



export const PREMIUM_REPORT_ACTIONS: PremiumReportAction[] = [

  {

    id: 'field_care_plan',

    label: 'Tarla Bakım Planı PDF',

    description: 'Tarla, ürün ve Bilgi Bankası verilerinden mevsimlik bakım listesi.',

    credits: 60,

    featureKey: 'premium_field_care_plan',

  },

  {

    id: 'fertilizer_plan',

    label: 'Gübreleme Planı',

    description: 'Güvenlik uyarılarıyla besin programı — uzman incelemesi önerilir.',

    credits: 70,

    featureKey: 'premium_fertilizer_plan',

  },

  {

    id: 'irrigation_plan',

    label: 'Sulama Planı',

    description: 'Tarla alanı ve bölgesel verilere göre sulama takvimi.',

    credits: 70,

    featureKey: 'premium_irrigation_plan',

  },

  {

    id: 'seasonal_program',

    label: 'Mevsimlik Ürün Programı',

    description: 'Bu tarla için tüm sezon ürün takvimi.',

    credits: 80,

    featureKey: 'premium_seasonal_program',

  },

  {

    id: 'disease_risk',

    label: 'Hastalık Risk Raporu',

    description: 'Vaka geçmişi ve Bilgi Bankası kaynaklarından risk değerlendirmesi.',

    credits: 90,

    featureKey: 'premium_disease_risk',

  },

  {

    id: 'satellite_ndvi',

    label: 'Uydu / NDVI Raporu',

    description: 'Yakında: uydu katmanları ve NDVI trendleri.',

    credits: 100,

    featureKey: 'premium_satellite_ndvi',

    comingSoon: true,

  },

];



/** Returns true when credit checkout is ready to charge. */

export function isPremiumReportsEnabled(): boolean {

  return process.env.NEXT_PUBLIC_PREMIUM_REPORTS_ENABLED === 'true';

}



export function getPremiumReportCost(id: string): number | null {

  return PREMIUM_REPORT_ACTIONS.find((a) => a.id === id)?.credits ?? null;

}

