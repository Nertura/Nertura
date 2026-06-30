# Knowledge Ingestion

Review-first, source-based knowledge ingestion for Nertura. **Nothing auto-publishes to the Knowledge Bank.** All ingested content enters a human review queue before it can become trusted KB content.

## Principles

1. **Source-based** — Every item must cite an origin (API, dataset, manual upload, or licensed research).
2. **Review-first** — Pipeline ends at `knowledge_review_queue`; approval is a separate admin action.
3. **No aggressive scraping** — Respect robots.txt and terms of service. Placeholder providers stay disabled until licensed/API access exists.
4. **No treatment claims from vocabulary alone** — AGROVOC normalizes terms; it does not justify pesticide dosages or prescriptions.
5. **No fake data** — SoilGrids and similar APIs return real responses or honest failures; we never invent soil readings.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ knowledge_sources│────▶│ Provider registry │────▶│ knowledge_ingestion │
│ (enabled only)   │     │ Agrovoc, SoilGrids│     │ _items (collected)  │
└─────────────────┘     └──────────────────┘     └──────────┬──────────┘
                                                              │
                    ┌─────────────────────────────────────────▼──────────┐
                    │ Normalize → duplicate hash → Gemini summarize (opt) │
                    └─────────────────────────┬────────────────────────────┘
                                              │
                    ┌─────────────────────────▼────────────────────────────┐
                    │ knowledge_review_queue (pending / needs_expert)      │
                    └─────────────────────────┬────────────────────────────┘
                                              │ admin approve
                    ┌─────────────────────────▼────────────────────────────┐
                    │ knowledge_items (Knowledge Bank) + knowledge_citations│
                    └──────────────────────────────────────────────────────┘
```

### Package: `@nertura/knowledge-ingestion`

| Module | Role |
|--------|------|
| `providers/agrovoc.ts` | Live SPARQL concept search (FAO AGROVOC) |
| `providers/soilgrids.ts` | ISRIC REST API by lat/lng (optional coords) |
| `providers/manual-upload.ts` | Admin manual entries |
| `providers/cabi.ts` | Placeholder — disabled |
| `providers/plant-village.ts` | Placeholder — disabled |
| `providers/web-research.ts` | Placeholder — disabled |
| `pipeline.ts` | Orchestration, duplicate detection, review actions |
| `summarize.ts` | Gemini summarization with safety rules |
| `hash.ts` | Stable `duplicate_hash` from title + URL + text |

### Database tables

- `knowledge_sources` — Registry with trust level, license notes, schedule
- `knowledge_ingestion_jobs` — Cron/manual batch runs
- `knowledge_source_runs` — Per-source execution within a job
- `knowledge_ingestion_items` — Raw/normalized collected content
- `knowledge_review_queue` — AI summary + proposed KB payload + risk level
- `knowledge_citations` — Source references linked to ingestion/KB items

Migration: `supabase/migrations/20250704000000_knowledge_ingestion.sql`

## Review workflow

1. **Collect** — Enabled providers fetch a limited number of items per run (`maxPerSource`, default 5).
2. **Normalize** — Text cleanup; crop/disease/pest tags from provider or AI.
3. **Summarize** — If Gemini is configured, generate summary + risk level + proposed KB fields. Otherwise status `summary_pending`.
4. **Queue** — Item enters `knowledge_review_queue` with status `pending`.
5. **Admin review** — In Admin → Knowledge Ingestion:
   - **Approve → KB** — Creates `knowledge_items` row; never auto-called by cron.
   - **Needs expert** — Flags agronomic/treatment content for specialist review.
   - **Reject** — Marks item rejected; not published.

## Cron API

```
GET /api/cron/knowledge-ingestion
Authorization: Bearer $CRON_SECRET
```

Optional query params: `?lat=41.0&lon=29.0` for SoilGrids context.

Behavior:

- Runs all **enabled** sources
- Collects limited items per source
- Normalizes, summarizes (if Gemini available), enqueues review
- **Never auto-approves**

Manual trigger (admin session): `POST /api/knowledge-ingestion/run`

## Legal and licensing

| Source | License / notes |
|--------|-----------------|
| FAO AGROVOC | CC BY 4.0 — vocabulary only |
| ISRIC SoilGrids | Open data — context, not prescriptions |
| CABI | Placeholder — requires commercial/license agreement |
| PlantVillage | Placeholder — verify dataset license before enable |
| Manual upload | Admin must confirm rights |
| Web research | Disabled until robots.txt + ToS review |

Do not ingest copyrighted extension bulletins, paywalled journals, or scraped content without explicit permission.

## Safety rules

- Pesticide dosages and treatment schedules require **expert review** (`needs_expert`).
- Summaries include **uncertainty notes** when evidence is weak.
- `duplicate_hash` prevents re-inserting the same content.
- RLS: platform admin only on all ingestion tables.

## Future sources (planned)

- **FAO AGROVOC** — ✅ live (vocabulary)
- **CABI** — licensed API
- **PlantVillage** — official dataset export
- **SoilGrids** — ✅ live (with coordinates)
- **Copernicus** — land cover / vegetation indices
- **NASA** — MODIS / soil moisture (API review)
- **National agriculture ministries** — per-country open data portals
- **Universities & research papers** — DOI/metadata only; full text via license

## Local development

```bash
# Apply migration
pnpm supabase:push

# Smoke test (hash + optional AGROVOC)
pnpm test:knowledge-ingestion

# Manual ingestion run (admin UI or API with service role)
# Admin → Knowledge Ingestion → Run ingestion
```

Environment:

- `CRON_SECRET` — protects cron route
- `GEMINI_API_KEY` — optional; without it, items stay `summary_pending`
- Supabase service role in admin app for pipeline writes

## Admin UI

**Admin → Knowledge Ingestion** tabs:

- Sources
- Runs
- Collected Items
- Review Queue
- Approved
- Rejected
