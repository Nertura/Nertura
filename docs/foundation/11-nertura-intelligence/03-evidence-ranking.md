# 03 — Evidence Ranking

## Purpose

How evidence is selected, ordered, and presented to farmers.

---

## Evidence Card Types

Typical Doctor evidence (TR labels):

| Card | Purpose |
|------|---------|
| Bilgi Bankası | KB hit summary |
| Tarla Profili | Field context |
| Hava / Bölgesel Risk | Weather/regional |
| Görsel analiz | Vision summary (sanitized TR) |
| Benzer vakalar | Similar cases (when available) |

---

## Presentation Rules

1. **Titles in farmer language** — never "Knowledge Bank", "Confidence"
2. **Summaries sanitized** — `normalizeEvidenceCardsLanguage()` for TR
3. **Empty states honest** — "Henüz tarla profili eklenmedi." not fake data
4. **Order by relevance** — KB + vision + context; not random
5. **No raw provider output** — Gemini English observations replaced before display

---

## Evidence vs Answer

| Layer | Farmer sees |
|-------|-------------|
| Answer body | Olası durum, Bugün ne yapın, Dikkat edin |
| Evidence cards | Supporting why — expandable detail |

Evidence supports the answer; it does not replace actionable guidance.

---

## Ranking Logic (Conceptual)

1. Verified KB match (high score, crop match)
2. Vision agreement with KB
3. Field / weather context
4. Similar historical cases
5. General cultivation guidance (growing questions — not disease misroute)

---

## Code

- `packages/ai/src/evidence-cards.ts`
- `packages/ai/src/vision-analysis.ts` — `formatVisionSummaryForEvidence`

---

## Cross-References

- Book 04 Ch. 06
- Writing System — Kanıt Kartları, Bilgi Bankası
