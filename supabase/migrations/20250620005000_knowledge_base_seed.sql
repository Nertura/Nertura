-- Sample knowledge base rows for local/testing import verification

insert into public.plants (name_tr, name_en, slug, description_tr, description_en, category)
values
  ('Domates', 'Tomato', 'tomato', 'Sera ve tarla domatesi.', 'Greenhouse and field tomato.', 'vegetable'),
  ('Biber', 'Pepper', 'pepper', 'Tatlı ve sivri biber çeşitleri.', 'Sweet and hot pepper varieties.', 'vegetable'),
  ('Buğday', 'Wheat', 'wheat', 'Kışlık ve yazlık buğday.', 'Winter and spring wheat.', 'cereal')
on conflict (slug) do nothing;

insert into public.plant_diseases (name_tr, name_en, slug, symptoms, causes, treatment, prevention, category)
values
  (
    'Mildiyö',
    'Late blight',
    'late-blight',
    'Yapraklarda kahverengi lekeler, beyaz spor.',
    'Phytophthora infestans, nemli hava.',
    'Bakır preparatı, fungisit uygulaması.',
    'Havalandırma, sulama yapraktan kaçınılmalı.',
    'fungal'
  ),
  (
    'Külleme',
    'Powdery mildew',
    'powdery-mildew',
    'Yapraklarda beyaz unlu tabaka.',
    'Yüksek nem, zayıf hava sirkülasyonu.',
    'Kükürt veya biyolojik preparat.',
    'Bitki aralığı, sabah sulama.',
    'fungal'
  )
on conflict (slug) do nothing;

insert into public.plant_pests (name_tr, name_en, slug, symptoms, causes, treatment, prevention, category)
values
  (
    'Yaprak biti',
    'Aphid',
    'aphid',
    'Yaprak altında yoğun koloni, yapışkan madde.',
    'Sıcak ve kuru dönemler.',
    'Predatör böcekler, sabunlu su spreyi.',
    'Erken tespit, sarı tuzak.',
    'insect'
  ),
  (
    'Beyaz sinek',
    'Whitefly',
    'whitefly',
    'Yaprak altında küçük beyaz böcekler.',
    'Sera koşulları, nem.',
    'Sarı yapışkan tuzak, biyolojik mücadele.',
    'Havalandırma, bitki hijyeni.',
    'insect'
  )
on conflict (slug) do nothing;

insert into public.treatments (name_tr, name_en, slug, description_tr, description_en, treatment, category)
values
  (
    'Bakır preparatı',
    'Copper treatment',
    'copper-treatment',
    'Mantar hastalıklarına karşı bakır bazlı koruyucu.',
    'Copper-based protective fungicide.',
    'Etiket dozunda yapraktan uygulama.',
    'fungicide'
  )
on conflict (slug) do nothing;

insert into public.knowledge_articles (name_tr, name_en, slug, description_tr, description_en, prevention, category)
values
  (
    'Organik koruma',
    'Organic prevention',
    'organic-prevention',
    'Kimyasal girdi kullanmadan koruma yöntemleri.',
    'Protection methods without synthetic inputs.',
    'Rotasyon, kompost, biyolojik mücadele, dayanıklı çeşit seçimi.',
    'prevention'
  )
on conflict (slug) do nothing;
