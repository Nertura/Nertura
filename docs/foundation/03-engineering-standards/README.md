# Book 03 — Nertura Engineering Standards

> **The law of how Nertura is built.**

---

## Purpose

This book defines **how engineers, AI agents, and contractors implement Nertura** — monorepo layout, TypeScript rules, Supabase migrations, API contracts, security gates, testing, and Definition of Done. No production change may violate these standards without explicit CTO approval and a foundation update.

---

## Version

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Status | Canonical |
| Last updated | June 2026 |
| Owner | Chief Technology Officer |

---

## Chapters

See [`table-of-contents.md`](table-of-contents.md) for the full index.

| # | Chapter | Summary |
|---|---------|---------|
| 01 | [Monorepo Architecture](01-monorepo-architecture.md) | pnpm workspaces, Turborepo, three apps, shared packages |
| 02 | [Folder Structure & Naming](02-folder-structure-and-naming.md) | App layout, kebab-case, domain folders |
| 03 | [TypeScript Standards](03-typescript-standards.md) | Strict mode, shared types, Zod at boundaries |
| 04 | [React & Next.js](04-react-and-nextjs.md) | App Router, RSC vs client, server-only AI |
| 05 | [Supabase & Database](05-supabase-and-database.md) | Migrations, RLS, PostGIS fields |
| 06 | [API Conventions](06-api-conventions.md) | Route handlers, Zod, error shapes |
| 07 | [Security Standards](07-security-standards.md) | RLS, platform_admin, rate limits, secrets |
| 08 | [Error Handling & Logging](08-error-handling-and-logging.md) | friendlyDoctorError, server-side logs |
| 09 | [Testing & Quality Gates](09-testing-and-quality-gates.md) | typecheck, lint, RLS verification |
| 10 | [Performance & Scalability](10-performance-and-scalability.md) | dev:fresh rule, map performance |
| 11 | [Migration Policy](11-migration-policy.md) | supabase/migrations as source of truth |
| 12 | [Code Review & DoD](12-code-review-and-dod.md) | Definition of Done checklist |

---

## Related Books

- Product law → [Book 01 — Product Bible](../01-product-bible/)
- UI implementation → [Book 02 — Design System](../02-design-system/)
- AI pipeline rules → [Book 04 — AI Behaviour Manual](../04-ai-behaviour/)
- Credits & billing → [Book 05 — Growth & Business Manual](../05-growth-business/)

---

## Legacy References

This book supersedes implementation sections of:

- [`docs/NERTURA_ARCHITECTURE_BIBLE.md`](../../NERTURA_ARCHITECTURE_BIBLE.md) — still valid for topology diagrams until fully migrated
- [`docs/auth-architecture.md`](../../auth-architecture.md)
- [`docs/security-master-plan.md`](../../security-master-plan.md)
- [`docs/production-deploy.md`](../../production-deploy.md)

**Code wins** when foundation is silent or stale.

---

## Quick Commands

```bash
pnpm dev                    # All three apps via Turbo
pnpm typecheck              # TypeScript across workspace
pnpm lint                   # ESLint across workspace
pnpm supabase:push          # Apply migrations to linked project
pnpm supabase:verify:rls    # Run RLS verification script
pnpm --filter @nertura/dashboard dev:fresh   # Clean .next after build
```
