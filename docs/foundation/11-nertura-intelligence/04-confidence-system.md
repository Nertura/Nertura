# 04 — Confidence System

## Purpose

How Nertura scores, gates, and communicates confidence.

**Canonical thresholds:** Book 04 Ch. 04 (implementation-aligned)

---

## Principles

1. Confidence is a **signal**, not marketing
2. Low confidence → clarification or cautious wording — not forced diagnosis
3. Never display 100% except human-verified cases (not current product behaviour)
4. Farmer label: **Güven** — approximate, paired with monitoring guidance

---

## Key Gates (Runtime)

| Gate | Threshold | Effect |
|------|-----------|--------|
| KB direct serve | score ≥ 0.78, crop match | KB path without synthesis |
| Vision minimum | ≥ 0.52 | Photo-based diagnosis allowed |
| TR KB direct | `summary_tr` required | No English KB fallback |

---

## Language by Confidence Band

| Band | Farmer messaging |
|------|------------------|
| High | Specific guidance + Güven label |
| Medium | "Olası durum" + monitor + optional expert |
| Low | "Fotoğraftan kesin teşhis için yeterli netlik yok" + retake guidance |
| Clarification | Ask for more detail / better photo |

---

## Forbidden

- "Kesin teşhis" on automated low-evidence path
- Hidden confidence (farmer sees nothing when claim is strong)
- English "Confidence: 85%" on TR surface

---

## Code

- `packages/ai/src/knowledge-bank-doctor.ts`
- `packages/ai/src/vision-analysis.ts`
- `packages/ui/src/components/doctor-answer-card.tsx`

---

## Cross-References

- Book 04 Ch. 04 — Confidence and uncertainty
- AI Constitution Art. I–II
