# Nertura Product Review System

> **No merge if any critical dimension fails.**

**Version:** 1.0 · June 2026  
**Parent:** [`NERTURA_CORE.md`](../NERTURA_CORE.md)  
**Companion:** [`12-review-system/`](../12-review-system/)

---

## Purpose

Integrate quality, review, and merge gates into one system. Every feature, screen change, and AI behaviour change must pass review before merge.

---

## Review Dimensions (12)

| # | Dimension | Owner | Primary reference |
|---|-----------|-------|-------------------|
| 1 | Product Value | Product | Book 01 Ch. 12 |
| 2 | Farmer Experience | Product / UX | Experience Language |
| 3 | Design Consistency | Design | Book 02 |
| 4 | Writing Quality | Product / i18n | Writing System |
| 5 | AI Behaviour | AI | Intelligence Constitution |
| 6 | Security | Engineering | Security System |
| 7 | Performance | Engineering | Book 03 Ch. 10 |
| 8 | Accessibility | Design / Eng | Book 02 Ch. 12 |
| 9 | SEO | Growth | Book 05 Ch. 07 |
| 10 | Engineering Quality | Engineering | Book 03 |
| 11 | Data Integrity | Engineering | Book 03 Ch. 05 |
| 12 | Operational Safety | Ops / Product | Growth approval-first |

Full scorecard: [`12-review-system/02-review-scorecard.md`](../12-review-system/02-review-scorecard.md)

---

## Scoring

| Level | Per dimension | Total (12 × 10) |
|-------|---------------|-----------------|
| **Pass (internal)** | ≥ 8 | ≥ 95 (≈79%) |
| **Production-ready** | ≥ 8 avg | ≥ 108 (90%) |
| **Public launch** | No dimension < 9 | All critical ≥ 9 |

---

## Automatic Merge Blocks (P0)

No merge if any of:

- [ ] `pnpm build` fails
- [ ] `pnpm typecheck` fails
- [ ] `pnpm check:i18n` fails
- [ ] `pnpm check:css-imports` fails
- [ ] Mixed language on farmer surface
- [ ] Broken primary action on touched route
- [ ] P0 security issue (auth bypass, RLS hole, secret leak)
- [ ] Unsafe AI certainty (claims without evidence path)
- [ ] Legacy `/api/ai/chat` or non-Intelligence-Engine AI path to farmers

---

## Review Workflow

1. Author completes compliance statement (Constitution Art. III)
2. Author runs quality matrix (DoD)
3. Author fills 12-dimension scorecard (self-review minimum)
4. Reviewer validates scorecard
5. Merge only if thresholds met + no P0 blocks

Merge rules detail: [`12-review-system/03-merge-gate-rules.md`](../12-review-system/03-merge-gate-rules.md)

---

## Docs-Only Changes

Documentation PRs skip AI/Performance/SEO runtime checks but must:

- Not contradict Constitution
- Link to existing chapters correctly
- Pass link existence manual check

---

## Cross-References

- [`01-definition-of-done.md`](01-definition-of-done.md)
- [`02-route-audit-criteria.md`](02-route-audit-criteria.md)
- [`PRE_COMMIT_CHECKLIST.md`](../PRE_COMMIT_CHECKLIST.md)
