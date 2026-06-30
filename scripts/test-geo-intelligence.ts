/**
 * Geo Intelligence smoke tests — geometry, centroid parsing, AI prompt context.
 * Run: pnpm test:geo-intelligence
 */
import assert from 'node:assert/strict';

import { formatFarmProfileForPrompt } from '@nertura/ai';
import {
  cropsConflict,
  detectExplicitLanguageSwitch,
  getImageOnlyPrompt,
  isImageOnlySubmission,
  parseAcceptLanguage,
  parseVisionAnalysis,
  resolveCropIdFromLabel,
  resolveInitialConversationLanguage,
  VISION_MIN_CONFIDENCE,
} from '@nertura/ai';
import {
  computeMetricsFromPolygonCoords,
  parseCentroidFromFieldGeo,
  positionsToBoundaryGeoJson,
  positionsToPolygonFeature,
  validateBoundaryGeoJson,
} from '@nertura/geo';

function testPolygonMetrics() {
  const ring = [
    { lat: 39.93, lng: 32.85 },
    { lat: 39.931, lng: 32.85 },
    { lat: 39.931, lng: 32.851 },
    { lat: 39.93, lng: 32.851 },
  ];
  const metrics = computeMetricsFromPolygonCoords(ring);
  assert.ok(metrics, 'metrics should be computed');
  assert.ok(metrics!.areaM2 > 0, 'area_m2 should be positive');
  assert.ok(metrics!.areaHectares > 0, 'area ha should be positive');
  assert.ok(metrics!.centroid.lat > 39.9, 'centroid lat plausible');
  console.log('✓ polygon metrics', {
    areaM2: metrics!.areaM2,
    areaHa: metrics!.areaHectares,
    centroid: metrics!.centroid,
  });
}

function testPositionsToPolygonFeature() {
  const vertices = [
    { lat: 40, lng: 29 },
    { lat: 40.001, lng: 29 },
    { lat: 40.001, lng: 29.001 },
  ];
  const feature = positionsToPolygonFeature(vertices);
  assert.ok(feature, 'feature created');
  assert.equal(feature!.geometry.type, 'Polygon');
  console.log('✓ positionsToPolygonFeature');
}

function testParseCentroidFromMetadata() {
  const meta = {
    centroid: { lat: 39.5, lng: 32.1 },
    boundary_geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[32, 39], [33, 39], [33, 40], [32, 40], [32, 39]]],
      },
    },
  };
  const c = parseCentroidFromFieldGeo(meta);
  assert.deepEqual(c, { lat: 39.5, lng: 32.1 });
  console.log('✓ parseCentroidFromFieldGeo (metadata.centroid)');
}

function testParseCentroidFromPostGisPoint() {
  const c = parseCentroidFromFieldGeo({}, { type: 'Point', coordinates: [32.85, 39.93] });
  assert.deepEqual(c, { lat: 39.93, lng: 32.85 });
  console.log('✓ parseCentroidFromFieldGeo (PostGIS Point)');
}

function testFarmProfilePromptWithSelectedField() {
  const prompt = formatFarmProfileForPrompt(
    {
      organizationName: 'Test Org',
      countryCode: 'TR',
      city: 'Ankara',
      district: 'Çankaya',
      latitude: 39.93,
      longitude: 32.85,
      farmSize: 50,
      areaUnit: 'hectare',
      siteType: 'field',
      crops: ['Wheat'],
      locationLabel: 'Çankaya, Ankara, TR',
      selectedField: {
        fieldId: '00000000-0000-4000-8000-000000000001',
        fieldName: 'North Parcel',
        farmId: '00000000-0000-4000-8000-000000000002',
        farmName: 'Demo Farm',
        areaHectares: 12.5,
        areaM2: 125000,
        soilType: 'Loam',
        fieldType: 'field',
        centroid: { lat: 39.931, lng: 32.851 },
        hasBoundary: true,
        cropsOnField: ['Wheat'],
        locationLabel: 'Polatlı, Ankara, TR',
      },
    },
    'en'
  );

  assert.match(prompt, /North Parcel/);
  assert.match(prompt, /Demo Farm/);
  assert.match(prompt, /125000/);
  assert.match(prompt, /Wheat/);
  assert.match(prompt, /Polatlı, Ankara, TR/);
  console.log('✓ formatFarmProfileForPrompt includes field geo context');
}

function testPositionsToBoundaryGeoJson() {
  const vertices = [
    { lat: 40, lng: 29 },
    { lat: 40.001, lng: 29 },
    { lat: 40.001, lng: 29.001 },
  ];
  const polygon = positionsToBoundaryGeoJson(vertices);
  assert.ok(polygon, 'polygon created');
  assert.equal(polygon!.type, 'Polygon');
  const ring = polygon!.coordinates[0];
  assert.ok(ring && ring.length >= 4, 'ring closed');
  assert.deepEqual(ring![0], ring![ring!.length - 1], 'first equals last');
  const validated = validateBoundaryGeoJson(polygon);
  assert.equal(validated.ok, true);
  console.log('✓ positionsToBoundaryGeoJson');
}

function testVisionAnalysis() {
  const json = JSON.stringify({
    plant_species: 'Olive tree',
    crop_category: 'olive',
    confidence: 0.88,
    visible_symptoms: 'Yellowing leaves',
    image_quality: 'good',
    needs_clarification: false,
    clarification_questions: [],
  });
  const parsed = parseVisionAnalysis(json);
  assert.equal(parsed.cropId, 'olive');
  assert.ok(parsed.confidence >= VISION_MIN_CONFIDENCE);
  assert.equal(parsed.needsClarification, false);

  const lowConf = parseVisionAnalysis(
    JSON.stringify({
      plant_species: 'unknown',
      crop_category: 'unknown',
      confidence: 0.3,
      image_quality: 'poor',
      needs_clarification: true,
    })
  );
  assert.ok(lowConf.needsClarification);

  assert.equal(resolveCropIdFromLabel('olive'), 'olive');
  assert.equal(cropsConflict('grape', ['wheat']), true);
  assert.equal(cropsConflict('olive', ['olive']), false);
  console.log('✓ vision analysis pipeline');
}

function testConversationLanguage() {
  assert.equal(
    resolveInitialConversationLanguage({
      profileLanguage: 'tr-TR',
      conversationLanguage: 'en',
      acceptLanguage: 'tr-TR,tr;q=0.9',
      messageLanguage: 'en',
    }),
    'tr'
  );
  assert.equal(
    resolveInitialConversationLanguage({
      profileLanguage: null,
      conversationLanguage: 'en',
      acceptLanguage: 'tr-TR',
      messageLanguage: 'tr',
    }),
    'en'
  );
  assert.equal(parseAcceptLanguage('tr-TR,tr;q=0.9,en;q=0.8'), 'tr');
  assert.equal(detectExplicitLanguageSwitch('Please answer in English'), 'en');
  assert.equal(detectExplicitLanguageSwitch('Türkçe cevap ver'), 'tr');
  assert.equal(isImageOnlySubmission('', true), true);
  assert.equal(isImageOnlySubmission('Analyze this plant photo.', true), true);
  assert.equal(isImageOnlySubmission('Buğday sararıyor', true), false);
  assert.match(getImageOnlyPrompt('tr'), /Fotoğraf yüklendi/);
  console.log('✓ conversation language lock');
}

function main() {
  testPolygonMetrics();
  testPositionsToPolygonFeature();
  testPositionsToBoundaryGeoJson();
  testParseCentroidFromMetadata();
  testParseCentroidFromPostGisPoint();
  testFarmProfilePromptWithSelectedField();
  testVisionAnalysis();
  testConversationLanguage();
  console.log('\nAll geo intelligence smoke tests passed.');
}

main();
