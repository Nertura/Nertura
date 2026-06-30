/** Farm intelligence profile loaded from onboarding / farms table for AI context. */

export type SiteType = 'field' | 'greenhouse' | 'orchard';

export interface FarmIntelligenceProfile {
  organizationName: string;
  countryCode: string;
  city: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  farmSize: number | null;
  areaUnit: 'hectare' | 'acre';
  siteType: SiteType;
  crops: string[];
  /** Human-readable location line for prompts */
  locationLabel: string | null;
  /** Selected field context for geo-aware AI answers */
  selectedField?: FieldIntelligenceContext | null;
}

export interface FieldIntelligenceContext {
  fieldId: string;
  fieldName: string;
  farmId: string;
  farmName?: string | null;
  areaHectares?: number | null;
  areaM2?: number | null;
  soilType?: string | null;
  fieldType?: string | null;
  centroid?: { lat: number; lng: number } | null;
  hasBoundary?: boolean;
  cropsOnField?: string[];
  /** Farm location line for the selected field's farm */
  locationLabel?: string | null;
}

export function formatFarmProfileForPrompt(
  profile: FarmIntelligenceProfile | null | undefined,
  language: 'tr' | 'en' = 'tr'
): string {
  if (!profile) return '';

  const loc = profile.locationLabel ?? [profile.city, profile.district, profile.countryCode]
    .filter(Boolean)
    .join(', ');

  const size =
    profile.farmSize != null
      ? `${profile.farmSize} ${profile.areaUnit === 'acre' ? (language === 'tr' ? 'dönüm/acre' : 'acres') : language === 'tr' ? 'hektar' : 'hectares'}`
      : null;

  const coords =
    profile.latitude != null && profile.longitude != null
      ? `${profile.latitude.toFixed(4)}, ${profile.longitude.toFixed(4)}`
      : null;

  const siteLabels: Record<SiteType, { tr: string; en: string }> = {
    field: { tr: 'Tarla', en: 'Open field' },
    greenhouse: { tr: 'Sera', en: 'Greenhouse' },
    orchard: { tr: 'Bahçe / Meyve', en: 'Orchard' },
  };

  const site = siteLabels[profile.siteType][language];

  const fieldBlock =
    profile.selectedField &&
    (language === 'tr'
      ? [
          '--- Seçili Tarla (geo intelligence) ---',
          `Tarla: ${profile.selectedField.fieldName}`,
          profile.selectedField.farmName ? `Çiftlik: ${profile.selectedField.farmName}` : null,
          profile.selectedField.locationLabel
            ? `Konum: ${profile.selectedField.locationLabel}`
            : null,
          profile.selectedField.areaHectares != null
            ? `Alan: ${profile.selectedField.areaHectares} ha (${profile.selectedField.areaM2 ?? '—'} m²)`
            : null,
          profile.selectedField.soilType ? `Toprak: ${profile.selectedField.soilType}` : null,
          profile.selectedField.fieldType ? `Tarla tipi: ${profile.selectedField.fieldType}` : null,
          profile.selectedField.centroid
            ? `Merkez: ${profile.selectedField.centroid.lat.toFixed(4)}, ${profile.selectedField.centroid.lng.toFixed(4)}`
            : null,
          profile.selectedField.cropsOnField?.length
            ? `Bu tarladaki ürünler: ${profile.selectedField.cropsOnField.join(', ')}`
            : null,
          'Bu tarla bağlamını teşhis ve önerilerde kullan.',
        ]
          .filter(Boolean)
          .join('\n')
      : [
          '--- Selected Field (geo intelligence) ---',
          `Field: ${profile.selectedField.fieldName}`,
          profile.selectedField.farmName ? `Farm: ${profile.selectedField.farmName}` : null,
          profile.selectedField.locationLabel
            ? `Location: ${profile.selectedField.locationLabel}`
            : null,
          profile.selectedField.areaHectares != null
            ? `Area: ${profile.selectedField.areaHectares} ha (${profile.selectedField.areaM2 ?? '—'} m²)`
            : null,
          profile.selectedField.soilType ? `Soil: ${profile.selectedField.soilType}` : null,
          profile.selectedField.fieldType ? `Field type: ${profile.selectedField.fieldType}` : null,
          profile.selectedField.centroid
            ? `Centroid: ${profile.selectedField.centroid.lat.toFixed(4)}, ${profile.selectedField.centroid.lng.toFixed(4)}`
            : null,
          profile.selectedField.cropsOnField?.length
            ? `Crops on this field: ${profile.selectedField.cropsOnField.join(', ')}`
            : null,
          'Use this field context in diagnosis and recommendations.',
        ]
          .filter(Boolean)
          .join('\n'));

  if (language === 'tr') {
    return [
      '--- Çiftçi / Operasyon Profili (onboarding) ---',
      profile.organizationName ? `Organizasyon: ${profile.organizationName}` : null,
      loc ? `Konum: ${loc}` : null,
      coords ? `Koordinatlar: ${coords}` : null,
      size ? `İşletme büyüklüğü: ${size}` : null,
      `Alan tipi: ${site}`,
      profile.crops.length ? `Yetistirilen ürünler: ${profile.crops.join(', ')}` : null,
      fieldBlock,
      'Bu profili her yanıtta dikkate al; bölgesel iklim, toprak ve ürün özelinde pratik öneriler ver.',
    ]
      .filter(Boolean)
      .join('\n');
  }

  return [
    '--- Farmer / Operation Profile (onboarding) ---',
    profile.organizationName ? `Organization: ${profile.organizationName}` : null,
    loc ? `Location: ${loc}` : null,
    coords ? `Coordinates: ${coords}` : null,
    size ? `Operation size: ${size}` : null,
    `Site type: ${site}`,
    profile.crops.length ? `Crops grown: ${profile.crops.join(', ')}` : null,
    fieldBlock,
    'Always consider this profile; tailor advice to regional climate, soil, and listed crops.',
  ]
    .filter(Boolean)
    .join('\n');
}

export function mergeCropsForDoctor(
  profileCrops: string[],
  queryCrops: string[]
): string[] {
  const merged = new Set<string>([...profileCrops, ...queryCrops]);
  return [...merged];
}
