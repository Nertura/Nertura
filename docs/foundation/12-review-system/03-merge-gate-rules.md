# 03 — Merge Gate Rules

## Purpose

Hard rules for merge — no exceptions without product team approval + ADR.

---

## Automatic Block (CI / Scripts)

| Check | Command | Block |
|-------|---------|-------|
| Type safety | `pnpm typecheck` | Yes |
| Build | `pnpm build` | Yes |
| i18n guard | `pnpm check:i18n` | Yes |
| CSS architecture | `pnpm check:css-imports` | Yes |
| Legacy AI path | `pnpm test:no-legacy-chat` | Yes |

Optional CI (continue-on-error until secrets wired):

- `pnpm test:doctor-language`
- `pnpm test:projects-engine`

---

## Manual Block (Reviewer)

| Condition | Block |
|-----------|-------|
| P0 security (auth bypass, RLS hole, leaked secret) | Yes |
| Mixed TR/EN on farmer surface | Yes |
| Broken primary CTA on touched route | Yes |
| Unsafe AI certainty (low evidence, strong claim) | Yes |
| Hardcoded farmer copy (bypasses i18n) | Yes |
| App layout imports `@nertura/ui` CSS directly | Yes |
| Feature without gate question yes | Yes |
| Scorecard total < 95 (internal) | Yes |
| Launch tag: any critical dimension < 9 | Yes |

---

## Allowed with Documented Debt

| Condition | Requirement |
|-----------|-------------|
| Score 7 on non-critical dimension | Fix ticket + sprint plan |
| Manual QA not run | Only for docs-only PRs |
| a11y score 7 | Not for launch-tagged release |

Debt must be logged in `SESSION_SUMMARY.md` or issue tracker.

---

## Docs-Only PRs

Required:

- Constitution compliance
- No contradiction with Five Books
- Links resolve to existing files
- ADR if architectural decision

Skipped:

- Runtime tests (unless links to code examples break build)

---

## Emergency Hotfix

Only for P0 production outage:

1. Minimal fix
2. Post-merge scorecard within 24h
3. ADR if architecture changed

---

## Cross-References

- [`08-quality/PRODUCT_REVIEW_SYSTEM.md`](../08-quality/PRODUCT_REVIEW_SYSTEM.md)
- [`01-definition-of-done.md`](../08-quality/01-definition-of-done.md)
