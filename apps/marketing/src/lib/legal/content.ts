export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  list?: string[];
}

export interface LegalPageContent {
  slug: string;
  title: string;
  description: string;
  version: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const LEGAL_PAGES: LegalPageContent[] = [
  {
    slug: 'privacy',
    title: 'Gizlilik Politikası',
    description: 'Nertura kişisel verilerinizi nasıl toplar, kullanır ve korur.',
    version: '1.0',
    lastUpdated: '2026-06-19',
    sections: [
      {
        id: 'introduction',
        title: '1. Giriş',
        paragraphs: [
          'Nertura ("biz") nertura.com, çiftçi paneli ve ilgili hizmetleri ("Hizmet") sunar.',
          'Bu Gizlilik Politikası hangi kişisel verileri topladığımızı, neden topladığımızı, nasıl kullandığımızı ve haklarınızı açıklar. Hizmeti kullanarak bu politikayı kabul etmiş olursunuz.',
        ],
      },
      {
        id: 'data-we-collect',
        title: '2. Topladığımız Veriler',
        paragraphs: ['Aşağıdaki kişisel veri kategorilerini işleyebiliriz:'],
        list: [
          'Hesap bilgileri: ad, e-posta, telefon (varsa), organizasyon adı ve kimlik doğrulama kayıtları.',
          'Kullanım verileri: AI Doktor soruları, konuşma geçmişi, kredi kullanımı ve özellik etkileşimleri.',
          'Yüklenen içerik: AI analizi için gönderdiğiniz bitki fotoğrafları ve ekler.',
          'Ödeme verileri: ödeme sağlayıcısı üzerinden işlenen fatura bilgileri (tam kart numarası saklanmaz).',
          'Teknik veriler: IP adresi, tarayıcı türü, cihaz tanımlayıcıları ve çerezler (Çerez Politikası).',
        ],
      },
      {
        id: 'how-we-use',
        title: '3. Verileri Nasıl Kullanıyoruz',
        paragraphs: ['Kişisel verileri şu amaçlarla kullanırız:'],
        list: [
          'AI tarım danışmanlığı Hizmetini sunmak, sürdürmek ve geliştirmek.',
          'Kimlik doğrulama ve hesap güvenliği.',
          'Ödeme işleme ve kredi yönetimi.',
          'Hizmet bildirimleri (hesap uyarıları, güvenlik mesajları).',
          'Yasal yükümlülükler ve meşru taleplere yanıt.',
          'Ürün kalitesini iyileştirmek için anonimleştirilmiş, toplu analiz.',
        ],
      },
      {
        id: 'ai-processing',
        title: '4. Yapay Zeka İşleme',
        paragraphs: [
          'Gönderdiğiniz soru ve görseller tarımsal rehberlik üretmek için üçüncü taraf AI sağlayıcıları tarafından işlenebilir. Veri minimizasyonu ve sözleşmesel güvenceler uygulanır.',
          'AI çıktıları yalnızca bilgilendirme amaçlıdır; profesyonel ziraat veya veteriner tavsiyesi yerine geçmez. Bkz. AI Sorumluluk Reddi.',
        ],
      },
      {
        id: 'sharing',
        title: '5. Veri Paylaşımı',
        paragraphs: [
          'Kişisel verilerinizi satmayız. Barındırma, kimlik doğrulama, e-posta, ödeme ve AI altyapı sağlayıcılarıyla veri işleme sözleşmeleri kapsamında paylaşabiliriz; yasal zorunluluk halinde yetkili kurumlarla paylaşım yapılabilir.',
        ],
      },
      {
        id: 'retention',
        title: '6. Saklama',
        paragraphs: [
          'Veriler hesabınız aktif olduğu sürece veya yasal yükümlülükler gerektirdiği sürece saklanır. Silme talebi için Hesap Silme sayfasına bakın.',
        ],
      },
      {
        id: 'your-rights',
        title: '7. Haklarınız',
        paragraphs: [
          'Konumunuza göre erişim, düzeltme, silme, kısıtlama veya taşınabilirlik haklarına sahip olabilirsiniz. privacy@nertura.com adresinden başvurabilirsiniz.',
          'AB/EEA kullanıcıları: GDPR sayfası. Türkiye kullanıcıları: KVKK Aydınlatma Metni.',
        ],
      },
      {
        id: 'security',
        title: '8. Güvenlik',
        paragraphs: [
          'Aktarım şifrelemesi, erişim kontrolleri ve izleme dahil teknik ve idari önlemler uygularız. İnternet üzerinden aktarımın %100 güvenli olmadığını unutmayın.',
        ],
      },
      {
        id: 'contact',
        title: '9. İletişim',
        paragraphs: [
          'Veri sorumlusu: Nertura. E-posta: privacy@nertura.com. Genel sorular için İletişim sayfası.',
        ],
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Kullanım Koşulları',
    description: 'Nertura platformunu kullanımınızı düzenleyen koşullar.',
    version: '1.0',
    lastUpdated: '2026-06-19',
    sections: [
      {
        id: 'acceptance',
        title: '1. Kabul',
        paragraphs: [
          'Bu Kullanım Koşulları ("Koşullar") Nertura web siteleri, panel ve AI Doktor hizmetlerine erişiminizi düzenler. Hesap oluşturarak veya Hizmeti kullanarak bu Koşulları kabul etmiş olursunuz.',
        ],
      },
      {
        id: 'eligibility',
        title: '2. Uygunluk',
        paragraphs: [
          'En az 18 yaşında (veya bulunduğunuz ülkede reşit yaşı) olmalı ve bağlayıcı sözleşme yapabilmelisiniz. Kurumsal kullanıcılar organizasyonu bağlama yetkisine sahip olduklarını beyan eder.',
        ],
      },
      {
        id: 'accounts',
        title: '3. Hesaplar',
        paragraphs: [
          'Kimlik bilgilerinizi ve hesabınızdaki tüm faaliyetleri korumaktan siz sorumlusunuz. Yetkisiz erişimi derhal bize bildirin.',
        ],
      },
      {
        id: 'service',
        title: '4. Hizmet',
        paragraphs: [
          'Nertura yapay zekâ destekli tarımsal bilgi araçları sunar. Özellikler, kredi limitleri ve erişilebilirlik değişebilir. Koşulları veya yasaları ihlal eden hesaplar askıya alınabilir.',
        ],
      },
      {
        id: 'acceptable-use',
        title: '5. Kabul Edilebilir Kullanım',
        paragraphs: ['Aşağıdakileri yapmamayı kabul edersiniz:'],
        list: [
          'Hizmeti yasadışı, zararlı veya hileli amaçlarla kullanmak.',
          'Sistemleri tersine mühendislik, kazıma veya aşırı yüklemek.',
          'Paylaşım hakkınız olmayan içerik yüklemek.',
          'AI çıktılarına profesyonel doğrulama olmadan tek başına pestisit veya tedavi kararı vermek.',
        ],
      },
      {
        id: 'payments',
        title: '6. Ödemeler ve Krediler',
        paragraphs: [
          'Ücretli kredi paketleri yasal zorunluluk dışında iade edilmez. Fiyatlar ödeme ekranında gösterilir. Başarısız ödemeler erişimi kısıtlayabilir.',
        ],
      },
      {
        id: 'ip',
        title: '7. Fikri Mülkiyet',
        paragraphs: [
          'Nertura Hizmet, marka ve yazılım üzerindeki tüm hakları saklı tutar. Gönderdiğiniz içeriğin sahibi sizsiniz; Hizmeti sunmak için işleme lisansı verirsiniz.',
        ],
      },
      {
        id: 'disclaimer',
        title: '8. Sorumluluk Reddi',
        paragraphs: [
          'HİZMET "OLDUĞU GİBİ" SUNULUR. Yürürlükteki yasanın izin verdiği azami ölçüde Nertura dolaylı veya arızi zararlardan sorumlu tutulamaz.',
        ],
      },
      {
        id: 'termination',
        title: '9. Fesih',
        paragraphs: [
          'Hesabınızı istediğiniz zaman kapatabilirsiniz. Koşul ihlali halinde erişimi sonlandırabiliriz. Doğası gereği devam etmesi gereken hükümler yürürlükte kalır.',
        ],
      },
      {
        id: 'governing-law',
        title: '10. Uygulanacak Hukuk',
        paragraphs: [
          'Bu Koşullar, zorunlu tüketici korumaları saklı kalmak kaydıyla Türkiye Cumhuriyeti kanunlarına tabidir.',
        ],
      },
    ],
  },
  {
    slug: 'cookies',
    title: 'Çerez Politikası',
    description: 'Nertura çerezleri ve benzer teknolojileri nasıl kullanır.',
    version: '1.0',
    lastUpdated: '2026-06-19',
    sections: [
      {
        id: 'what-are-cookies',
        title: '1. Çerez Nedir?',
        paragraphs: [
          'Çerezler web sitesini ziyaret ettiğinizde cihazınıza kaydedilen küçük metin dosyalarıdır. Tema gibi tercihler için yerel depolama da kullanırız.',
        ],
      },
      {
        id: 'types',
        title: '2. Kullandığımız Çerezler',
        paragraphs: ['Aşağıdaki kategorileri kullanırız:'],
        list: [
          'Zorunlu: oturum açık tutma, güvenlik ve temel site işlevleri.',
          'İşlevsel: karanlık mod ve dil tercihleri.',
          'Analitik: performansı anlamak için toplu kullanım metrikleri (yalnızca onay sonrası).',
          'Pazarlama: kampanya ölçümü (yalnızca onay sonrası).',
        ],
      },
      {
        id: 'third-party',
        title: '3. Üçüncü Taraf Çerezleri',
        paragraphs: [
          'Kimlik doğrulama (Supabase), ödeme (Stripe) ve onay sonrası analitik sağlayıcılar kendi çerezlerini ayarlayabilir.',
        ],
      },
      {
        id: 'banner',
        title: '4. Çerez Tercihleri',
        paragraphs: [
          'Sitede çerez banner\'ı ile Kabul et, Reddet veya Tercihleri yönet seçenekleri sunulur. Zorunlu olmayan çerezler yalnızca açık onayınızdan sonra etkinleştirilir. Tercihleriniz localStorage ve nertura_consent çerezinde saklanır.',
        ],
      },
      {
        id: 'control',
        title: '5. Seçenekleriniz',
        paragraphs: [
          'Tarayıcı ayarlarından çerezleri yönetebilirsiniz. Zorunlu çerezleri kapatmak oturum açmayı engelleyebilir. Sorularınız için privacy@nertura.com',
        ],
      },
    ],
  },
  {
    slug: 'ai-disclaimer',
    title: 'AI Tarım Danışmanı Sorumluluk Reddi',
    description: 'Nertura AI tarım danışmanlığı hakkında önemli sınırlamalar.',
    version: '1.0',
    lastUpdated: '2026-06-19',
    sections: [
      {
        id: 'not-professional-advice',
        title: '1. Profesyonel Tavsiye Değildir',
        paragraphs: [
          'Nertura AI çıktıları makine öğrenmesi modelleri tarafından üretilir ve yalnızca bilgilendirme amaçlıdır. Profesyonel ziraat, veteriner, hukuk veya düzenleyici tavsiye yerine geçmez.',
        ],
      },
      {
        id: 'accuracy',
        title: '2. Doğruluk ve Sınırlamalar',
        paragraphs: [
          'AI yanlış, eksik veya güncel olmayan bilgi üretebilir. Fotoğraftan hastalık teşhisi hatalı olabilir. Tedavi, pestisit veya ürün kararlarından önce yetkili ziraat mühendisi veya uzman görüşü alın.',
        ],
      },
      {
        id: 'regulatory',
        title: '3. Mevzuat Uyumu',
        paragraphs: [
          'Pestisit kullanımı, organik sertifikasyon ve gıda güvenliği dahil yerel yasalara uyum tamamen sizin sorumluluğunuzdadır.',
        ],
      },
      {
        id: 'emergency',
        title: '4. Acil Durumlar',
        paragraphs: [
          'Hayati tehlike, geniş ölçekli ürün kaybı veya hayvan sağlığı acilleri için Nertura kullanmayın; yerel yetkililere ve uzmanlara başvurun.',
        ],
      },
      {
        id: 'liability',
        title: '5. Sorumluluk Sınırı',
        paragraphs: [
          'AI içeriğine güvenmekten doğan ürün zararı veya mali kayıptan Nertura sorumlu tutulamaz. Kendi kararınızla kullanın.',
        ],
      },
    ],
  },
  {
    slug: 'gdpr',
    title: 'GDPR Information',
    description: 'Privacy rights for users in the European Economic Area.',
    version: '1.0',
    lastUpdated: '2026-06-19',
    sections: [
      {
        id: 'controller',
        title: '1. Data Controller',
        paragraphs: [
          'Nertura is the data controller for personal data processed through the Service. Contact: privacy@nertura.com.',
        ],
      },
      {
        id: 'legal-bases',
        title: '2. Legal Bases (Art. 6 GDPR)',
        paragraphs: ['We process personal data on the following bases:'],
        list: [
          'Contract: to provide the Service you requested.',
          'Legitimate interests: security, fraud prevention, product improvement (balanced against your rights).',
          'Consent: where required for marketing or non-essential cookies.',
          'Legal obligation: tax, accounting, and regulatory compliance.',
        ],
      },
      {
        id: 'rights',
        title: '3. Your Rights',
        paragraphs: ['EEA users may exercise:'],
        list: [
          'Right of access, rectification, erasure, restriction, and portability.',
          'Right to object to processing based on legitimate interests.',
          'Right to withdraw consent at any time.',
          'Right to lodge a complaint with your supervisory authority.',
        ],
      },
      {
        id: 'transfers',
        title: '4. International Transfers',
        paragraphs: [
          'Data may be processed outside the EEA using Standard Contractual Clauses or other approved mechanisms where applicable.',
        ],
      },
      {
        id: 'dpo',
        title: '5. Contact',
        paragraphs: [
          'Submit GDPR requests to privacy@nertura.com. We respond within one month, extendable where permitted by law.',
        ],
      },
    ],
  },
  {
    slug: 'kvkk',
    title: 'KVKK Aydınlatma Metni',
    description: '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında bilgilendirme.',
    version: '1.0',
    lastUpdated: '2026-06-19',
    sections: [
      {
        id: 'veri-sorumlusu',
        title: '1. Veri Sorumlusu',
        paragraphs: [
          '6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu Nertura\'dır. İletişim: privacy@nertura.com',
        ],
      },
      {
        id: 'islenen-veriler',
        title: '2. İşlenen Kişisel Veriler',
        paragraphs: ['Hizmet kapsamında işlenebilecek veriler:'],
        list: [
          'Kimlik ve iletişim: ad, soyad, e-posta, telefon, organizasyon bilgisi.',
          'İşlem güvenliği: oturum kayıtları, IP adresi, log verileri.',
          'Kullanım: AI Doctor soruları, yüklenen görseller, kredi kullanımı.',
          'Finans: fatura ve ödeme kayıtları (kart numarası tarafımızca saklanmaz).',
        ],
      },
      {
        id: 'amaçlar',
        title: '3. İşleme Amaçları',
        paragraphs: [
          'Kişisel veriler; sözleşmenin kurulması ve ifası, hizmet güvenliği, yasal yükümlülüklerin yerine getirilmesi ve meşru menfaatlerimiz kapsamında işlenir.',
        ],
      },
      {
        id: 'aktarım',
        title: '4. Aktarım',
        paragraphs: [
          'Veriler; barındırma, kimlik doğrulama, ödeme ve yapay zeka altyapı sağlayıcılarına, yasal zorunluluk halinde yetkili kurumlara aktarılabilir.',
        ],
      },
      {
        id: 'haklar',
        title: '5. İlgili Kişi Hakları (KVKK m.11)',
        paragraphs: [
          'KVKK kapsamında; verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini talep etme, zarara uğramanız halinde tazmin talep etme haklarına sahipsiniz. Başvurularınızı privacy@nertura.com adresine iletebilirsiniz.',
        ],
      },
    ],
  },
  {
    slug: 'delete-account',
    title: 'Hesap Silme',
    description: 'Nertura hesabınızın ve verilerinizin kalıcı olarak silinmesini nasıl talep edersiniz.',
    version: '1.0',
    lastUpdated: '2026-06-19',
    sections: [
      {
        id: 'overview',
        title: '1. Genel Bakış',
        paragraphs: [
          'Nertura hesabınızın ve ilişkili kişisel verilerin kalıcı silinmesini talep edebilirsiniz. Silme işlemi geri alınamaz.',
        ],
      },
      {
        id: 'self-service',
        title: '2. Talep Yöntemi',
        paragraphs: [
          'Kayıtlı e-posta adresinizden support@nertura.com adresine "Hesap Silme Talebi" konulu e-posta gönderin. İşlemden önce hesap sahipliğini doğrularız.',
        ],
      },
      {
        id: 'what-is-deleted',
        title: '3. Silinen Veriler',
        paragraphs: ['Onaylanan silme sonrası kaldırılan veya anonimleştirilen veriler:'],
        list: [
          'Hesap profili ve kimlik doğrulama kayıtları.',
          'Organizasyon üyeliği (tek sahip iseniz organizasyon da silinebilir).',
          'AI konuşma geçmişi ve hesabınıza bağlı yüklenen görseller.',
          'Yasal saklama gerektirmeyen fatura tanımlayıcıları.',
        ],
      },
      {
        id: 'retained',
        title: '4. Saklanabilecek Veriler',
        paragraphs: [
          'Vergi, dolandırıcılık önleme veya yasal uyum için gerekli asgari kayıtlar, yasaların öngördüğü süre boyunca anonim veya toplu formda saklanabilir.',
        ],
      },
      {
        id: 'timeline',
        title: '5. İşlem Süresi',
        paragraphs: [
          'Silme talepleri 30 gün içinde işlenir. Tamamlandığında e-posta onayı gönderilir.',
        ],
      },
    ],
  },
  {
    slug: 'contact',
    title: 'İletişim',
    description: 'Nertura ekibiyle iletişime geçin.',
    version: '1.0',
    lastUpdated: '2026-06-19',
    sections: [
      {
        id: 'general',
        title: 'Genel',
        paragraphs: [
          'E-posta: hello@nertura.com',
          'Destek: support@nertura.com',
          'Gizlilik ve veri talepleri: privacy@nertura.com',
        ],
      },
      {
        id: 'business',
        title: 'İş Ortaklıkları',
        paragraphs: [
          'Kurumsal, distribütör veya entegrasyon talepleri için hello@nertura.com adresine "Ortaklık" konulu e-posta gönderin.',
        ],
      },
      {
        id: 'response',
        title: 'Yanıt Süreleri',
        paragraphs: [
          'Destek taleplerine 2 iş günü içinde yanıt vermeyi hedefliyoruz. security@nertura.com adresine bildirilen güvenlik konuları önceliklidir.',
        ],
      },
    ],
  },
  {
    slug: 'about',
    title: 'About Nertura',
    description: 'Our mission to bring AI intelligence to agriculture worldwide.',
    version: '1.0',
    lastUpdated: '2026-06-19',
    sections: [
      {
        id: 'mission',
        title: 'Our Mission',
        paragraphs: [
          'Nertura is the AI brain for agriculture — helping farmers, agronomists, and agribusiness teams diagnose plant problems, optimize inputs, and make confident decisions from field to enterprise.',
        ],
      },
      {
        id: 'product',
        title: 'What We Build',
        paragraphs: [
          'Our AI Agriculture Doctor combines vision models and agronomic knowledge to answer questions about crops, soil, irrigation, pests, and diseases. The platform scales from individual growers to organization-wide operations.',
        ],
      },
      {
        id: 'values',
        title: 'Our Values',
        paragraphs: ['We believe in:'],
        list: [
          'Ground-truth agriculture — recommendations rooted in science and local context.',
          'Responsible AI — transparency about limitations and human oversight.',
          'Global access — tools that work for diverse crops, climates, and languages.',
        ],
      },
      {
        id: 'company',
        title: 'Company',
        paragraphs: [
          'Nertura is built by a team focused on agricultural technology and enterprise SaaS. © 2025 Nertura. All rights reserved.',
        ],
      },
    ],
  },
  {
    slug: 'agricultural-disclaimer',
    title: 'Agricultural Disclaimer',
    description: 'Important limitations regarding crop, pesticide, and agronomic guidance.',
    version: '1.0',
    lastUpdated: '2026-06-19',
    sections: [
      {
        id: 'not-certified',
        title: 'Not Certified Agronomic Advice',
        paragraphs: [
          'Nertura provides AI-generated agricultural information only. We do not provide certified agronomy, pesticide recommendation, veterinary, legal, or regulatory services.',
          'Nertura AI advice does not replace a certified agricultural expert. Always consult qualified professionals before applying treatments, pesticides, or making crop decisions.',
        ],
      },
      {
        id: 'pesticide',
        title: 'Pesticide & Treatment Decisions',
        paragraphs: [
          'You are solely responsible for compliance with local laws governing pesticide use, organic certification, import/export, and food safety. Verify all product labels, dosages, and pre-harvest intervals with official sources.',
        ],
      },
      {
        id: 'liability',
        title: 'Limitation of Liability',
        paragraphs: [
          'Nertura is not liable for crop damage, financial loss, or harm resulting from reliance on AI-generated agricultural content.',
        ],
      },
    ],
  },
  {
    slug: 'data-export',
    title: 'Veri Dışa Aktarma',
    description: 'Nertura verilerinizin bir kopyasını nasıl talep edersiniz.',
    version: '1.0',
    lastUpdated: '2026-06-19',
    sections: [
      {
        id: 'request',
        title: 'Veri Talebi',
        paragraphs: [
          'Kayıtlı e-posta adresinizden privacy@nertura.com adresine "Veri Dışa Aktarma Talebi" konulu e-posta ile hesabınıza bağlı kişisel verilerin kopyasını talep edebilirsiniz.',
        ],
      },
      {
        id: 'included',
        title: 'Kapsam',
        paragraphs: ['Dışa aktarma şunları içerebilir:'],
        list: [
          'Hesap profili ve organizasyon üyeliği.',
          'AI konuşma geçmişi ve analizler (saklanıyorsa).',
          'Çiftlik, tarla ve ürün kayıtları.',
          'Kredi işlem geçmişi.',
        ],
      },
      {
        id: 'timeline',
        title: 'İşlem Süresi',
        paragraphs: [
          'Yürürlükteki gizlilik yasalarına uygun olarak 30 gün içinde yanıt verilir. Büyük aktarımlar güvenli bağlantı ile JSON veya CSV olarak iletilir.',
        ],
      },
    ],
  },
  {
    slug: 'photo-consent',
    title: 'Fotoğraf Yükleme Onayı',
    description: 'Bitki fotoğraflarınızın AI analizi için nasıl işlendiği.',
    version: '1.0',
    lastUpdated: '2026-06-19',
    sections: [
      {
        id: 'purpose',
        title: '1. Amaç',
        paragraphs: [
          'Nertura AI Tarım Doktoru\'na yüklediğiniz bitki, tarla veya ürün fotoğrafları yalnızca tarımsal analiz, teşhis desteği, hizmet kalitesi ve güvenlik amacıyla işlenir.',
          'Fotoğraflar reklam, profil pazarlama veya üçüncü taraflara satış amacıyla kullanılmaz.',
        ],
      },
      {
        id: 'processing',
        title: '2. İşleme',
        paragraphs: ['Fotoğraf yükleme ile aşağıdakileri kabul etmiş olursunuz:'],
        list: [
          'Görüntünün AI modelleri ve güvenli altyapı sağlayıcıları tarafından analiz edilmesi.',
          'Teşhis ve önerilerin hesabınızla ilişkilendirilmesi (vaka takibi dahil).',
          'Teknik güvenlik kontrolleri (format doğrulama, kötüye kullanım önleme).',
          'Yalnızca açık rızanız veya yasal dayanak ile anonimleştirilmiş ürün iyileştirme analizleri.',
        ],
      },
      {
        id: 'retention',
        title: '3. Saklama ve Silme',
        paragraphs: [
          'Fotoğraflar hesabınız aktif olduğu sürece veya yasal yükümlülükler gerektirdiği sürece saklanabilir. Hesap silme talebinde ilgili içerikler silinir veya anonimleştirilir — bkz. Hesap Silme sayfası.',
        ],
      },
      {
        id: 'rights',
        title: '4. Haklarınız',
        paragraphs: [
          'KVKK kapsamındaki haklarınız için KVKK Aydınlatma Metni\'ne bakın. Veri dışa aktarma veya silme: privacy@nertura.com',
        ],
      },
      {
        id: 'contact',
        title: '5. İletişim',
        paragraphs: ['Sorularınız için: privacy@nertura.com · support@nertura.com'],
      },
    ],
  },
];

export function getLegalPage(slug: string): LegalPageContent | undefined {
  return LEGAL_PAGES.find((p) => p.slug === slug);
}

export const LEGAL_NAV = LEGAL_PAGES.map(({ slug, title }) => ({ slug, title }));
