-- Nertura Knowledge Bank — user-facing columns on knowledge_items

alter table public.knowledge_items
  add column if not exists title text,
  add column if not exists category text,
  add column if not exists crop text,
  add column if not exists disease text,
  add column if not exists language text default 'en',
  add column if not exists content text,
  add column if not exists treatment text,
  add column if not exists symptoms_text text,
  add column if not exists prevention_text text;

-- Backfill from existing unified + legacy-shaped data
update public.knowledge_items
set
  title = coalesce(nullif(trim(title), ''), name_en),
  category = coalesce(nullif(trim(category), ''), type::text),
  language = coalesce(nullif(trim(language), ''), 'en'),
  content = coalesce(
    nullif(trim(content), ''),
    nullif(trim(summary_en), ''),
    nullif(trim(summary_tr), '')
  ),
  treatment = coalesce(
    nullif(trim(treatment), ''),
    nullif(trim(treatments::text), ''),
    nullif(trim(treatments::text), '[]')
  ),
  symptoms_text = coalesce(
    nullif(trim(symptoms_text), ''),
    nullif(trim(symptoms::text), ''),
    nullif(trim(symptoms::text), '[]')
  ),
  prevention_text = coalesce(
    nullif(trim(prevention_text), ''),
    nullif(trim(prevention::text), ''),
    nullif(trim(prevention::text), '[]')
  ),
  crop = coalesce(
    nullif(trim(crop), ''),
    nullif(related_crops->>0, '')
  ),
  disease = case
    when type = 'disease' then coalesce(nullif(trim(disease), ''), name_en)
    else disease
  end,
  source = coalesce(nullif(trim(source), ''), 'nertura');

create index if not exists knowledge_items_title_idx
  on public.knowledge_items (title)
  where title is not null;

create index if not exists knowledge_items_category_idx
  on public.knowledge_items (category);

create index if not exists knowledge_items_crop_idx
  on public.knowledge_items (crop)
  where crop is not null;

create index if not exists knowledge_items_language_idx
  on public.knowledge_items (language);

-- Full-text search for production knowledge bank queries
create index if not exists knowledge_items_fts_idx
  on public.knowledge_items
  using gin (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' ||
      coalesce(category, '') || ' ' ||
      coalesce(crop, '') || ' ' ||
      coalesce(disease, '') || ' ' ||
      coalesce(symptoms_text, '') || ' ' ||
      coalesce(treatment, '') || ' ' ||
      coalesce(prevention_text, '') || ' ' ||
      coalesce(content, '')
    )
  );
