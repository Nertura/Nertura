export interface FieldRecommendation {
  id: string;
  title: string;
  body: string;
  priority: 'low' | 'medium' | 'high';
  source: 'field' | 'case' | 'season' | 'weather' | 'knowledge';
  fieldId?: string | null;
  fieldName?: string | null;
}

export function buildPlaceholderRecommendations(input: {
  fields: Array<{
    id: string;
    name: string;
    crop?: string | null;
    hasBoundary: boolean;
    healthLabel: string;
  }>;
  cases: Array<{
    field_id: string | null;
    symptom: string | null;
    status: string;
    severity: string | null;
  }>;
}): FieldRecommendation[] {
  const recs: FieldRecommendation[] = [];
  let n = 0;

  for (const field of input.fields) {
    if (!field.hasBoundary) {
      recs.push({
        id: `rec-${++n}`,
        title: 'Complete field boundary',
        body: `Draw the exact boundary for ${field.name} to unlock area-accurate irrigation and disease risk reports.`,
        priority: 'medium',
        source: 'field',
        fieldId: field.id,
        fieldName: field.name,
      });
    }
    if (field.healthLabel === 'High risk' || field.healthLabel === 'Needs monitoring') {
      recs.push({
        id: `rec-${++n}`,
        title: 'Schedule field inspection',
        body: `${field.name} has active monitoring signals — walk the rows and upload photos to AI Doctor.`,
        priority: 'high',
        source: 'field',
        fieldId: field.id,
        fieldName: field.name,
      });
    }
  }

  for (const c of input.cases.filter((x) => x.status === 'open' || x.status === 'monitoring')) {
    const symptom = (c.symptom ?? '').toLowerCase();
    if (symptom.includes('yellow') || symptom.includes('sarar')) {
      recs.push({
        id: `rec-${++n}`,
        title: 'Inspect lower leaves',
        body: 'Yellowing often starts on older leaves — check nitrogen and moisture before treatment.',
        priority: 'high',
        source: 'case',
        fieldId: c.field_id,
      });
    }
  }

  recs.push({
    id: `rec-${++n}`,
    title: 'Rain expected tomorrow',
    body: 'Weather placeholder — delay irrigation if soil is already moist. Full forecast integration coming soon.',
    priority: 'medium',
    source: 'weather',
  });

  if (input.fields.some((f) => f.crop?.toLowerCase().includes('wheat'))) {
    recs.push({
      id: `rec-${++n}`,
      title: 'Disease risk increasing',
      body: 'Seasonal placeholder — humid periods raise fungal pressure on wheat. Scout for leaf spots this week.',
      priority: 'medium',
      source: 'season',
    });
  }

  recs.push({
    id: `rec-${++n}`,
    title: 'Bilgi Bankası ipucu',
    body: 'Review crop-specific guidance in Nertura Knowledge before applying any treatment plan.',
    priority: 'low',
    source: 'knowledge',
  });

  return recs.slice(0, 8);
}
