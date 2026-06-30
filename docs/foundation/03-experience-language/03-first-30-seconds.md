# 03 — First 30 Seconds (Experience Layer)

## Purpose

Extend Book 01 Ch. 10 with **experience feel** targets for the activation window.

**Canonical metrics:** [`01-product-bible/10-first-30-seconds.md`](../01-product-bible/10-first-30-seconds.md)

---

## Experience Targets by Second Block

### Guest (Marketing) — 0–30s

| Block | Feel target | Experience signal |
|-------|-------------|-------------------|
| 0–3s | **Trust** | Styled page, calm layout, no popups |
| 3–10s | **Clarity** | Composer obvious; placeholder in farmer language |
| 10–25s | **Patience** | Thinking state honest; no fake instant answers |
| 25–30s | **Guidance** | Short Turkish answer; useful even if incomplete |

**Success feeling:** *"Bu tarımı anlıyor."*

### Registered (Dashboard Doctor) — 0–30s

| Block | Feel target | Experience signal |
|-------|-------------|-------------------|
| 0–5s | **Continuity** | Returns to Doctor; no disorienting redirect |
| 5–15s | **Context** | Field/case context visible if available |
| 15–30s | **Memory** | Answer references prior context when relevant |

**Success feeling:** *"Tarlamı hatırlıyor."*

---

## Failure Feelings (Avoid)

| Failure | Farmer feels | Fix direction |
|---------|--------------|---------------|
| English leak | "This isn't for me" | Language lock + i18n guard |
| Generic AI fluff | "Chatbot toy" | KB-first, specific agriculture copy |
| 500 error | "Broken, untrustworthy" | Friendly TR error + retry path |
| Signup wall before value | "They want my data first" | Guest Doctor first |
| Blank loading | "Did it crash?" | Skeleton or honest thinking state |

---

## Measurement

Experience feel is validated through:

1. Manual QA checklist (`docs/testing/MANUAL_QA_CHECKLIST_v1.md`)
2. Automated language tests (`pnpm test:doctor-language`)
3. Session observation (closed beta)

Numeric KPIs remain in Book 01 Ch. 10 (A0–A6 activation events).
