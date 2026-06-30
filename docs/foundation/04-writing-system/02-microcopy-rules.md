# 02 — Microcopy Rules

## Purpose

Rules for buttons, labels, errors, empty states, and inline hints.

---

## Buttons

| Rule | Example (TR) |
|------|--------------|
| Verb-first | "Gönder", "Kaydet", "Devam et" |
| No English verbs | ~~Submit~~, ~~Upload~~, ~~Retry~~ |
| Destructive = clear | "Sil" + confirmation — not vague "OK" |
| Primary = one per section | One filled CTA per viewport area |

---

## Form Labels

| Rule | Detail |
|------|--------|
| Sentence case | "E-posta adresi" not "E-POSTA" |
| Required marked | Asterisk or "(zorunlu)" |
| Helper below field | `body-sm`, muted — not tooltip-only |

---

## Errors

Every error must include:

1. **What happened** (plain language)
2. **What to do next** (actionable)
3. **No stack traces, codes, or internal IDs** visible to farmer

| Bad | Good (TR) |
|-----|-----------|
| "Error 500" | "Bir sorun oluştu. Lütfen tekrar deneyin." |
| "Network request failed" | "Bağlantı kurulamadı. İnternetinizi kontrol edip tekrar deneyin." |

---

## Empty States

| Rule | Detail |
|------|--------|
| Explain why empty | "Henüz vaka yok" + how to create |
| One CTA | "İlk sorunuzu sorun" → Doctor |
| No lorem ipsum | Ever |

---

## Loading States

| Rule | Detail |
|------|--------|
| Honest | "Analiz ediliyor…" — not fake instant |
| No English | ~~"Loading…"~~ → "Yükleniyor…" |
| Photo analysis | "Fotoğraf inceleniyor…" |

---

## Doctor-Specific Labels

Map to [`packages/ui/src/lib/i18n/doctor-ui-copy.ts`](../../../packages/ui/src/lib/i18n/doctor-ui-copy.ts):

- Güven (not Confidence)
- Kısa teşhis / Olası durum
- Bugün ne yapın
- Kanıt Kartları
- Bilgi Bankası

---

## Billing / Limits

| Internal term | Farmer-facing (TR) |
|---------------|-------------------|
| credits | analiz hakkı |
| subscription | abonelik / plan |
| tier | plan (Plus / Ücretsiz) |

---

## Trust Lines

Required where applicable:

- Photo: "Görselleriniz yalnızca analiz için kullanılır."
- AI disclaimer: "AI tavsiyesi sertifikalı bir tarım uzmanının yerini almaz."
