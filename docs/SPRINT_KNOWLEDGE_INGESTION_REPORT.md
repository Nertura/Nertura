# Knowledge Ingestion Sprint — Final Report

**Sprint:** Nertura Knowledge Ingestion (review-first, source-based)  
**Date:** 2025-07-04  
**Status:** Complete (migration pending push)

## Summary

Built the first safe, review-first knowledge ingestion pipeline for Nertura. Content is collected from licensed/API sources, normalized, optionally summarized by Gemini, and queued for human review. **Nothing auto-publishes to the Knowledge Bank.**

## Files changed / created

### Database
- `supabase/migrations/20250704000000_knowledge_ingestion.sql`

### Package `@nertura/knowledge-ingestion`
- `packages/knowledge-ingestion/package.json`
- `packages/knowledge-ingestion/tsconfig.json`
- `packages/knowledge-ingestion/src/types.ts`
- `packages/knowledge-ingestion/src/hash.ts`
- `packages/knowledge-ingestion/src/summarize.ts`
- `packages/knowledge-ingestion/src/pipeline.ts`
- `packages/knowledge-ingestion/src/index.ts`
- `packages/knowledge-ingestion/src/providers/index.ts`
- `packages/knowledge-ingestion/src/providers/agrovoc.ts`
- `packages/knowledge-ingestion/src/providers/soilgrids.ts`
- `packages/knowledge-ingestion/src/providers/cabi.ts`
- `packages/knowledge-ingestion/src/providers/plant-village.ts`
- `packages/knowledge-ingestion/src/providers/manual-upload.ts`
- `packages/knowledge-ingestion/src/providers/web-research.ts`

### Admin app
- `apps/admin/package.json` — added `@nertura/knowledge-ingestion`
- `apps/admin/src/components/admin-shell.tsx` — nav link
- `apps/admin/src/components/knowledge-ingestion-admin.tsx`
- `apps/admin/src/app/knowledge-ingestion/page.tsx`
- `apps/admin/src/app/api/cron/knowledge-ingestion/route.ts`
- `apps/admin/src/app/api/knowledge-ingestion/run/route.ts`
- `apps/admin/src/app/api/knowledge-ingestion/data/route.ts`
- `apps/admin/src/app/api/knowledge-ingestion/review/[id]/route.ts`

### Docs & tests
- `docs/knowledge-ingestion.md`
- `scripts/test-knowledge-ingestion.ts`
- `package.json` — `test:knowledge-ingestion` script

## Migrations

| Table | Purpose |
|-------|---------|
| `knowledge_sources` | Source registry (trust, license, schedule) |
| `knowledge_ingestion_jobs` | Cron/manual batch runs |
| `knowledge_source_runs` | Per-source execution within a job |
| `knowledge_ingestion_items` | Collected raw/normalized content |
| `knowledge_review_queue` | Human review gate |
| `knowledge_citations` | Source references |

Seeded sources: FAO AGROVOC (enabled), ISRIC SoilGrids (enabled), Manual Upload (enabled), CABI / PlantVillage / Web Research (disabled placeholders).

## Providers

| Provider | Status |
|----------|--------|
| `AgrovocProvider` | Live — SPARQL vocabulary lookup |
| `SoilGridsProvider` | Live — ISRIC REST (requires lat/lng) |
| `ManualUploadProvider` | Stub — admin-driven |
| `CabiProvider` | Placeholder — disabled |
| `PlantVillageDatasetProvider` | Placeholder — disabled |
| `WebResearchProvider` | Placeholder — disabled |

## Admin pages

**Admin → Knowledge Ingestion** (`/knowledge-ingestion`)

Tabs: Sources · Runs · Collected Items · Review Queue · Approved · Rejected

Actions: view item, view citation, approve → KB, reject, needs expert, manual run ingestion.

## API routes

| Route | Auth | Purpose |
|-------|------|---------|
| `GET /api/cron/knowledge-ingestion` | `Bearer $CRON_SECRET` | Daily ingestion |
| `POST /api/knowledge-ingestion/run` | Admin session | Manual run |
| `GET /api/knowledge-ingestion/data` | Admin session | Tab data |
| `POST /api/knowledge-ingestion/review/[id]` | Admin session | approve / reject / needs_expert |

## Tests

| Command | Result |
|---------|--------|
| `pnpm typecheck` | Pass |
| `pnpm build` | Pass |
| `pnpm test:knowledge-ingestion` | Pass (hash/normalize; AGROVOC optional via network) |

## Manual actions required

1. **Apply migration:** `pnpm supabase:push`
2. **Set env (admin):** `CRON_SECRET`, Supabase service role (existing), optional `GEMINI_API_KEY`
3. **Schedule cron:** Point daily job at `GET /api/cron/knowledge-ingestion` with `Authorization: Bearer $CRON_SECRET`
4. **Optional SoilGrids:** Pass `?lat=&lon=` on cron URL or configure farm centroid later
5. **First run:** Admin → Knowledge Ingestion → Run ingestion → review queue

## Next data sources to connect

1. **CABI** — licensed API agreement
2. **PlantVillage** — official dataset export + license review
3. **Copernicus** — land cover / vegetation
4. **NASA** — MODIS / soil moisture APIs
5. **National agriculture ministries** — per-country open portals
6. **Universities / DOI metadata** — research papers with explicit rights
7. **Web Research provider** — only after robots.txt + ToS audit per domain

## Safety guarantees

- Duplicate hash prevents re-insertion
- Gemini summaries forbid dosage/prescription claims
- AGROVOC used for vocabulary only
- SoilGrids returns real data or honest failure
- RLS: platform admin only on all ingestion tables
- Cron never calls `approveReviewItem`
