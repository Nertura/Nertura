# Nertura Foundation Documentation (v1.0)

> **The single source of truth for the Nertura platform.**  
> Everything built after this document must follow these books.

---

## Nertura Core v1.0 ★ START HERE

**[`NERTURA_CORE.md`](NERTURA_CORE.md)** — the product operating brain.

Every change passes: Constitution → **Nertura Core** → Operating System → Review System → Code.

| Core layer | Path |
|------------|------|
| Experience Language | [`03-experience-language/`](03-experience-language/) |
| Writing System | [`04-writing-system/`](04-writing-system/) |
| Quality System | [`08-quality/`](08-quality/) |
| Security System | [`09-security/`](09-security/) |
| Intelligence Constitution | [`11-nertura-intelligence/`](11-nertura-intelligence/) |
| Product Review System | [`12-review-system/`](12-review-system/) |
| Decision Archive | [`10-decision-archive/`](10-decision-archive/) |

---

## What This Is

Nertura is **The AI Brain for Agriculture** — an Agriculture Intelligence Platform. It is not farm management software. It is not a generic chatbot. It starts as an AI Doctor and becomes the digital brain of every field, farm, and crop.

This foundation library is the **constitution, design language, engineering law, AI behaviour manual, and business playbook** for Nertura. It is as important as the source code.

**Constitutional law:** [`CONSTITUTION.md`](CONSTITUTION.md) — binding for all features, UI, AI, APIs, schemas, and product decisions.

---

## Constitutional Supremacy

> No new feature, UI change, AI behavior, API, database schema, or product decision may contradict the Foundation.

**When Foundation and code disagree, Foundation wins** until the Foundation is explicitly updated by the product team.

### Mandatory implementation workflow

1. **Read** [`NERTURA_CORE.md`](NERTURA_CORE.md) + relevant chapters
2. **Identify** Foundation + Core chapters
3. **Explain compliance** (before writing code)
4. **Implement** to match
5. **Run quality matrix** + 12-dimension review
6. **Verify** at review

See [`CONSTITUTION.md`](CONSTITUTION.md) Article III for the full workflow and PR template.

**Before commit:** [`PRE_COMMIT_CHECKLIST.md`](PRE_COMMIT_CHECKLIST.md)

---

## Authority Hierarchy

When documents conflict, resolve in this order:

1. **Constitution** — [`CONSTITUTION.md`](CONSTITUTION.md)
2. **Nertura Core** — [`NERTURA_CORE.md`](NERTURA_CORE.md)
3. **Five Books** (below) — canonical domain law
4. **Code** — when Foundation is silent on the point
5. **Legacy docs** — reference only
6. **Sprint reports** — historical context only

---

## The Five Books

| Book | Folder | Purpose |
|------|--------|---------|
| **01 — Product Bible** | [`01-product-bible/`](01-product-bible/) | Vision, mission, philosophy, roadmap, farmer psychology |
| **02 — Design System** | [`02-design-system/`](02-design-system/) | Visual language, components, responsive rules, Doctor/Map/Farm UI |
| **03 — Engineering Standards** | [`03-engineering-standards/`](03-engineering-standards/) | Monorepo, TypeScript, Supabase, security, API, testing, DoD |
| **04 — AI Behaviour Manual** | [`04-ai-behaviour/`](04-ai-behaviour/) | Runtime AI: pipeline, memory, confidence, safety |
| **05 — Growth & Business Manual** | [`05-growth-business/`](05-growth-business/) | Pricing, credits, retention, brand, SEO, KPIs |

**Note:** Core layers `03-experience-language` and `04-writing-system` are **Nertura Core OS modules** — they complement, not replace, Book 03 Engineering and Book 04 AI Behaviour.

---

## Who Uses This

| Audience | Primary path |
|----------|--------------|
| **Cursor / AI agents** | [`NERTURA_CORE.md`](NERTURA_CORE.md) → [`AGENTS.md`](../AGENTS.md) → `.cursor/rules/` |
| **New hires** | [`ONBOARDING.md`](ONBOARDING.md) → Nertura Core → Book 01 → 02 → 03 |
| **Developers** | Core → Book 03, Book 02, Intelligence |
| **Designers** | Core → Experience Language → Book 02 |
| **AI engineers** | Core → Intelligence → Book 04 |
| **Product managers** | Core → Book 01 → Review System |

---

## Current Phase (June 2026)

**Production stabilization + Nertura Core governance lock.**

Do not add random features. Every change passes Review System gates.

---

## Cross-References to Code

| Domain | Primary code paths |
|--------|-------------------|
| AI Doctor | `packages/ai/src/intelligence-engine.ts`, `apps/dashboard/src/app/api/ai/doctor/route.ts` |
| Design system | `packages/ui/src/styles/`, `packages/ui/src/components/` |
| Farmer copy | `packages/ui/src/lib/i18n/` |
| Auth / RBAC | `apps/dashboard/src/lib/auth/`, `supabase/migrations/` |

---

## How to Maintain

1. **Significant decisions** → Decision Archive ADR
2. **Material chapter changes** → version bump in book README
3. **No orphan docs** — link to Core or Five Books
4. **Quarterly review** — Product + CTO + Design

---

*Nertura Foundation v1.0 + Nertura Core v1.0 · June 2026 · Permanent governance.*
