# Book 03 — Table of Contents

## Part I — Repository

1. [Monorepo Architecture](01-monorepo-architecture.md)
2. [Folder Structure & Naming](02-folder-structure-and-naming.md)
3. [TypeScript Standards](03-typescript-standards.md)

## Part II — Application Layer

4. [React & Next.js](04-react-and-nextjs.md)
5. [Supabase & Database](05-supabase-and-database.md)
6. [API Conventions](06-api-conventions.md)

## Part III — Safety & Quality

7. [Security Standards](07-security-standards.md)
8. [Error Handling & Logging](08-error-handling-and-logging.md)
9. [Testing & Quality Gates](09-testing-and-quality-gates.md)

## Part IV — Operations

10. [Performance & Scalability](10-performance-and-scalability.md)
11. [Migration Policy](11-migration-policy.md)
12. [Code Review & Definition of Done](12-code-review-and-dod.md)
13. [Projects Engine (v1)](13-projects-engine.md)

---

## Quick Reference

**The one rule:** Code in `supabase/migrations/` is the database truth.

**The one boundary:** `@nertura/ai` is server-only — never import in client components.

**The one dev habit:** After `pnpm build`, restart with `pnpm dev:fresh` — never dev on a production `.next` cache.

**The one security gate:** RLS on every tenant table; verify with `pnpm supabase:verify:rls`.
