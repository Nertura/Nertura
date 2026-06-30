# Chapter 05 — Supabase & Database

## Purpose

Define how Nertura uses **Supabase Postgres** — migration workflow, tenant model, Row Level Security, PostGIS field geometry, and RPCs that must stay atomic.

---

## Principles

1. **`supabase/migrations/` is schema truth** — no manual Dashboard DDL in production
2. **RLS on every tenant table** — deny by default; grant via `memberships`
3. **Soft delete** — `deleted_at` on operational rows; queries filter `is('deleted_at', null)`
4. **PostGIS in `extensions` schema** — `boundary`, `centroid`, `area_m2` on `fields`
5. **RPCs for multi-table writes** — onboarding, credits, boundaries use security invoker functions

---

## Architecture

### Environment model

| Tier | Supabase | Apps |
|------|----------|------|
| Local | `supabase start` (:54321) | localhost:3000/3001/3002 |
| Staging | Separate project | Preview / staging domains |
| Production | Separate project | nertura.com, app.*, admin.* |

Single Postgres project per environment; all three apps share one database with RLS.

### Core tenant ER (simplified)

```
organizations
  └── memberships (user ↔ org, role)
  └── farms
        └── fields (PostGIS boundary, centroid, area_m2)
              └── crops
  └── ai_conversations → ai_messages, ai_analyses
  └── field_cases (open → monitoring → resolved → archived)
```

### Key tables

| Table | Purpose |
|-------|---------|
| `organizations` | Tenant root; `settings.onboarding_profile` JSON |
| `users` | Profile; `onboarding_completed_at` |
| `memberships` | RBAC: `owner`, `admin`, `manager`, … |
| `farms` | Geo, area, address JSON |
| `fields` | `boundary` geometry(Polygon,4326), `centroid`, `area_m2`, `metadata` |
| `field_cases` | Ongoing crop problems per field |
| `knowledge_items` | Knowledge Bank FTS |
| `user_usage_limits` | Credits balance |
| `credit_transactions` | Immutable ledger |
| `guest_usage` | Marketing guest question counter |

### PostGIS on `fields`

From `20250702000000_field_geo_intelligence.sql`:

| Column | Type | Notes |
|--------|------|-------|
| `boundary` | `geometry(Polygon, 4326)` | Stored polygon; WGS84 |
| `centroid` | `geometry(Point, 4326)` | GiST index `fields_centroid_gist_idx` |
| `area_m2` | `numeric(14,2)` | Computed from boundary geography |
| `area` | `numeric` | Hectares (area_m2 / 10000) |
| `metadata.boundary_geojson` | JSONB | GeoJSON copy for client map |

**RPC:** `update_field_boundary(p_field_id, p_boundary_geojson, p_close_ring)` — validates polygon, runs `ST_MakeValid`, computes area and centroid, updates row.

**API:** `POST /api/fields/[id]/boundary` — dashboard route calls RPC after Zod validation.

### Critical RPCs

| RPC | Purpose |
|-----|---------|
| `complete_onboarding_setup()` | Atomic org + farm + field + crops + mark onboarding complete |
| `debit_user_credit()` | −1 credit per AI question + ledger row |
| `grant_user_credits()` | Stripe/admin/signup grants (idempotent) |
| `update_field_boundary()` | GeoJSON → PostGIS + metrics |

### RLS model

- **Authenticated farmers:** access rows where `organization_id` matches a `memberships` row for `auth.uid()`
- **Role checks:** write operations may require `owner`/`admin`/`manager` in policy or app layer
- **Admin app:** uses **service role server-side only** for cross-tenant reads — never expose service key to client
- **Guest marketing:** `guest_usage` policies separate from tenant data

Policy fragments may live in `supabase/policies/`; applied via migrations.

### Verification

```bash
pnpm supabase:reset          # local: migrations + seed
pnpm supabase:verify:rls     # runs supabase/scripts/verify-rls.sql
```

RLS script impersonates seed users (viewer vs owner) and asserts select/insert behavior.

### Supabase clients

| Client | File | Key |
|--------|------|-----|
| Server (user session) | `lib/supabase/server.ts` | Anon + cookies |
| Middleware | `lib/supabase/middleware.ts` | Anon + cookie refresh |
| Admin service | server-only module | `SUPABASE_SERVICE_ROLE_KEY` |

---

## Decision Rationale

**Postgres + RLS over app-only filtering** — defense in depth; a bug in one route handler cannot exfiltrate another org's fields.

**Geo in database** — area in m², dönüm, and ha derived from one truth; map draws GeoJSON, DB stores validated geometry.

**Atomic RPCs** — onboarding creates six related entities; partial failure would strand users — one transaction in SQL.

---

## Examples

### Good — scoped field query

```typescript
const { data } = await supabase
  .from('fields')
  .select('id, name, area, area_m2, centroid')
  .eq('organization_id', ctx.organizationId)
  .is('deleted_at', null);
```

### Good — boundary update via RPC

```typescript
const { data, error } = await supabase.rpc('update_field_boundary', {
  p_field_id: fieldId,
  p_boundary_geojson: geoJson,
  p_close_ring: true,
});
```

### Migration naming

```
supabase/migrations/20250706000000_field_cases.sql
supabase/migrations/20250708000000_fix_field_boundary_geojson.sql
```

---

## Best Practices

- Every new tenant table: `organization_id`, RLS policies, index on `organization_id`
- Add migration + update `packages/types` + run `pnpm supabase:verify:rls` in same PR
- Use `security invoker` on RPCs unless elevated role is explicitly documented
- Store timestamps in UTC (`timezone('utc', now())` in SQL)
- Comment non-obvious columns in migration SQL

---

## Bad Practices

- Creating tables in Supabase Dashboard without committing migration files
- Selecting `*` from wide tables in hot paths
- Storing boundaries only as JSONB without `boundary` geometry column
- Using service role in dashboard route handlers for normal farmer operations
- Disabling RLS "temporarily" on production

---

## Future Considerations

- **Read replicas** for analytics-heavy admin reports
- **Partitioning** `ai_messages` / `audit_logs` at scale
- **pgvector** on knowledge_items if hybrid search expands beyond FTS
- **Storage policies** aligned with field image attachments

---

## Cross-References

- [Chapter 11 — Migration Policy](11-migration-policy.md)
- [Chapter 07 — Security Standards](07-security-standards.md)
- [Chapter 09 — Testing & Quality Gates](09-testing-and-quality-gates.md)
- [`docs/database-blueprint.md`](../../database-blueprint.md) — aspirational ER
