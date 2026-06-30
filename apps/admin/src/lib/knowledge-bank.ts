export interface KnowledgeBankItem {
  id: string;
  title: string;
  category: string | null;
  crop: string | null;
  disease: string | null;
  symptoms: string | null;
  treatment: string | null;
  prevention: string | null;
  source: string | null;
  language: string;
  content: string | null;
  created_at: string;
  slug?: string;
  type?: string;
}

export interface KnowledgeBankInput {
  title: string;
  category?: string;
  crop?: string;
  disease?: string;
  symptoms?: string;
  treatment?: string;
  prevention?: string;
  source?: string;
  language?: string;
  content?: string;
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function toDbRow(input: KnowledgeBankInput, existingSlug?: string) {
  const title = input.title.trim();
  const slug = existingSlug ?? slugifyTitle(title);
  const category = (input.category ?? 'article').trim();
  const language = (input.language ?? 'en').trim();

  return {
    title,
    category,
    crop: input.crop?.trim() || null,
    disease: input.disease?.trim() || null,
    symptoms_text: input.symptoms?.trim() || null,
    treatment: input.treatment?.trim() || null,
    prevention_text: input.prevention?.trim() || null,
    source: input.source?.trim() || 'nertura_admin',
    language,
    content: input.content?.trim() || null,
    slug,
    type: category as string,
    name_en: title,
    name_tr: title,
    summary_en: input.content?.trim() || null,
    symptoms: input.symptoms?.trim() ? [input.symptoms.trim()] : [],
    treatments: input.treatment?.trim() ? [input.treatment.trim()] : [],
    prevention: input.prevention?.trim() ? [input.prevention.trim()] : [],
    related_crops: input.crop?.trim() ? [input.crop.trim()] : [],
  };
}

export function fromDbRow(row: Record<string, unknown>): KnowledgeBankItem {
  return {
    id: String(row.id),
    title: String(row.title ?? row.name_en ?? ''),
    category: (row.category as string) ?? (row.type as string) ?? null,
    crop: (row.crop as string) ?? null,
    disease: (row.disease as string) ?? null,
    symptoms: (row.symptoms_text as string) ?? null,
    treatment: (row.treatment as string) ?? null,
    prevention: (row.prevention_text as string) ?? null,
    source: (row.source as string) ?? null,
    language: String(row.language ?? 'en'),
    content: (row.content as string) ?? null,
    created_at: String(row.created_at),
    slug: row.slug as string | undefined,
    type: row.type as string | undefined,
  };
}
