# Nertura Core v1.0

> **The product operating brain of Nertura.**  
> Version 1.0 · June 2026 · Owner: Product Team

---

## What Nertura Core Is

Nertura Core is **not** a feature folder. It is the **permanent governance layer** that sits above code and organizes how every product, design, AI, engineering, and growth decision is made.

Nertura is an **Agriculture Intelligence Platform** — not a farming app, not a chatbot, not a dashboard. Everything exists to help users make better agricultural decisions.

**Every change must pass through:**

```
Constitution
  → Nertura Core (this document)
    → Operating System (books + Core layers)
      → Intelligence
      → Experience
      → Writing
      → Engineering
      → Review System
        → Code
```

---

## Authority Hierarchy

When documents conflict, resolve in this order:

| Priority | Source |
|----------|--------|
| 1 | [`CONSTITUTION.md`](CONSTITUTION.md) — supreme law |
| 2 | **Nertura Core** (this index + Core layers below) |
| 3 | **Five Books** (01–05) — canonical domain law |
| 4 | **Code** — when Foundation is silent |
| 5 | Legacy docs — reference only |

The Five Books remain authoritative for their domains. Nertura Core **indexes and extends** them — it does not replace Book 03 Engineering or Book 04 AI Behaviour.

---

## Nertura Core Structure

### 1. Constitution

| Document | Purpose |
|----------|---------|
| [`CONSTITUTION.md`](CONSTITUTION.md) | Supremacy, workflow, amendments, gate question |

### 2. Nertura Operating System

The OS organizes how Nertura runs as a product company:

| # | Layer | Primary home |
|---|-------|--------------|
| 01 | **Product** | [`01-product-bible/`](01-product-bible/) |
| 02 | **Design Language** | [`02-design-system/`](02-design-system/) |
| 03 | **Experience Language** | [`03-experience-language/`](03-experience-language/) |
| 04 | **Writing System** | [`04-writing-system/`](04-writing-system/) |
| 05 | **Engineering** | [`03-engineering-standards/`](03-engineering-standards/) |
| 06 | **Growth** | [`05-growth-business/`](05-growth-business/) |
| 07 | **Operations** | [`03-engineering-standards/09-testing-and-quality-gates.md`](03-engineering-standards/09-testing-and-quality-gates.md), deployment docs |
| 08 | **Quality** | [`08-quality/`](08-quality/) |
| 09 | **Security** | [`09-security/`](09-security/), [`03-engineering-standards/07-security-standards.md`](03-engineering-standards/07-security-standards.md) |
| 10 | **Decision Archive** | [`10-decision-archive/`](10-decision-archive/) |

### 3. Nertura Intelligence

| Document | Purpose |
|----------|---------|
| [`11-nertura-intelligence/`](11-nertura-intelligence/) | AI Constitution, Knowledge Constitution, evidence, confidence, learning |
| [`04-ai-behaviour/`](04-ai-behaviour/) | Runtime AI behaviour manual (implementation-aligned) |

### 4. Nertura Product Review System

| Document | Purpose |
|----------|---------|
| [`12-review-system/`](12-review-system/) | 12-dimension review bar, scorecard, merge gates |
| [`08-quality/PRODUCT_REVIEW_SYSTEM.md`](08-quality/PRODUCT_REVIEW_SYSTEM.md) | Quality + review integration |

---

## Core Principles (Non-Negotiable)

1. Farmer trust comes before speed.
2. Simplicity beats feature density.
3. AI is the center, but never the chaos.
4. No mixed language on farmer surfaces.
5. No hardcoded farmer copy.
6. No one-off CSS — single source: `packages/ui`.
7. No unsafe AI certainty.
8. No fake data presented as real.
9. No broken primary actions.
10. No feature without a documented decision reason.
11. No merge below quality threshold.
12. Every screen understandable in 5 seconds.
13. Every error explains the next step.
14. Every recommendation respects uncertainty.
15. Every future module must feel like Nertura.

---

## Mandatory Workflow (Every Task)

Every implementer — human or AI agent — must:

1. **Read** relevant Core chapters (this index → specific layer)
2. **Identify** Foundation + Core chapters for the task
3. **State compliance** before writing code or shipping docs
4. **Answer gate question:** Does this help the farmer make a better decision faster?
5. **Implement** to match compliance statement
6. **Run quality matrix** (see [`08-quality/01-definition-of-done.md`](08-quality/01-definition-of-done.md))
7. **Complete 12-dimension review** when merging (see [`12-review-system/`](12-review-system/))
8. **Produce sprint report** (14 items — see [`AGENTS.md`](../../AGENTS.md))

---

## Quality Matrix (Automated)

Run whenever possible:

```bash
pnpm typecheck
pnpm build
pnpm check:i18n
pnpm check:css-imports
pnpm test:marketing-css      # requires :3000
pnpm test:dashboard-css     # requires :3001
pnpm test:admin-css          # requires :3002
pnpm test:doctor-language
pnpm test:dashboard-doctor
pnpm test:projects-engine
pnpm test:dashboard-interactions
```

---

## Single Sources of Truth (Code)

| Domain | SSOT |
|--------|------|
| Design Language | `packages/ui/src/styles/`, `packages/ui/src/components/` |
| Farmer copy | `packages/ui/src/lib/i18n/`, app copy modules |
| AI runtime | `packages/ai/src/intelligence-engine.ts` |
| Types / DB | `packages/types/`, `supabase/migrations/` |

---

## Who Reads What First

| Role | Start path |
|------|------------|
| **Cursor / AI agent** | This file → CONSTITUTION → task-specific Core layer → Five Books |
| **New engineer** | [`ONBOARDING.md`](ONBOARDING.md) → NERTURA_CORE → Book 03 |
| **Designer** | NERTURA_CORE → Book 02 → Experience Language |
| **AI engineer** | NERTURA_CORE → Intelligence → Book 04 |
| **Product manager** | NERTURA_CORE → Book 01 → Review System |

---

## Related Documents

| Document | Role |
|----------|------|
| [`README.md`](README.md) | Foundation library index |
| [`PRE_COMMIT_CHECKLIST.md`](PRE_COMMIT_CHECKLIST.md) | Pre-ship checklist |
| [`AGENTS.md`](../../AGENTS.md) | Repository agent entry point |
| [`docs/nertura-index.md`](../nertura-index.md) | Master documentation index |

---

*Nertura Core v1.0 — Permanent product operating framework. Amend via Decision Archive + Constitution Article IV.*
