# 02 — Review Scorecard

## Purpose

Reusable scorecard for PRs, sprints, and route audits.

Copy into PR description or `SESSION_SUMMARY.md`.

---

## 12-Dimension Review

| Dimension | Score (/10) | Evidence | Fix if below threshold |
|-----------|-------------|----------|------------------------|
| Product Value | | Gate question; user goal | Re-scope or reject |
| Farmer Experience | | Surface feel map; QA | UX polish |
| Design Consistency | | check:css-imports; Book 02 | Token/component fix |
| Writing Quality | | check:i18n; copy modules | i18n / TR rewrite |
| AI Behaviour | | doctor-language test | Engine/normalizer fix |
| Security | | Auth/RLS review | Block merge |
| Performance | | build; spot Lighthouse | Optimize hot path |
| Accessibility | | keyboard; contrast | a11y fix |
| SEO | | meta/canonical | marketing layout |
| Engineering Quality | | typecheck; review | Refactor |
| Data Integrity | | tests; migration review | Schema fix |
| Operational Safety | | approval paths | Add guard |

**Total:** _____ / 120

---

## Thresholds

| Gate | Required |
|------|----------|
| Each dimension | ≥ 8 |
| Internal merge | ≥ 95 total |
| Production-ready | ≥ 108 total |
| Launch (critical dims) | Each ≥ 9 |

---

## P0 Merge Blocks (check even if scores pass)

- [ ] build / typecheck fail
- [ ] check:i18n fail
- [ ] check:css-imports fail
- [ ] Mixed language farmer surface
- [ ] Broken primary action
- [ ] P0 security issue
- [ ] Unsafe AI certainty
- [ ] Non-Intelligence-Engine AI path

---

## Reviewer Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Author self-review | | | |
| Reviewer | | | |

---

## Example (Docs Sprint)

| Dimension | Score | Note |
|-----------|-------|------|
| Product Value | 10 | Governance prevents drift |
| Farmer Experience | N/A | Docs only |
| Design Consistency | N/A | Docs only |
| Writing Quality | 9 | Writing System created |
| AI Behaviour | 9 | AI Constitution documented |
| Security | 9 | Principles documented |
| Performance | N/A | |
| Accessibility | N/A | |
| SEO | N/A | |
| Engineering Quality | 10 | Links verified |
| Data Integrity | N/A | |
| Operational Safety | 10 | Review gates defined |
