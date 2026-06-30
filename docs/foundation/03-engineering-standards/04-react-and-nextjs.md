# Chapter 04 — React & Next.js

## Purpose

Define how Nertura uses **Next.js 15 App Router and React 19** — when to use Server Components vs client components, how layouts compose across the Agriculture OS and Doctor surfaces, and the **server-only rule for `@nertura/ai`**.

---

## Principles

1. **Server by default** — add `'use client'` only when hooks, browser APIs, or interactivity require it
2. **AI never in the browser** — all intelligence via Route Handlers or Server Actions calling `@nertura/ai`
3. **One Doctor pipeline** — `runIntelligenceEngine` / `runDoctorPipeline`; never raw Gemini from UI
4. **Layouts encode product mode** — `(dashboard)` = field OS; `(chat)` = full-screen doctor; marketing = minimal shell
5. **Streaming optional** — prefer complete JSON responses for doctor until UX spec mandates streaming

---

## Architecture

### App Router map (dashboard)

| Route group | Layout | Purpose |
|-------------|--------|---------|
| `(dashboard)/` | Sidebar shell, top bar | Fields, farms, crops, account |
| `(chat)/doctor` | Full-screen chat | AI Doctor primary experience |
| `onboarding/` | Wizard layout | 6-step Agriculture Intelligence Setup |
| `api/*` | N/A | Route handlers |
| `auth/callback` | Minimal | OAuth code exchange |

### Marketing & admin

| App | Pattern |
|-----|---------|
| Marketing | Mostly static/RSC pages; guest doctor form is `'use client'` |
| Admin | SSR tables + client interactivity for approval queues |

### Server Components vs Client Components

| Use Server Component | Use Client Component |
|---------------------|----------------------|
| Data fetch from Supabase (server client) | `useState`, `useEffect`, `useRef` |
| Read env server-side | Mapbox GL map (`farm-map-client.tsx`) |
| Pass serializable props to children | File upload, image preview |
| SEO metadata (`generateMetadata`) | Theme toggle, dropdown menus |
| Redirect / `notFound()` | Doctor chat composer, send button |

### The `@nertura/ai` boundary

`@nertura/ai` contains Gemini keys, provider calls, and `runIntelligenceEngine`. It has **no** `'use client'` entry and must **never** be imported from:

- `'use client'` components
- Shared UI in `@nertura/ui` (UI stays provider-agnostic)

**Correct pattern:**

```
Client (chat-app.tsx)
  → fetch POST /api/ai/doctor
    → route.ts (server)
      → doctor-service.ts (server)
        → runIntelligenceEngine() from @nertura/ai
```

**Files:**

- `packages/ai/src/intelligence-engine.ts` — orchestrator
- `apps/dashboard/src/lib/ai/doctor-service.ts` — persistence, credits, storage
- `apps/dashboard/src/app/api/ai/doctor/route.ts` — HTTP boundary

### Middleware (dashboard)

`apps/dashboard/src/lib/supabase/middleware.ts`:

- Unauthenticated users → `/login`
- Users without onboarding → `/onboarding`
- Public paths: auth routes, `/api/webhooks`

Admin middleware additionally checks `platform_admin` — see [Chapter 07](07-security-standards.md).

### Shared UI (`@nertura/ui`)

Import in both server and client components:

- `Button`, `Card`, `Alert` — client-safe primitives
- `DoctorAnswerCard`, `AiChatShell`, `Composer` — typically under client parents
- `MapView` — client-only (Mapbox); dynamic import with `ssr: false` when needed

Design tokens: `packages/ui/src/styles/globals.css`, `signal` (#2DDAAF), `void` (#0B1220) — see Book 02.

### Data loading patterns

**Server page:**

```typescript
// app/(dashboard)/fields/[id]/page.tsx
export default async function FieldPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await loadFieldWorkspace(id);
  return <FieldWorkspace initial={workspace} />;
}
```

**Client mutation:**

```typescript
// Prefer route handler for doctor; server actions for CRUD forms
await fetch('/api/ai/doctor', { method: 'POST', body: JSON.stringify({...}) });
```

Server actions: `apps/dashboard/src/lib/actions/operations.ts` for farm/field/crop CRUD with `revalidatePath`.

---

## Decision Rationale

**App Router** — layouts for onboarding vs dashboard vs doctor match [Book 01](../01-product-bible/07-product-principles.md) surface-specific principles without separate deployments.

**Server-only AI** — API keys, Knowledge Bank queries, and provider outputs must not leak to the browser bundle or client logs.

**React 19** — aligns with Next 15; use standard hooks patterns until Server Actions coverage expands.

---

## Examples

### Good — client doctor chat calls API only

```typescript
'use client';

const res = await fetch('/api/ai/doctor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, conversationId, fieldId }),
});
```

### Good — dynamic map import

```typescript
import dynamic from 'next/dynamic';

const FarmMapClient = dynamic(() => import('@/components/farm/farm-map-client'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});
```

### Bad — would bundle secrets (never do this)

```typescript
'use client';
import { askGemini } from '@nertura/ai'; // FORBIDDEN
```

---

## Best Practices

- Keep `page.tsx` as async Server Components; push interactivity to `components/`
- Use `loading.tsx` and `error.tsx` per route group where UX benefits
- Pass `fieldId` / `caseId` from field workspace into doctor API for context
- Use `@nertura/ui` for doctor answer presentation — consistent with marketing guest doctor
- After auth changes, test OAuth callback → onboarding → doctor path

---

## Bad Practices

- Fetching Gemini directly in a Route Handler without `runIntelligenceEngine`
- Large `'use client'` pages that could be split — server fetch + client island
- Importing `server-only` modules into client bundles (no `server-only` package guard yet — use discipline)
- Disabling middleware for convenience in production
- Using Pages Router patterns (`getServerSideProps`) in new code

---

## Future Considerations

- **`import 'server-only'`** guard at top of `@nertura/ai` entry and doctor-service
- **Partial Prerendering (PPR)** when stable for marketing SEO + interactive hero
- **React Server Actions** for doctor send (today: route handler for clearer rate limit + credit flow)
- **Suspense streaming** for long doctor responses

---

## Cross-References

- [Chapter 01 — Monorepo](01-monorepo-architecture.md)
- [Chapter 06 — API Conventions](06-api-conventions.md)
- [Book 04 — AI Behaviour Manual](../04-ai-behaviour/) — pipeline rules
- [Book 01 — AI-First & Trust Philosophy](../01-product-bible/09-ai-first-and-trust-philosophy.md)
