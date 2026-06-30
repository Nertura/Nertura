# 03 — Forbidden Words

## Purpose

Words and phrases that must **never** appear on farmer-facing surfaces (TR flows).

Enforced by `pnpm check:i18n` where listed in guard script; this document is the canonical reference.

---

## Forbidden English (TR farmer surfaces)

| Forbidden | Use instead (TR) |
|-----------|------------------|
| credits | analiz hakkı |
| upload | yükle / fotoğraf ekle |
| submit | gönder |
| retry | tekrar dene |
| Confidence | Güven |
| Knowledge Bank | Bilgi Bankası |
| SHORT DIAGNOSIS | Olası durum / Kısa teşhis |
| WHAT TO DO TODAY | Bugün ne yapın |
| Treatment plan | Bakım planı / Bugün ne yapın |
| case (visible) | vaka |
| project (visible) | proje → prefer **Vaka Takibi** |
| Photograph symptoms | (remove — use Turkish symptom language) |
| isolate affected leaves | (remove — use Turkish guidance) |

---

## Forbidden Technical Wording

Never show farmers:

- API, endpoint, JSON, UUID, token
- Stack traces, HTTP status codes
- Model names (Gemini, GPT, OpenAI)
- "Intelligence Engine", "RAG", "embedding"
- Database errors

Log these server-side only.

---

## Forbidden Certainty Language

| Forbidden pattern | Why |
|-------------------|-----|
| "Kesin teşhis: …" without expert verification path | Overclaims |
| "Mutlaka ilaç kullanın" without context | Safety risk |
| Specific chemical dosage without KB backing | Liability |

Use: "Olası durum", "Bugün ne yapın", "Yerel uzmanınıza danışın"

---

## Forbidden Mixed Language

In a single TR flow, never combine:

- TR title + EN body
- TR button + EN error
- TR nav + EN page content

---

## Forbidden Fake Data

Never present as real:

- Lorem ipsum in production UI
- Demo field names without "örnek" label
- Placeholder KPIs in farmer dashboard

---

## Admin Exception

Admin and Growth AI may use English internally for operator efficiency — but farmer-visible outputs (emails, content drafts for farmers) must follow this Writing System.

---

## Guard Integration

Add new forbidden patterns to:

- `scripts/check-hardcoded-farmer-strings.ts`
- `packages/ai/src/language-output-normalizer.ts` (AI output)

When adding a forbidden word here, update guards in the same PR.
