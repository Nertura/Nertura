# Chapter 02 — Folder Structure & Naming

## Purpose

Establish **predictable file layout and naming conventions** so any engineer can navigate an app in under a minute and AI agents generate code in the right place.

---

## Principles

1. **Domain folders over type folders** — `lib/ai/`, `lib/farm/`, not `lib/services/` dumping ground
2. **kebab-case for files and folders** — `farm-map-client.tsx`, `field-case-service.ts`
3. **PascalCase for React components** — file name matches export: `DoctorChatApp` in `chat-app.tsx` or `doctor/chat-app.tsx`
4. **Colocate by feature** — route + components + lib helpers for one domain stay discoverable together
5. **Route groups for layout** — `(dashboard)`, `(chat)` in App Router; parentheses do not affect URL

---

## Architecture

### Standard app layout (`apps/dashboard` as reference)

```
apps/dashboard/src/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Authenticated shell layout
│   │   ├── page.tsx              # Home / Agriculture OS
│   │   ├── fields/
│   │   ├── farms/
│   │   └── ...
│   ├── (chat)/                   # Full-screen doctor layout
│   │   └── doctor/
│   ├── api/                      # Route handlers only
│   │   ├── ai/
│   │   ├── fields/
│   │   └── webhooks/
│   ├── auth/
│   ├── onboarding/
│   ├── layout.tsx
│   └── globals.css
├── components/                   # React components (by domain)
│   ├── dashboard/                # Shell, nav, top-bar
│   ├── doctor/
│   ├── farm/
│   ├── field/
│   ├── intake/
│   └── onboarding/
└── lib/                          # Server + shared logic (no JSX unless tiny)
    ├── ai/
    ├── auth/
    ├── credits/
    ├── farm/
    ├── field-intelligence/
    ├── geo/
    ├── intake/
    ├── onboarding/
    ├── supabase/
    └── actions/                  # Server actions (operations.ts)
```

### Package layout (`packages/ai` as reference)

```
packages/ai/src/
├── intelligence-engine.ts        # Main orchestrator
├── knowledge-bank-doctor.ts
├── gemini.ts
├── upload-messages.ts            # User-facing error copy
├── index.ts                      # Public exports only
└── types.ts
```

### Supabase layout

```
supabase/
├── migrations/                   # Timestamped SQL — sole schema authority
├── policies/                     # RLS fragments (referenced or inlined in migrations)
├── seed/seed.sql
└── scripts/
    ├── verify-rls.sql
    ├── verify-migrations.sql
    └── verify-auth.sql
```

### Naming conventions

| Artifact | Convention | Example |
|----------|------------|---------|
| Folders | kebab-case | `field-intelligence/` |
| React component files | kebab-case | `farm-map-client.tsx` |
| React components | PascalCase | `FarmMapClient` |
| Hooks | camelCase, `use` prefix | `useMapDraw` in `use-map-draw.ts` |
| Server modules | kebab-case | `doctor-service.ts` |
| API routes | `route.ts` in folder path | `api/ai/doctor/route.ts` |
| Server actions file | plural domain | `lib/actions/operations.ts` |
| Types / interfaces | PascalCase | `DoctorDiagnosis`, `FieldGeoMetadata` |
| Constants | SCREAMING_SNAKE or const object | `GUEST_QUESTION_LIMIT` |
| SQL migrations | `YYYYMMDDHHMMSS_description.sql` | `20250702000000_field_geo_intelligence.sql` |
| Env vars (public) | `NEXT_PUBLIC_*` | `NEXT_PUBLIC_SUPABASE_URL` |
| Env vars (secret) | No `NEXT_PUBLIC_` | `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |

### Path aliases

Each app uses `@/` → `src/`:

```json
"paths": { "@/*": ["./src/*"] }
```

Import workspace packages by package name:

```typescript
import { runIntelligenceEngine } from '@nertura/ai';
import type { DoctorDiagnosis } from '@nertura/types';
import { Button } from '@nertura/ui';
```

### Client vs server file hints

| Suffix / marker | Meaning |
|-----------------|---------|
| `*.client.ts` | Browser-only (Mapbox, geocoding client) |
| `'use client'` at top | React client component |
| No directive in `app/**/page.tsx` | Server Component by default |
| `lib/supabase/server.ts` | Server Supabase client |
| `lib/supabase/middleware.ts` | Edge middleware session refresh |

---

## Decision Rationale

**Domain folders** mirror how farmers think (farm, field, doctor) and match [Book 01 Product Principles](../01-product-bible/07-product-principles.md) — field as patient file.

**kebab-case files** avoid cross-OS casing issues and match Next.js community defaults.

**`lib/` vs `components/`** — JSX that is reused visually lives in `components/`; data fetching, Supabase, AI orchestration lives in `lib/`. Server actions may live in `lib/actions/` for clarity.

**Route groups** `(dashboard)` vs `(chat)` allow different shells (sidebar OS vs full-screen doctor) without URL pollution.

---

## Examples

### Good — field boundary API colocated with geo lib

```
apps/dashboard/src/app/api/fields/[id]/boundary/route.ts
apps/dashboard/src/lib/geo/boundary-validation.ts
apps/dashboard/src/lib/geo/field-geo.ts
```

### Good — admin auth gate

```
apps/admin/src/lib/auth/platform-admin.ts
apps/admin/src/lib/supabase/middleware.ts
```

### Good — shared type in package

```typescript
// packages/types/src/doctor.ts
export interface DoctorDiagnosis { ... }
```

---

## Best Practices

- New dashboard feature: add route under `app/(dashboard)/`, components under `components/<domain>/`, logic under `lib/<domain>/`
- One primary export per file for services; barrel `index.ts` only in packages
- Name files after what they do: `farm-profile-loader.ts`, not `utils2.ts`
- Keep `page.tsx` thin — load data in page, render in component
- Document non-obvious domain acronyms once in file header comment (sparingly)

---

## Bad Practices

- `components/misc/`, `lib/helpers/`, `utils2.ts` — use domain names
- Putting Supabase service-role client in a file imported by client components
- Mixing marketing and dashboard routes in one app folder
- Creating `packages/dashboard-stuff` — extend existing packages or `lib/`
- Renaming `apps/marketing` back to `web` — breaks deploy configs and docs

---

## Future Considerations

- **`packages/config`** — shared ESLint/Prettier when duplication grows
- **Feature flags module** — `lib/feature-flags.ts` per app or shared package
- **i18n folders** — `messages/tr.json`, `messages/en.json` when full UI i18n ships (manifesto § Global Strategy)

---

## Cross-References

- [Chapter 01 — Monorepo Architecture](01-monorepo-architecture.md)
- [Chapter 04 — React & Next.js](04-react-and-nextjs.md)
- [Book 02 — Design System](../02-design-system/) — component naming alignment
