/** Turkish example prompts — 3 random picks per page load (Book 01 Ch. 11). */
export const EXAMPLE_QUESTION_POOL_TR = [
  'Domatesimde yaprak kıvrılması var',
  'Buğdayım sararıyor',
  'Zeytin ağacım yaprak döküyor',
  'Yaprakta beyaz lekeler oluştu',
  'Biberimde siyah noktalar var',
  'Mısırım gelişmiyor',
  'Limon ağacım meyve döküyor',
  'Üzüm yapraklarında leke var',
  'Fidelerim büyümüyor',
  'Toprağım çok sertleşti',
] as const;

export const EXAMPLE_QUESTION_POOL_EN = [
  'My tomato leaves are curling',
  'My wheat is turning yellow',
  'My olive tree is dropping leaves',
  'White spots appeared on the leaves',
  'Black spots on my pepper plants',
  'My corn is not growing well',
  'My lemon tree is dropping fruit',
  'Spots on grape leaves',
  'My seedlings are not growing',
  'My soil has become very hard',
] as const;

/** Deterministic first examples — same on server and client (no hydration mismatch). */
export const INITIAL_EXAMPLES_TR = [
  'Buğdayım sararıyor',
  'Domateste kahverengi lekeler var',
  'Zeytin yaprak döküyor',
] as const;

export const INITIAL_EXAMPLES_EN = [
  'My wheat is turning yellow',
  'Brown spots on tomato leaves',
  'My olive tree is dropping leaves',
] as const;

export function pickRandomExamples(pool: readonly string[], count = 3): string[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
