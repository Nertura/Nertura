# Chapter 11 — Migration Policy

## Purpose

Establish **`supabase/migrations/` as the sole source of truth** for database schema, RLS policies, and RPCs — so local, staging, and production Postgres stay aligned and deploys never rely on manual Dashboard clicks.

---

## Principles

1. **No production DDL without a migration file** — if it's not in git, it didn't happen
2. **One concern per migration when possible** — easier review and rollback narrative
3. **Migrations are forward-only** — fix mistakes with a new migration, not edited history
4. **Same PR: migration + types + RLS test** — schema change without types is incomplete
5. **Push before app deploy** — `pnpm supabase:push` on target project before Vercel promote

---

## Architecture

### Directory layout

```
supabase/
├── config.toml              # Local ports, auth URLs, seed path
├── migrations/
│   ├── 20250701000000_onboarding_intelligence_setup.sql
│   ├── 20250702000000_field_geo_intelligence.sql
│   ├── 20250706000000_field_cases.sql
│   └── ...                  # 30+ files, chronological
├── policies/                # Optional RLS fragments (inlined or referenced)
├── seed/seed.sql            # Demo data for local + verify scripts
└── scripts/
    ├── verify-migrations.sql
    ├── verify-auth.sql
    └── verify-rls.sql
```

### Naming convention

```
YYYYMMDDHHMMSS_short_snake_description.sql
```

Examples:

- `20250702000000_field_geo_intelligence.sql`
- `20250708000000_fix_field_boundary_geojson.sql`

Use `fix_` prefix for corrective migrations — never rewrite the original file after merge.

### Lifecycle

```mermaid
flowchart LR
  A[Write SQL migration] --> B[pnpm supabase:reset local]
  B --> C[Update packages/types]
  C --> D[pnpm supabase:verify:rls]
  D --> E[PR review]
  E --> F[Merge]
  F --> G[pnpm supabase:push staging]
  G --> H[QA]
  H --> I[pnpm supabase:push production]
  I --> J[Vercel deploy apps]
```

### Commands

| Command | Use |
|---------|-----|
| `pnpm supabase:start` | Local Supabase stack |
| `pnpm supabase:stop` | Stop local stack |
| `pnpm supabase:reset` | Drop + migrate + seed |
| `pnpm supabase:push` | Apply pending migrations to **linked** remote project |
| `pnpm supabase:verify` | Migration + auth verification scripts |
| `pnpm supabase:verify:rls` | RLS test suite |

Link CLI to project:

```bash
npx supabase link --project-ref <ref>
```

### What belongs in migrations

| In migrations | Not in migrations |
|---------------|-------------------|
| `CREATE TABLE`, `ALTER TABLE` | Seed production user data |
| RLS `ENABLE` + `CREATE POLICY` | One-off data fixes (use admin script + audit) |
| `CREATE OR REPLACE FUNCTION` RPCs | Dashboard-only policy experiments |
| Indexes, constraints | Manual SQL run in prod console |
| Extensions (`postgis` via `extensions` schema) | |

### RLS policy workflow

1. Write policy in migration (or apply from `supabase/policies/` into migration)
2. Add verify case to `verify-rls.sql` if new table or policy class
3. Run reset + verify locally

### RPC standards

- `SECURITY INVOKER` default — runs as calling user, respects RLS
- `SET search_path = public, extensions` on geo functions
- Comment functions with purpose
- Grant `EXECUTE` to `authenticated` explicitly when needed

### Type sync

Update `packages/types/src/database.ts` when migrations add/change columns:

- `Field`, `Farm`, `FieldGeoMetadata`
- New enums for `field_cases.status`, etc.

Future: automate with `supabase gen types` + diff review.

### Environment separation

| Environment | Migration apply |
|-------------|-----------------|
| Local | `supabase:reset` |
| Staging | `supabase:push` to staging project |
| Production | `supabase:push` to prod project — **after** staging QA |

Never point local CLI at production without change control.

---

## Decision Rationale

**Git-tracked SQL** — reproducible environments; new engineers get identical schema via `supabase:reset`.

**Forward-only** — edited historical migrations break deployed environments that already applied old version.

**Push before deploy** — app code assuming new RPC must not reach Vercel before Postgres has the function.

---

## Examples

### Good — additive migration

```sql
-- 20250706000000_field_cases.sql
create table if not exists public.field_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  field_id uuid not null references public.fields(id),
  status text not null default 'open',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.field_cases enable row level security;
-- policies follow...
```

### Good — fix migration

```sql
-- 20250708000000_fix_field_boundary_geojson.sql
-- Corrects GeoJSON storage edge case; does not modify 20250702 file
```

### Bad — dashboard-only change

"We added column `foo` in Supabase Dashboard UI" — no git record, staging breaks on reset.

---

## Best Practices

- Test migration on clean `supabase:reset`, not only on dirty local DB
- Include `if not exists` / `drop policy if exists` when idempotency helps local dev
- Document breaking changes in PR description
- Keep migrations small for reviewer comprehension
- Run `pnpm supabase:verify` in database PRs

---

## Bad Practices

- Squashing merged migration history
- Data backfills without `WHERE` clause guard
- `SECURITY DEFINER` without security review
- Applying migrations to prod from unreviewed branch
- Deleting migration files that shipped to any environment

---

## Future Considerations

- **Supabase branching** for preview databases per PR
- **Automated type generation** in CI committed to `packages/types`
- **Migration linter** — ban `disable row level security`
- **Rollback playbooks** — compensating migrations documented per incident

---

## Cross-References

- [Chapter 05 — Supabase & Database](05-supabase-and-database.md)
- [Chapter 09 — Testing & Quality Gates](09-testing-and-quality-gates.md)
- [`docs/production-deploy.md`](../../production-deploy.md)
- [`docs/NERTURA_ARCHITECTURE_BIBLE.md`](../../NERTURA_ARCHITECTURE_BIBLE.md) § Data Architecture
