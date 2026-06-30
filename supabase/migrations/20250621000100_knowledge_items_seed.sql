-- Seed unified knowledge_items for AI Doctor testing

insert into public.knowledge_items (type, name_tr, name_en, slug, summary_tr, summary_en, symptoms, causes, treatments, prevention, related_crops, source, confidence_level)
values
  (
    'plant', 'Domates', 'Tomato', 'tomato',
    'Sera ve tarla domatesi.', 'Greenhouse and field tomato.',
    '["Yaprak sararması","Meyve çatlakları"]'::jsonb,
    '["Besin eksikliği","Aşırı sulama"]'::jsonb,
    '["Dengeli gübreleme"]'::jsonb,
    '["Düzenli gözlem"]'::jsonb,
    '["tomato"]'::jsonb, 'seed', 0.95
  ),
  (
    'plant', 'Zeytin', 'Olive tree', 'olive-tree',
    'Akdeniz zeytin ağacı.', 'Mediterranean olive tree.',
    '["Yaprak lekeleri"]'::jsonb,
    '["Hastalık baskısı"]'::jsonb,
    '["Budama","Bakır uygulaması"]'::jsonb,
    '["Havalandırma"]'::jsonb,
    '["olive"]'::jsonb, 'seed', 0.95
  ),
  (
    'plant', 'Limon', 'Lemon tree', 'lemon-tree',
    'Turunçgil limon ağacı.', 'Citrus lemon tree.',
    '["Yaprak yaprak biti"]'::jsonb,
    '["Sinek/populasyon"]'::jsonb,
    '["Yağlı sprey"]'::jsonb,
    '["Sarı tuzak"]'::jsonb,
    '["lemon","citrus"]'::jsonb, 'seed', 0.95
  ),
  (
    'plant', 'Buğday', 'Wheat', 'wheat',
    'Kışlık/yazlık buğday.', 'Winter/spring wheat.',
    '["Sarı yaprak"]'::jsonb,
    '["Azot eksikliği"]'::jsonb,
    '["Üre uygulaması"]'::jsonb,
    '["Toprak analizi"]'::jsonb,
    '["wheat"]'::jsonb, 'seed', 0.95
  ),
  (
    'disease', 'Külleme', 'Powdery mildew', 'powdery-mildew',
    'Yapraklarda beyaz unlu tabaka.', 'White powdery coating on leaves.',
    '["Beyaz toz","Kıvrılmış yaprak"]'::jsonb,
    '["Podosphaera","Nem"]'::jsonb,
    '["Kükürt","Biyolojik preparat"]'::jsonb,
    '["Havalandırma","Sabah sulama"]'::jsonb,
    '["tomato","wheat"]'::jsonb, 'seed', 0.92
  ),
  (
    'disease', 'Mildiyö', 'Late blight', 'late-blight',
    'Domates/patates mildiyö hastalığı.', 'Tomato/potato late blight.',
    '["Kahverengi lekeler","Beyaz spor"]'::jsonb,
    '["Phytophthora infestans"]'::jsonb,
    '["Bakır preparatı","Fungisit"]'::jsonb,
    '["Dayanıklı çeşit","Rotasyon"]'::jsonb,
    '["tomato","potato"]'::jsonb, 'seed', 0.93
  ),
  (
    'pest', 'Yaprak biti', 'Aphid', 'aphid',
    'Yaprak altı koloniler.', 'Colonies under leaves.',
    '["Yapışkan madde","Kıvrık yaprak"]'::jsonb,
    '["Sıcak kurak dönem"]'::jsonb,
    '["Predatör böcek","Sabunlu su"]'::jsonb,
    '["Sarı tuzak","Erken mücadele"]'::jsonb,
    '["tomato","pepper"]'::jsonb, 'seed', 0.90
  ),
  (
    'pest', 'Beyaz sinek', 'Whitefly', 'whitefly',
    'Yaprak altında beyaz böcek.', 'Small white insects under leaves.',
    '["Sarı yaprak","Kuruma"]'::jsonb,
    '["Sera koşulları"]'::jsonb,
    '["Sarı yapışkan tuzak","Biyolojik mücadele"]'::jsonb,
    '["Havalandırma"]'::jsonb,
    '["tomato","pepper"]'::jsonb, 'seed', 0.90
  ),
  (
    'treatment', 'Bakır preparatı', 'Copper treatment', 'copper-treatment',
    'Mantar hastalıklarına karşı bakır bazlı koruyucu.', 'Copper-based fungicide.',
    '[]'::jsonb, '[]'::jsonb,
    '["Etiket dozunda yapraktan uygulama"]'::jsonb,
    '["Hasat öncesi bekleme süresine uyun"]'::jsonb,
    '["tomato","olive"]'::jsonb, 'seed', 0.88
  ),
  (
    'article', 'Organik koruma', 'Organic prevention', 'organic-prevention',
    'Kimyasal girdi olmadan koruma yöntemleri.', 'Protection without synthetic inputs.',
    '[]'::jsonb, '[]'::jsonb,
    '["Kompost","Biyolojik mücadele"]'::jsonb,
    '["Rotasyon","Dayanıklı çeşit","Gözlem"]'::jsonb,
    '[]'::jsonb, 'seed', 0.85
  )
on conflict (slug) do nothing;
