-- Expand knowledge bank to 20+ crop-specific records for MVP testing

insert into public.knowledge_items (
  type, category, crop, name_tr, name_en, slug, title,
  summary_tr, summary_en, symptoms, symptoms_text, causes, treatment, treatments,
  prevention, prevention_text, related_crops, source, confidence_level, language
)
values
  (
    'plant', 'crop', 'grape', 'Üzüm Bağı', 'Grape vine', 'grape-vine', 'Grape vine',
    'Salkım üzüm yetiştiriciliği.', 'Table and wine grape cultivation.',
    '["Yaprak lekeleri","Külleme tabakası"]'::jsonb,
    'Yapraklarda beyaz toz, salkımda çatlama',
    '["Erysiphe necator","Nem","Havalandırma eksikliği"]'::jsonb,
    'Kükürt veya etiketli fungisit uygulaması',
    '["Kükürt spreyi","Biyolojik preparat"]'::jsonb,
    '["Budama ile havalandırma","Sabah sulama"]'::jsonb,
    'Budama ile havalandırma, sabah sulama',
    '["grape"]'::jsonb, 'seed', 0.94, 'tr'
  ),
  (
    'plant', 'crop', 'pepper', 'Biber', 'Pepper', 'pepper-plant', 'Pepper',
    'Sera ve tarla biberi.', 'Greenhouse and field pepper.',
    '["Yaprak biti","Kuruma"]'::jsonb,
    'Yaprak altında yapışkan madde, kıvrık yaprak',
    '["Yaprak biti","Beyaz sinek"]'::jsonb,
    'Predatör böcek, sabunlu su spreyi',
    '["Predatör böcek","Sarı tuzak"]'::jsonb,
    '["Havalandırma","Erken mücadele"]'::jsonb,
    'Havalandırma, erken mücadele',
    '["pepper"]'::jsonb, 'seed', 0.93, 'tr'
  ),
  (
    'plant', 'crop', 'cucumber', 'Salatalık', 'Cucumber', 'cucumber', 'Cucumber',
    'Sera salatalığı.', 'Greenhouse cucumber.',
    '["Külleme","Kuruma"]'::jsonb,
    'Yapraklarda beyaz unlu tabaka',
    '["Podosphaera","Nem"]'::jsonb,
    'Kükürt uygulaması, havalandırma',
    '["Kükürt","Biyolojik preparat"]'::jsonb,
    '["Sabah sulama","Yaprak ıslatmadan sulama"]'::jsonb,
    'Sabah sulama, yaprak ıslatmadan damla sulama',
    '["cucumber"]'::jsonb, 'seed', 0.92, 'tr'
  ),
  (
    'plant', 'crop', 'corn', 'Mısır', 'Corn', 'corn', 'Corn',
    'Tarla mısırı.', 'Field corn / maize.',
    '["Sarı yaprak","Kuraklık stresi"]'::jsonb,
    'Alt yapraklarda sararma',
    '["Azot eksikliği","Su stresi"]'::jsonb,
    'Üre uygulaması, dengeli sulama',
    '["Üre","Damla sulama"]'::jsonb,
    '["Toprak analizi","Çapalama"]'::jsonb,
    'Toprak analizi, çapalama',
    '["corn"]'::jsonb, 'seed', 0.91, 'tr'
  ),
  (
    'plant', 'crop', 'apple', 'Elma', 'Apple', 'apple-tree', 'Apple tree',
    'Elma bahçesi.', 'Apple orchard tree.',
    '["Yaprak lekeleri","Kuruma"]'::jsonb,
    'Yapraklarda kahverengi lekeler',
    '["Venturia","Nem","Monilya"]'::jsonb,
    'Budama, bakır veya fungisit',
    '["Bakır","Fungisit"]'::jsonb,
    '["Kış budaması","Yabani ot temizliği"]'::jsonb,
    'Kış budaması, yabani ot temizliği',
    '["apple"]'::jsonb, 'seed', 0.93, 'tr'
  ),
  (
    'plant', 'crop', 'citrus', 'Turunçgil', 'Citrus', 'citrus-tree', 'Citrus tree',
    'Portakal, mandarin ve turunçgil.', 'Orange, mandarin and citrus.',
    '["Yaprak biti","Sarı yaprak"]'::jsonb,
    'Yaprak altında yapışkan madde',
    '["Yaprak biti","Besin eksikliği"]'::jsonb,
    'Yağlı sprey, besin takviyesi',
    '["Neem yağı","NPK gübre"]'::jsonb,
    '["Sarı tuzak","Düzenli sulama"]'::jsonb,
    'Sarı tuzak, düzenli sulama',
    '["citrus","lemon"]'::jsonb, 'seed', 0.92, 'tr'
  ),
  (
    'disease', 'disease', 'grape', 'Üzüm Küllemesi', 'Grape powdery mildew', 'grape-powdery-mildew', 'Grape powdery mildew',
    'Üzüm yapraklarında külleme (Oidium).', 'Powdery mildew on grape leaves.',
    '["Beyaz unlu tabaka","Yaprak kıvrılması"]'::jsonb,
    'Yaprak ve salkımda beyaz tozlu tabaka',
    '["Erysiphe necator","Nem","Sık dikim"]'::jsonb,
    'Kükürt veya etiketli fungisit',
    '["Kükürt spreyi","Triazol fungisit"]'::jsonb,
    '["Budama","Havalandırma","Sabah sulama"]'::jsonb,
    'Budama, havalandırma, sabah sulama',
    '["grape"]'::jsonb, 'seed', 0.95, 'tr'
  ),
  (
    'disease', 'disease', 'olive', 'Zeytin Yaprak Dökülmesi', 'Olive leaf drop', 'olive-leaf-drop', 'Olive leaf drop',
    'Zeytin ağacında erken yaprak dökülmesi.', 'Premature olive leaf drop.',
    '["Yaprak dökülmesi","Sararma"]'::jsonb,
    'Alt yapraklardan başlayan dökülme',
    '["Su stresi","Besin eksikliği","Zararlı","Fungal leke"]'::jsonb,
    'Sulama dengesi, besin analizi, bakır uygulaması',
    '["Dengeli sulama","Bakır preparatı","Gübreleme"]'::jsonb,
    '["Budama","Yabani ot temizliği"]'::jsonb,
    'Düzenli budama ve toprak analizi',
    '["olive"]'::jsonb, 'seed', 0.94, 'tr'
  ),
  (
    'disease', 'disease', 'lemon', 'Limon Yaprak Kıvrılması', 'Lemon leaf curl', 'lemon-leaf-curl', 'Lemon leaf curl',
    'Limon ağacında yaprak kıvrılması.', 'Curling leaves on lemon tree.',
    '["Kıvrık yaprak","Sarımsı renk"]'::jsonb,
    'Genç yapraklarda kıvrılma ve kalınlaşma',
    '["Yaprak biti","Besin eksikliği","Su stresi"]'::jsonb,
    'Yaprak biti mücadelesi, yağlı sprey',
    '["Neem yağı","Predatör böcek"]'::jsonb,
    '["Sarı tuzak","Düzenli sulama"]'::jsonb,
    'Erken mücadele ve besin takviyesi',
    '["lemon","citrus"]'::jsonb, 'seed', 0.93, 'tr'
  ),
  (
    'disease', 'disease', 'tomato', 'Domates Yaprak Sararması', 'Tomato yellow leaves', 'tomato-yellow-leaves', 'Tomato yellow leaves',
    'Domateste yaprak sararması.', 'Yellowing leaves on tomato.',
    '["Alt yapraklarda sararma","Solma"]'::jsonb,
    'Alt yapraklardan başlayan sararma',
    '["Azot eksikliği","Aşırı sulama","Kök hastalığı"]'::jsonb,
    'Dengeli NPK gübre, sulama düzenlemesi',
    '["Üre","Dengeli NPK","Drenaj"]'::jsonb,
    '["Toprak analizi","Rotasyon"]'::jsonb,
    'Toprak analizi ve rotasyon',
    '["tomato"]'::jsonb, 'seed', 0.94, 'tr'
  )
on conflict (slug) do update set
  crop = excluded.crop,
  category = excluded.category,
  summary_tr = excluded.summary_tr,
  summary_en = excluded.summary_en,
  symptoms = excluded.symptoms,
  symptoms_text = excluded.symptoms_text,
  related_crops = excluded.related_crops,
  confidence_level = excluded.confidence_level;

update public.knowledge_items
set related_crops = '["grape"]'::jsonb, crop = 'grape'
where slug in ('grape-powdery-mildew', 'grape-vine');

update public.knowledge_items
set related_crops = '["grape","tomato","wheat"]'::jsonb
where slug = 'powdery-mildew';
