# Chapter 03 — TypeScript Standards

## Purpose

Ensure **end-to-end type safety** from Supabase rows through API responses to React props — with one shared vocabulary in `@nertura/types` and strict compiler settings everywhere.

---

## Principles

1. **`strict: true` everywhere** — no implicit `any`, no unchecked index access shortcuts
2. **Types at package boundaries** — `@nertura/types` for domain shapes; apps do not redefine `Field` or `DoctorDiagnosis`
3. **Zod validates runtime; TypeScript validates compile time** — parse API bodies with Zod, infer types with `z.infer` where helpful
4. **Prefer `type` for unions and DB shapes; `interface` for extensible public APIs** — be consistent within a file
5. **No `as any`** — use narrowing, type guards, or fix the source type

---

## Architecture

### Shared config

Base config: `packages/typescript-config/base.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ES2022",
    "noEmit": true
  }
}
```

Apps extend via `@nertura/typescript-config/nextjs.json` (or equivalent per app).

### `@nertura/types` structure

```
packages/types/src/
├── index.ts           # Re-exports + ApiError, ApiResponse, enums
├── database.ts        # Farm, Field, Crop, row shapes, GeoJsonPolygonLike
├── doctor.ts          # DoctorDiagnosis, DoctorApiResponse
└── intelligence.ts    # EvidenceCard, IntelligenceApiResponse
```

### Standard API types

```typescript
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}
```

Route handlers often return ad-hoc JSON for doctor flows; new CRUD APIs should converge on `ApiResponse<T>` where practical.

### Domain enums (examples)

```typescript
export type AppRole = 'owner' | 'admin' | 'manager' | 'operator' | 'viewer';
export type OrganizationType = 'farm' | 'cooperative' | 'ag_company' | 'supplier' | 'exporter';
export type CropStatus = 'planned' | 'active' | 'harvested' | 'failed' | 'archived';
```

String unions preferred over TypeScript `enum` for JSON serialization compatibility.

### Zod at boundaries

```typescript
const bodySchema = z
  .object({
    conversationId: z.string().uuid().optional(),
    message: z.string().max(4000).optional(),
    imageBase64: z.string().optional(),
    fieldId: z.string().uuid().optional(),
  })
  .refine((data) => Boolean(data.message?.trim()) || Boolean(data.imageBase64), {
    message: 'Message or image is required',
  });
```

Use `.parse()` in route handlers; catch `ZodError` and return 400 with field-level detail when useful.

### Supabase typing

- Row types live in `packages/types/src/database.ts`
- When migrations add columns, **update types in the same PR**
- Use `.select('col1, col2')` with explicit column lists — avoids over-fetching and documents intent
- Cast `metadata` JSONB with narrow types: `(row.metadata as { messages?: AiMessage[] })`

---

## Decision Rationale

**Single types package** replaces the planned `@nertura/db` — Supabase client stays in each app's `lib/supabase/`; shapes are shared via `@nertura/types`.

**Strict mode** catches null org IDs and missing await at compile time — critical for RLS-scoped queries.

**String unions over enums** — database and JSON APIs use strings; enums add friction without runtime benefit.

---

## Examples

### Good — import domain type in component

```typescript
import type { DoctorDiagnosis } from '@nertura/types';

interface DiagnosisCardProps {
  diagnosis: DoctorDiagnosis;
}
```

### Good — narrow unknown error

```typescript
} catch (err) {
  const message = err instanceof Error ? err.message : 'Doctor request failed';
  console.error('[doctor] request failed', err);
  // ...
}
```

### Good — satisfy with const assertion for literals

```typescript
status: (formData.get('status') as CropStatus) || 'planned',
```

Prefer Zod `z.enum([...])` for API inputs instead of casting FormData.

---

## Best Practices

- Run `pnpm typecheck` before every PR — Turbo runs it across the graph
- Export public types from `packages/types/src/index.ts` only
- Use `import type { ... }` for type-only imports (erasable, clearer intent)
- Prefer `readonly` for arrays passed into prompts when not mutating
- Document non-obvious JSONB shapes inline once near the cast site

---

## Bad Practices

- Duplicating `interface Field` in dashboard and admin
- `@ts-ignore` / `@ts-expect-error` without ticket link and removal plan
- `as unknown as Foo` double casts to silence errors
- Using `any` for Supabase `metadata` — define a minimal interface
- Generating types from Supabase CLI without reviewing diffs — merge carefully with hand-maintained domain types

---

## Future Considerations

- **`supabase gen types`** wired to CI with diff check against `packages/types`
- **Branded types** for `OrganizationId`, `FieldId` UUIDs when mistake rate warrants
- **zod-to-openapi** for public API documentation if partners integrate

---

## Cross-References

- [Chapter 06 — API Conventions](06-api-conventions.md)
- [Chapter 05 — Supabase & Database](05-supabase-and-database.md)
- [Chapter 09 — Testing & Quality Gates](09-testing-and-quality-gates.md)
