# Chapter 10 — Performance & Scalability

## Purpose

Set **performance rules** that prevent self-inflicted slowdowns in development and production — especially Next.js cache pitfalls, map rendering, and database query discipline — while staying honest about MVP scale targets.

---

## Principles

1. **`dev:fresh` after build** — never develop against a stale production `.next` cache
2. **Map is expensive** — lazy load Mapbox, limit layers, avoid re-mount on every keystroke
3. **Fetch only what you need** — explicit Supabase column lists, pagination on admin tables
4. **Server Components reduce JS** — default pattern lowers client bundle for Agriculture OS
5. **Measure before optimizing** — RC-2 target is smooth on mid-range mobile, not GIS workstation

---

## Architecture

### The `dev:fresh` rule

Each app defines:

```json
"dev:fresh": "rimraf .next && next dev --port 300X"
```

| App | Command |
|-----|---------|
| Marketing | `pnpm --filter @nertura/marketing dev:fresh` |
| Dashboard | `pnpm --filter @nertura/dashboard dev:fresh` |
| Admin | `pnpm --filter @nertura/admin dev:fresh` |

**When required:**

- After `pnpm build` or `next build` locally
- When seeing stale routes, wrong CSS, or "works in prod build but not dev" bugs
- After upgrading Next.js or Tailwind

Documented in Architecture Bible § Safety rules — **Dev cache: After `pnpm build`, restart with `pnpm dev:fresh`**.

Turbo `dev` does not clear `.next` — developers must run `dev:fresh` explicitly.

### Build & deploy performance

- Turbo caches `build` outputs per package
- Vercel builds one app per project — filtered `pnpm --filter @nertura/dashboard build`
- Migrations run before deploy — not on every request

### Map performance (field intelligence)

**Stack:** Mapbox GL via `@nertura/geo` + `MapView` in `@nertura/ui`

| Technique | Where |
|-----------|-------|
| Dynamic import `ssr: false` | `farm-map-client.tsx` |
| Client-only providers | `map-provider.client.ts`, `geocoding-provider.client.ts` |
| Single map instance per page | Avoid mounting map in list views |
| Boundary draw debounce | Update area preview without full save RPC per vertex |
| Layer toggles (satellite stub) | Lazy — don't load NDVI tiles until enabled |

**UX rule (Book 01):** Map-primary 70%, panel scrolls — map container needs fixed height (`min-h`, `h-[calc(...)]`) not unbounded document scroll.

**Geo RPC:** `update_field_boundary` computes area server-side — client sends GeoJSON once on save, not continuous PostGIS writes.

### Database & API

| Practice | Rationale |
|----------|-------------|
| `.select('id, name, area')` | Smaller payloads |
| `.limit(n)` on lists | Dashboard home cards |
| Indexes on `organization_id`, GiST on `centroid` | Tenant + geo queries |
| Credit debit in RPC | One round-trip |
| Knowledge Bank threshold 0.78 | Skip expensive LLM when KB hit is high confidence |

### AI pipeline latency

- `runIntelligenceEngine` may call KB + Gemini — acceptable for doctor UX (seconds, not ms)
- Show loading state in composer — never block UI thread
- Rate limits protect provider quotas and cold-start storms

### Static & marketing

- Legal pages: static generation where possible
- Hero doctor: client island; keep marketing homepage JS minimal for LCP

### Admin tables

- Virtualize large tables when row count > 100 (future hardening)
- Paginate `ai_provider_outputs`, `audit_logs` queries

---

## Decision Rationale

**Stale `.next` is a top dev time sink** — explicit `dev:fresh` cheaper than debugging phantom HMR bugs.

**Mapbox client-only** — GL requires `window`; SSR attempts waste build time and break hydration.

**Server-side boundary math** — Turf/PostGIS agreement: one source of truth in Postgres.

---

## Examples

### Good — dynamic map

```typescript
const FarmMapClient = dynamic(() => import('@/components/farm/farm-map-client'), {
  ssr: false,
  loading: () => <div className="h-[70vh] animate-pulse bg-muted" />,
});
```

### Good — explicit field columns for home loader

```typescript
.select('id, name, status, area, health_score')
.eq('organization_id', orgId)
.is('deleted_at', null)
.limit(12)
```

### Bad — map in every field list row

Rendering `MapView` per card in `/fields` list — N maps = browser death.

---

## Best Practices

- Run `dev:fresh` after any local `build` before continuing feature work
- Use `loading.tsx` for slow server pages (field workspace)
- Compress images client-side before base64 doctor upload when possible
- Monitor Vercel function duration on `/api/ai/doctor`
- Keep `@nertura/ui` tree-shakeable — import named exports

---

## Bad Practices

- `pnpm dev` immediately after `pnpm build` without clearing `.next`
- Importing `mapbox-gl` in Server Components
- Unbounded `select('*')` on `ai_messages` history
- Polling doctor status every second
- Loading satellite/weather layers by default on mobile

---

## Future Considerations

- **Edge caching** for marketing static assets (Cloudflare)
- **React Query / SWR** for dashboard client refetch patterns if navigation lag appears
- **Connection pooling** — Supavisor when concurrent farmers grow
- **CDN for field thumbnails** in Storage
- **Lighthouse CI** budget on marketing `/`

---

## Cross-References

- [Chapter 04 — React & Next.js](04-react-and-nextjs.md)
- [Chapter 05 — Supabase & Database](05-supabase-and-database.md)
- [Book 01 — Product Principles § Map](../01-product-bible/07-product-principles.md)
- [`docs/NERTURA_ARCHITECTURE_BIBLE.md`](../../NERTURA_ARCHITECTURE_BIBLE.md) § Safety rules
