# Supabase Auth Email Templates — Nertura (Türkçe)

Production Supabase Auth e-posta şablonları Türkçe ve Nertura markasıyla yapılandırılmalıdır.

**Konum:** Supabase Dashboard → Authentication → Email Templates

Backend kodu bu repoda değiştirilmez; şablonlar Supabase projesinde güncellenir.

---

## Confirm signup (E-posta doğrulama)

**Subject (Konu):**

```
Nertura hesabınızı doğrulayın
```

**Body (HTML önerisi):**

```html
<h2>Nertura'ya hoş geldiniz</h2>
<p>Hesabınızı etkinleştirmek için aşağıdaki bağlantıya tıklayın.</p>
<p><a href="{{ .ConfirmationURL }}">E-posta adresimi doğrula</a></p>
<p>Bu bağlantı kısa süre içinde geçerliliğini yitirir. Siz talep etmediyseniz bu e-postayı yok sayabilirsiniz.</p>
<p>— Nertura AI Tarım Doktoru</p>
```

**Button metni (Magic Link / Confirm şablonunda):**

```
E-posta adresimi doğrula
```

**Footer:**

```
Nertura AI Tarım Doktoru
```

---

## Magic Link (varsa)

**Subject:**

```
Nertura giriş bağlantınız
```

**Body özeti:**

```
Giriş yapmak için bağlantıya tıklayın: {{ .ConfirmationURL }}
— Nertura AI Tarım Doktoru
```

---

## Reset password (Şifre sıfırlama)

**Subject:**

```
Nertura şifre sıfırlama
```

**Body özeti:**

```
Şifrenizi sıfırlamak için: {{ .ConfirmationURL }}
Bu isteği siz yapmadıysanız e-postayı yok sayın.
— Nertura AI Tarım Doktoru
```

**Button:**

```
Şifremi sıfırla
```

---

## Change email address

**Subject:**

```
Nertura e-posta değişikliğini onaylayın
```

**Button:**

```
Yeni e-postayı doğrula
```

---

## Invite user (admin davetleri)

**Subject:**

```
Nertura'ya davet edildiniz
```

---

## Kontrol listesi

- [ ] Tüm şablon konuları Türkçe
- [ ] İngilizce "Confirm your email address" kaldırıldı
- [ ] Marka adı: **Nertura** (tutarlı)
- [ ] Footer: **Nertura AI Tarım Doktoru**
- [ ] Gönderen adı: `Nertura` veya `noreply@nertura.com` (DNS/SPF ayarlı)
- [ ] `{{ .ConfirmationURL }}` redirect: dashboard onboarding veya `/doctor`

---

## Uygulama içi karşılık

Kayıt sonrası uygulama mesajı (`auth-copy.ts`):

- **Başlık:** E-postanızı kontrol edin
- **Metin:** `[e-posta] adresine onay bağlantısı gönderdik. Hesabınızı etkinleştirdikten sonra AI Doktor'a devam edebilirsiniz.`
- **Buton:** Giriş sayfasına dön

Supabase şablonu ile uygulama mesajı aynı ton ve terminolojiyi kullanmalıdır.
