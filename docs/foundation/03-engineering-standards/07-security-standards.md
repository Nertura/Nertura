# Chapter 07 — Security Standards

## Purpose

Codify **non-negotiable security controls** for Nertura — tenant isolation, admin access, rate limits, secret handling, and compliance hooks — aligned with production architecture and [Book 01](../01-product-bible/09-ai-first-and-trust-philosophy.md) trust principles.

---

## Principles

1. **Defense in depth** — Cloudflare → Vercel → Auth → RLS → application validation
2. **Deny by default** — RLS enabled on tenant tables; explicit policies only
3. **Least privilege** — anon key + user session for farmers; service role admin-only server-side
4. **No secrets client-side** — never `NEXT_PUBLIC_*` for API keys or service role
5. **Human gates for outbound risk** — outreach and content never auto-send (product + security)

---

## Architecture

### Security layers

| Layer | Implementation |
|-------|----------------|
| Transport | HTTPS (Cloudflare + Vercel) |
| Auth | Supabase GoTrue + SSR cookies |
| Authorization | RLS + middleware + role checks |
| Admin | `platform_admin` in `app_metadata.role` |
| Cron | `CRON_SECRET` Bearer token |
| Webhooks | Stripe signature verification |
| Uploads | JPG/PNG/WebP, 5 MB max, magic-byte validation |
| Rate limits | Route handler limits (marketing + dashboard) |
| Headers | `X-Frame-Options`, `nosniff`, `Referrer-Policy` in `next.config` |
| Audit | `audit_logs` + admin security views |

### Row Level Security (RLS)

- Every tenant-scoped table enforces org isolation via `memberships`
- Policies tested in `supabase/scripts/verify-rls.sql`
- Run `pnpm supabase:verify:rls` after policy changes

**Viewer vs owner tests** (seed fixtures):

- Viewer can `SELECT` farms in their org
- Viewer cannot `INSERT` farms
- Cross-org reads return zero rows

Dashboard route handlers still must pass `organization_id` from auth context — RLS is backup, not excuse for sloppy queries.

### Platform admin

```typescript
// apps/admin/src/lib/auth/platform-admin.ts
export function isPlatformAdmin(user: { app_metadata?: Record<string, unknown> } | null): boolean {
  if (!user) return false;
  return user.app_metadata?.role === 'platform_admin';
}
```

| Rule | Detail |
|------|--------|
| Role storage | `user.app_metadata.role === 'platform_admin'` |
| Grant | Supabase Dashboard or controlled script — never self-serve |
| Middleware | Admin app redirects non-admins to `/unauthorized` |
| Dev bypass | `ADMIN_AUTH_DISABLED=true` — **forbidden in production** |

Admin cross-tenant reads use **service role** only in server Route Handlers / server components — never in client bundles.

### Rate limiting

Application-level (`apps/dashboard/src/lib/ai/rate-limit.ts`):

- Window: 60 seconds
- Max: 20 requests per key
- Key: IP or composite `doctor:${ip}`, `chat:${ip}`

Cloudflare edge limits (production target) per `docs/infrastructure-stack.md`:

- `/auth/*` — 10 req/min/IP
- Global caps per deployment

Credit limits are a separate business gate (`402`) — not a substitute for abuse rate limits.

### Secrets & environment variables

| Variable | Client-safe? |
|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (anon only) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Never** |
| `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` | **Never** |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | **Never** |
| `CRON_SECRET`, `RESEND_API_KEY` | **Never** |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Yes (URL-restricted in Mapbox dashboard) |

Store secrets in Vercel project env per app; never commit `.env.local`.

### Upload security

- Validate MIME and magic bytes in `validateImageInput` / `@nertura/utils`
- User-facing errors via `userFacingUploadError` — no internal format strings leaked
- Storage buckets: authenticated upload paths scoped by user/org policies

### Outreach & content compliance

- `do_not_contact` and unsubscribe tokens honored
- `email_log` trail: draft → approved → sent
- Weekly cron generates drafts only — see admin outreach module

### Auth surfaces

| Surface | Mechanism | Gate |
|---------|-----------|------|
| Marketing | None | Guest 3-question limit |
| Dashboard | Supabase SSR | Membership + onboarding |
| Admin | SSR + metadata role | `platform_admin` |

---

## Decision Rationale

**RLS in Postgres** — even if application code regresses, database refuses cross-tenant reads.

**platform_admin in app_metadata** — JWT-visible to server; not user-editable via profile table.

**In-memory rate limit** — acceptable for MVP single-instance dev; production should add edge limits — document gap honestly.

---

## Examples

### Good — cron auth

```typescript
const auth = request.headers.get('authorization');
if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Good — Stripe webhook

```typescript
const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
```

### Bad — exposed service role

```typescript
// NEVER
const supabase = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY);
```

---

## Best Practices

- Run RLS verification in CI before merge when migrations touch policies
- Rotate webhook secrets on provider dashboards when team members leave
- Log admin mutations to `audit_logs`
- Restrict Mapbox token by URL in provider dashboard
- Review `NEXT_PUBLIC_*` in PR diffs explicitly

---

## Bad Practices

- `ADMIN_AUTH_DISABLED=true` on Vercel production
- Logging full JWTs or API keys in `console.error`
- Trusting client-sent `organization_id` without matching session membership
- Auto-sending outreach emails from cron
- Storing pesticide dosage in Knowledge Bank without human review (`review_pending`)

---

## Future Considerations

- **Cloudflare Zero Trust** on `admin.nertura.com`
- **MFA** enforcement for platform admins
- **Redis / Upstash** distributed rate limits
- **CSP** tightening as third-party scripts stabilize
- **SOC 2** control mapping from `docs/security-master-plan.md`

---

## Cross-References

- [Chapter 05 — Supabase & Database](05-supabase-and-database.md)
- [Chapter 06 — API Conventions](06-api-conventions.md)
- [`docs/security-master-plan.md`](../../security-master-plan.md)
- [`docs/auth-architecture.md`](../../auth-architecture.md)
