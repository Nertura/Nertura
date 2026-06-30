# Nertura — Database Security Rules

> Mandatory Supabase Postgres security policies for all environments. Every engineer must comply before merging migrations.

**Status:** Pre-implementation · **Owner:** CTO / CSO  
**Companion:** [`database-blueprint.md`](database-blueprint.md), [`security-master-plan.md`](security-master-plan.md)

---

## Non-Negotiable Rules

1. **RLS enabled on every table** containing tenant or user data — no exceptions
2. **`organization_id` on every tenant-scoped row** — FK enforced
3. **Service role bypasses RLS** — used only in server Route Handlers, never in browser
4. **No raw SQL from LLM** — parameterized queries only
5. **Soft delete default** — `deleted_at`; hard delete only via GDPR job
6. **Audit triggers** on sensitive tables — see [`audit-log-system.md`](audit-log-system.md)

---

## Role Context Functions

```sql
-- Conceptual; implement in migration 001
auth.uid()                    -- Supabase JWT user id
auth.jwt() ->> 'role'         -- app role claim
current_setting('app.current_org_id', true)  -- set in Route Handler per request
is_org_member(org_id)         -- returns boolean
has_org_role(org_id, role[])  -- RBAC check
is_platform_admin()           -- admin panel access
```

Route Handlers set `app.current_org_id` via `SET LOCAL` in transaction before queries when using service role with user context.

---

## RLS Policy Patterns

### Pattern A — Organization member read/write

```sql
-- SELECT: member of organization
USING (organization_id IN (
  SELECT organization_id FROM organization_members
  WHERE user_id = auth.uid() AND deleted_at IS NULL
))

-- INSERT/UPDATE: member with role in (owner, admin, manager, operator)
WITH CHECK (organization_id IN (
  SELECT organization_id FROM organization_members
  WHERE user_id = auth.uid()
  AND role IN ('owner','admin','manager','operator')
))
```

### Pattern B — Viewer read-only

Viewers: SELECT only via role check excluding INSERT/UPDATE/DELETE policies.

### Pattern C — Platform admin read (support)

Separate policy for `is_platform_admin()` — SELECT only on support-required tables; mutations via admin audit functions.

### Pattern D — Public none

No public anon access to tenant tables. Marketing site uses no direct Supabase client for tenant data.

---

## Table-Specific Rules

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `organizations` | members | service (signup) | owner/admin | soft; owner |
| `users` / `profiles` | self + org admins | service | self + admin | soft |
| `farms`, `fields` | org members | operator+ | operator+ | admin+ soft |
| `crop_plans`, `tasks` | org members | operator+ | operator+ | operator+ soft |
| `observations`, photos | org members | operator+ | creator 24h | admin soft |
| `ai_interactions` | org members | service (Brain) | none | none |
| `diagnoses` | org members | service | feedback fields only | none |
| `consent_records` | self + legal admin | service | revoke only | none |
| `subscriptions`, `invoices` | owner + finance admin | Stripe webhook | service | none |
| `audit_logs` | platform admin | service insert only | none | none |
| `admin_users` | platform admin | super admin | super admin | super admin |

---

## Storage RLS Policies

| Bucket | Policy |
|--------|--------|
| `observations` | Path prefix `{org_id}/` — member SELECT; operator+ INSERT |
| `avatars` | User own path or org admin |
| `exports` | User self only; 7-day TTL lifecycle rule |

---

## Sensitive Column Handling

| Column | Rule |
|--------|------|
| `password_hash` | Never in client SELECT; Supabase Auth manages |
| `mfa_secret` | Encrypted; admin never reads |
| `stripe_customer_id` | Org owner + finance admin only |
| `field.boundary_geojson` | Member only; export includes in GDPR pack |
| `ai_interactions.raw_provider_response` | Admin AI Review + org owner; redact provider keys |

---

## Query Security

| Rule | Detail |
|------|--------|
| Pagination required | Max 100 rows per query default |
| Bulk export | Rate limited; audit logged; owner only |
| Search | Parameterized ILIKE; no dynamic SQL |
| Aggregates | Org-scoped only; no cross-tenant analytics in app DB |
| Graph queries V2 | Security definer functions with org check |

---

## Migration Security Checklist

Every PR touching `supabase/migrations/`:

- [ ] RLS enabled on new tables
- [ ] Policies for SELECT, INSERT, UPDATE as applicable
- [ ] `organization_id` NOT NULL where tenant-scoped
- [ ] Indexes on `organization_id`, foreign keys
- [ ] No SECURITY DEFINER without org guard
- [ ] Rollback migration or forward-fix documented
- [ ] Policy tests in `supabase/tests/rls/*.sql`

---

## Testing RLS

Automated tests run in CI with test users:

1. User A cannot read Org B farms
2. Viewer cannot INSERT tasks
3. Anon cannot read any tenant table
4. Service role insert creates audit log entry

---

## Encryption

- Supabase manages disk encryption
- Application-level encryption for `integration_tokens` JSONB field using pgcrypto + vault key (V2)

---

*Database Security Rules v1.0 — Pre-implementation.*
