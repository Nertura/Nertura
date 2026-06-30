export type MapLocale = 'tr' | 'en';

const COPY = {
  tr: {
    steps: [
      { id: 1, label: 'Bul' },
      { id: 2, label: 'Çiz' },
      { id: 3, label: 'Kaydet' },
    ],
    stepHints: {
      locate: 'Haritada tarlanı bul. Gerekirse yakınlaştır.',
      draw: 'Köşelere sırayla tıkla. En az 3 köşe seç.',
      confirm: 'Bilgileri kontrol et ve kaydet.',
    },
    draft: 'Taslak',
    draftLine: 'Çizgi',
    mapUnconfigured:
      'Uydu haritası için Mapbox anahtarı gerekli. Yine de konum onayı ve sınır çizimi yapabilirsiniz.',
    mapTokenHint: 'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN değerini ekleyin.',
    mapLoading: 'Harita yükleniyor…',
    mapLoadFailed: 'Harita yüklenemedi. Sayfayı yenileyip tekrar deneyin.',
    mapAria: 'Etkileşimli çiftlik haritası',
    layersHint: 'Hava, toprak ve uydu katmanları yakında eklenecek.',
    zoomIn: 'Yakınlaştır',
    zoomOut: 'Uzaklaştır',
    myLocation: 'Konumuma git',
    geoUnsupported:
      'Tarayıcınız konum özelliğini desteklemiyor. Arama kutusunu kullanarak tarlanı bulabilirsiniz.',
    geoDenied:
      'Konum izni verilmedi. Haritadaki arama kutusunu kullanabilir veya tarayıcı ayarlarından konum izni verebilirsiniz.',
    geoFailed:
      'Konum alınamadı. Arama kutusuna köy, ilçe veya adres yazarak devam edebilirsiniz.',
    searchEmpty: 'Aramak için köy, ilçe, şehir veya adres yazın.',
    searchNoToken:
      'Konum araması için Mapbox anahtarı gerekli. Çiftlik konumunu veya mevcut konumu kullanabilirsiniz.',
    searchNoResults: 'Sonuç bulunamadı. Yakın bir ilçe, köy veya adres deneyin.',
    searchFailed: 'Arama başarısız. Tekrar deneyin.',
    autoLocateFailed: 'Intake konumu otomatik bulunamadı. Aşağıdan arama yapın.',
    autoLocateError: 'Otomatik konum araması başarısız. Manuel arama yapın.',
    farmNoLocation: 'Bu çiftlikte kayıtlı konum yok. Adresi elle girin.',
    noFarmCoords: 'Çiftlik koordinatı yok. Arama yapın veya konumunuzu kullanın.',
    confirmSearchFirst: 'Önce bir konum arayın veya seçin.',
    confirmBeforeDraw: 'Çizime geçmeden önce haritada konumu onaylayın.',
    minVertices: 'En az 3 köşe seçmelisin.',
    fieldNameRequired: 'Tarla adı girin.',
    locateFirst: 'Önce haritada tarla konumunu bulun.',
    largeAreaConfirm: 'Alan çok büyük görünüyor. Devam etmek için onaylayın.',
    largeAreaUnusual: 'Alan olağandışı büyük görünüyor. Devam etmek için onaylayın.',
    updateFailed: 'Güncelleme başarısız.',
    savedOpeningDoctor: 'Tarlan kaydedildi. AI Doktor açılıyor…',
    boundaryUpdated: 'Sınır güncellendi.',
    areaLabel: 'Alan',
    corners: 'köşe',
    fieldsOnMap: (n: number) => `${n} tarla haritada`,
    noFieldsYet:
      'Henüz tarla yok. Konumu bulun, sınırı çizin ve kaydedin — ardından AI Doktor ile devam edin.',
    addField: 'Tarla ekle',
    addFirstField: 'İlk tarlanı ekle',
    addNewField: 'Yeni tarla ekle',
    editBoundary: 'Tarla sınırını düzenle',
    panelTitles: {
      idle: 'Tarla ekle',
      locate: '1. Tarlanı bul',
      draw: '2. Sınırı çiz',
      confirm: '3. Kaydet',
      default: 'Tarla',
    },
    fieldCard: {
      crop: 'Ürün',
      area: 'Alan',
      noBoundary: 'Sınır kaydedilmemiş',
      redraw: 'Sınırı yeniden çiz',
      details: 'Tarla detayları →',
    },
    search: {
      label: 'Köy, ilçe, şehir veya adres',
      placeholder: 'Örn. Toprakkale, Osmaniye',
      searching: 'Konumun haritada açılıyor…',
      useFarmArea: 'Çiftlik konumunu kullan',
      useMyLocation: 'Konumumu kullan',
      confirmPrompt: 'Doğru alan mı?',
      confirmBtn: 'Konumu onayla',
      resetBtn: 'Sıfırla',
      confirmed: 'Konum onaylandı',
      changeLocation: 'Konumu değiştir',
      proceedDraw: 'Çizime geç',
      cancel: 'İptal',
    },
    draw: {
      editHint: (name: string) => `${name} için köşelere tıkla (en az 3).`,
      createHint: 'Her tıklama bir köşe. En az 3 köşe seçince alan hesaplanır.',
      undo: 'Geri al',
      clear: 'Temizle',
      finish: 'Çizimi bitir',
      save: 'Kaydet',
      back: 'Geri',
      largeArea: 'Alan olağandışı büyük görünüyor. Emin misin?',
      largeConfirm: (ha: number) => `Evet, doğru (${ha} ha)`,
    },
    confirm: {
      title: 'Bu alan senin tarlan mı?',
      fieldName: 'Tarla adı',
      crop: 'Ürün',
      location: 'Konum',
      area: 'Alan',
      corners: 'Köşe sayısı',
      nameLabel: 'Tarla adı',
      namePlaceholder: 'Tarlam',
      cropOptional: 'Ürün (isteğe bağlı)',
      cropPlaceholder: 'Örn. Buğday',
      largeAck: 'Büyük alanı onaylıyorum',
      saveAndDoctor: 'Tarlamı kaydet ve AI Doktor\'a geç',
      edit: 'Düzenle',
    },
    layersCard:
      'Hava, toprak ve uydu katmanları yakında eklenecek — şimdilik önizleme gösterilmiyor.',
    areaMismatch: (stated: string) =>
      `Çizilen alan, söylediğin alandan (${stated}) farklı görünüyor. Lütfen kontrol et.`,
    nextAfterSave: 'Kaydettikten sonra AI Doktor ile teşhis ve takibe geçeceksiniz.',
    whereAmI: 'Haritada konumunuzu bulun veya arayın.',
    progressAria: 'İlerleme',
  },
  en: {
    steps: [
      { id: 1, label: 'Find' },
      { id: 2, label: 'Draw' },
      { id: 3, label: 'Save' },
    ],
    stepHints: {
      locate: 'Find your field on the map. Zoom in if needed.',
      draw: 'Click each corner in order. Select at least 3 corners.',
      confirm: 'Review details and save.',
    },
    draft: 'Draft',
    draftLine: 'Draft line',
    mapUnconfigured:
      'A Mapbox token is required for satellite maps. You can still confirm location and draw boundaries.',
    mapTokenHint: 'Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.',
    mapLoading: 'Loading map…',
    mapLoadFailed: 'Could not load the map. Refresh and try again.',
    mapAria: 'Interactive farm map',
    layersHint: 'Weather, soil, and satellite layers coming soon.',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    myLocation: 'Go to my location',
    geoUnsupported:
      'Your browser does not support location. Use the search box to find your field.',
    geoDenied:
      'Location permission was not granted. Use the search box on the map, or enable location in your browser settings.',
    geoFailed:
      'Could not get your location. Search for a village, district, or address to continue.',
    searchEmpty: 'Enter a village, district, city, or address to search.',
    searchNoToken:
      'Location search requires a Mapbox token. Use farm location or current location instead.',
    searchNoResults: 'No locations found. Try a nearby town, district, or address.',
    searchFailed: 'Search failed. Try again.',
    autoLocateFailed: 'Could not auto-locate from intake. Search manually below.',
    autoLocateError: 'Auto location search failed. Try searching manually.',
    farmNoLocation: 'This farm has no saved location. Enter an address manually.',
    noFarmCoords: 'No farm coordinates saved. Search for a place or use current location.',
    confirmSearchFirst: 'Search or select a location first.',
    confirmBeforeDraw: 'Confirm the field area on the map before drawing.',
    minVertices: 'Select at least 3 corners.',
    fieldNameRequired: 'Enter a field name.',
    locateFirst: 'Find the field location on the map first.',
    largeAreaConfirm: 'The area looks very large. Confirm to continue.',
    largeAreaUnusual: 'The area looks unusually large. Confirm to continue.',
    updateFailed: 'Update failed.',
    savedOpeningDoctor: 'Field saved. Opening AI Doctor…',
    boundaryUpdated: 'Boundary updated.',
    areaLabel: 'Area',
    corners: 'corners',
    fieldsOnMap: (n: number) => `${n} field${n === 1 ? '' : 's'} on map`,
    noFieldsYet:
      'No fields yet. Find the location, draw the boundary, and save — then continue with AI Doctor.',
    addField: 'Add field',
    addFirstField: 'Add your first field',
    addNewField: 'Add new field',
    editBoundary: 'Edit field boundary',
    panelTitles: {
      idle: 'Add field',
      locate: '1. Find field',
      draw: '2. Draw boundary',
      confirm: '3. Save',
      default: 'Field',
    },
    fieldCard: {
      crop: 'Crop',
      area: 'Area',
      noBoundary: 'No boundary saved',
      redraw: 'Redraw boundary',
      details: 'Field details →',
    },
    search: {
      label: 'Village, district, city, or address',
      placeholder: 'e.g. Toprakkale, Osmaniye',
      searching: 'Opening location on map…',
      useFarmArea: 'Use farm location',
      useMyLocation: 'Use my location',
      confirmPrompt: 'Is this the right area?',
      confirmBtn: 'Confirm location',
      resetBtn: 'Reset',
      confirmed: 'Location confirmed',
      changeLocation: 'Change location',
      proceedDraw: 'Continue to draw',
      cancel: 'Cancel',
    },
    draw: {
      editHint: (name: string) => `Click corners for ${name} (at least 3).`,
      createHint: 'Each click adds a corner. Area is calculated after 3+ corners.',
      undo: 'Undo',
      clear: 'Clear',
      finish: 'Finish drawing',
      save: 'Save',
      back: 'Back',
      largeArea: 'The area looks unusually large. Are you sure?',
      largeConfirm: (ha: number) => `Yes, correct (${ha} ha)`,
    },
    confirm: {
      title: 'Is this your field?',
      fieldName: 'Field name',
      crop: 'Crop',
      location: 'Location',
      area: 'Area',
      corners: 'Corner count',
      nameLabel: 'Field name',
      namePlaceholder: 'My field',
      cropOptional: 'Crop (optional)',
      cropPlaceholder: 'e.g. Wheat',
      largeAck: 'I confirm this large area',
      saveAndDoctor: 'Save field & open AI Doctor',
      edit: 'Edit',
    },
    layersCard:
      'Weather, soil, and satellite layers will be available in a future sprint — no preview shown yet.',
    areaMismatch: (stated: string) =>
      `Drawn area differs from what you stated (${stated}). Please verify.`,
    nextAfterSave: 'After saving, you will continue to AI Doctor for diagnosis and follow-up.',
    whereAmI: 'Find or search for your location on the map.',
    progressAria: 'Progress',
  },
} as const;

export type FarmMapCopy = (typeof COPY)[MapLocale];

export function getFarmMapCopy(locale: MapLocale): FarmMapCopy {
  return COPY[locale];
}

export function defaultFieldNameFromIntake(
  locale: MapLocale,
  intake?: { crop?: string | null; location?: string | null } | null
): string {
  if (intake?.crop?.trim()) {
    return locale === 'tr' ? `${intake.crop.trim()} tarlası` : `${intake.crop.trim()} field`;
  }
  if (intake?.location?.trim()) {
    const part = intake.location.split(',')[0]?.trim();
    if (part) return locale === 'tr' ? `${part} tarlası` : `${part} field`;
  }
  return locale === 'tr' ? 'Tarlam' : 'My field';
}
