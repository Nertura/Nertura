# 01 — 12-Dimension Review Bar

## Purpose

Define each review dimension, pass criteria, and evidence expectations.

---

## Dimensions

### 1. Product Value (≥8)

Does this help the farmer make a better agricultural decision faster?

**Evidence:** Gate question yes; maps to Book 01 Ch. 12; user goal clear.

### 2. Farmer Experience (≥8)

Is the screen calm, guided, and understandable in 5 seconds?

**Evidence:** Experience Language surface map; manual QA or walkthrough.

### 3. Design Consistency (≥8)

Does it use `@nertura/ui` tokens/components? No one-off CSS?

**Evidence:** `pnpm check:css-imports`; visual match to Book 02.

### 4. Writing Quality (≥8)

Natural Turkish; centralized copy; no forbidden words?

**Evidence:** `pnpm check:i18n`; Writing System checklist.

### 5. AI Behaviour (≥8)

Intelligence Engine path; confidence honest; no certainty leaks?

**Evidence:** `pnpm test:doctor-language`; AI Constitution compliance.

### 6. Security (≥8)

Auth, RLS, uploads, secrets — no new vulnerabilities?

**Evidence:** Security review; no P0 findings.

### 7. Performance (≥8)

No obvious regression; bundle acceptable; no duplicate fetches?

**Evidence:** Build pass; spot check Lighthouse if UI-heavy.

### 8. Accessibility (≥8)

Focus, labels, contrast, 44px targets?

**Evidence:** Keyboard walkthrough; axe spot check (full audit P1).

### 9. SEO (≥8)

(Public routes) metadata, canonical, schema?

**Evidence:** View source / metadata inspection. N/A for dashboard-only.

### 10. Engineering Quality (≥8)

Types clean; patterns match repo; no dead code?

**Evidence:** `pnpm typecheck`; code review.

### 11. Data Integrity (≥8)

Correct DB writes; no fake data; migrations safe?

**Evidence:** Tests; migration review if schema touched.

### 12. Operational Safety (≥8)

No auto-send; no unreviewed farmer impact; rollback possible?

**Evidence:** Growth/knowledge approval paths respected.

---

## Scoring Guide

| Score | Meaning |
|-------|---------|
| 9–10 | Exemplary; ship |
| 8 | Acceptable; ship with notes |
| 6–7 | Fix before merge |
| 0–5 | Reject; redesign or defer |

---

## Public Launch Rule

**No critical dimension below 9** for launch-tagged releases:

- Product Value, Farmer Experience, Writing, AI Behaviour, Security
