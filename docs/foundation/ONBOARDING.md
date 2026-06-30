# Nertura Foundation — Onboarding Path

> **Week one reading order for developers, designers, and product team members.**

---

## Day 1 — Why we exist

0. [`CONSTITUTION.md`](CONSTITUTION.md) — **read first** (supreme law + implementation workflow)
1. [`README.md`](README.md) — authority hierarchy, five books
2. [Book 01 — Vision & Mission](01-product-bible/01-vision-and-mission.md)
3. [Book 01 — Core Philosophy](01-product-bible/02-core-philosophy.md)
4. [Book 01 — Feature Gate Criteria](01-product-bible/12-feature-gate-criteria.md) ← **memorize this**

**Outcome:** You can explain Nertura in one sentence and apply the gate question.

**Before every commit:** [`PRE_COMMIT_CHECKLIST.md`](PRE_COMMIT_CHECKLIST.md)

---

## Day 2 — How it should look and feel

1. [Book 02 — Design Principles](02-design-system/01-design-principles.md)
2. [Book 02 — Doctor UI](02-design-system/07-doctor-ui.md)
3. [Book 02 — Map UI](02-design-system/08-map-ui.md)
4. [Book 02 — States & Errors](02-design-system/11-states-loading-empty-error.md)

**Outcome:** You know calm UX, short-first answers, friendly errors, map 73/27 layout.

---

## Day 3 — How we build

1. [Book 03 — Monorepo Architecture](03-engineering-standards/01-monorepo-architecture.md)
2. [Book 03 — React & Next.js](03-engineering-standards/04-react-and-nextjs.md)
3. [Book 03 — Supabase & Database](03-engineering-standards/05-supabase-and-database.md)
4. [Book 03 — Definition of Done](03-engineering-standards/12-code-review-and-dod.md)

**Practical:** Clone repo, `pnpm install`, `pnpm dev`, open dashboard at `:3001`.

**Outcome:** You can open a PR that passes quality gates.

---

## Day 4 — How AI works (if touching Doctor)

1. [Book 04 — AI Architecture Overview](04-ai-behaviour/01-ai-architecture-overview.md)
2. [Book 04 — Language Policy](04-ai-behaviour/07-language-policy.md)
3. [Book 04 — Safety & Ethics](04-ai-behaviour/09-safety-and-agricultural-ethics.md)

**Code walk:** `packages/ai/src/intelligence-engine.ts`

---

## Day 5 — Business context (optional)

1. [Book 05 — Growth Loops](05-growth-business/03-growth-loops-and-activation.md)
2. [Book 05 — KPIs](05-growth-business/08-analytics-and-kpis.md)

---

## Role-specific shortcuts

| Role | Focus books |
|------|-------------|
| **Frontend** | 02, 03 (04, 06) · rule: `.cursor/rules/nertura-design-system.mdc` |
| **Backend / DB** | 03, 04 |
| **AI engineer** | 04, 03 (07 security) |
| **Designer** | 01, 02 |
| **Product** | 01, 05 |
| **Cursor / agents** | Root [`AGENTS.md`](../AGENTS.md) + `.cursor/rules/` |

---

## Quarterly (leadership)

- Review [Ten-Year Roadmap](01-product-bible/04-ten-year-roadmap.md)
- Review [KPIs](05-growth-business/08-analytics-and-kpis.md)
- Update foundation chapters when product law changes
