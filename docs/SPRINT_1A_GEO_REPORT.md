# Sprint 1A — Geo Intelligence Foundation Report

**Date:** June 2026  
**Status:** Complete — `pnpm typecheck` (8/8) and `pnpm build` (3 apps) pass

---

## Summary

Production-ready geo intelligence foundation: Mapbox behind a provider abstraction, reusable `MapView`, farm map with polygon drawing, GeoJSON persistence, area/centroid calculations, regional API stubs, and AI Doctor field context — without breaking existing flows.

---

## Files Changed

### New package: `@nertura/geo`
| File | Purpose |
|------|---------|
| `packages/geo/package.json` | Workspace package + Turf + Mapbox peer |
| `packages/geo/src/index.ts` | Public exports |
| `packages/geo/src/types.ts` | GeoJSON / LatLng types |
| `packages/geo/src/geometry.ts` | Area (m²), hectares, centroid (Turf) |
| `packages/geo/src/map/types.ts` | `MapProvider` / `MapInstance` interfaces |
| `packages/geo/src/map/mapbox-provider.ts` | Mapbox implementation |
| `packages/geo/src/map/noop-provider.ts` | Fallback when no token |
| `packages/geo/src/map/mapbox.css` | Mapbox GL CSS re-export |
| `packages/geo/src/providers/*.ts` | Reverse geocode, weather, soil, satellite interfaces + stubs |

### Shared UI
| File | Purpose |
|------|---------|
| `packages/ui/src/components/map-view.tsx` | Reusable map: zoom, geolocation, layers slot, loading/empty/error |
| `packages/ui/package.json` | Depends on `@nertura/geo` |
| `packages/ui/src/index.ts` | Exports `MapView` |

### Dashboard
| File | Purpose |
|------|---------|
| `apps/dashboard/src/app/(dashboard)/farms/page.tsx` | **My Farm** hub with map CTA |
| `apps/dashboard/src/app/(dashboard)/farms/[id]/map/page.tsx` | Farm Map page |
| `apps/dashboard/src/app/(dashboard)/farms/[id]/page.tsx` | Link to farm map |
| `apps/dashboard/src/components/farm/farm-map-workspace.tsx` | Polygon draw + save workflow |
| `apps/dashboard/src/lib/geo/map-provider.ts` | Resolves Mapbox vs noop |
| `apps/dashboard/src/lib/geo/field-geo.ts` | GeoJSON ↔ coordinates helpers |
| `apps/dashboard/src/app/api/fields/route.ts` | Create field + boundary |
| `apps/dashboard/src/app/api/fields/[id]/boundary/route.ts` | Update boundary |
| `apps/dashboard/src/components/doctor/field-context-selector.tsx` | Field picker for AI Doctor |
| `apps/dashboard/src/components/doctor/chat-app.tsx` | Sends `fieldId` to doctor API |
| `apps/dashboard/src/app/(chat)/doctor/page.tsx` | Loads fields for selector |
| `apps/dashboard/src/lib/onboarding/farm-profile-loader.ts` | `loadFieldIntelligenceContext` |
| `apps/dashboard/src/lib/ai/doctor-service.ts` | Accepts `fieldId` |
| `apps/dashboard/src/app/api/ai/doctor/route.ts` | `fieldId` in body schema |
| `apps/dashboard/src/lib/navigation.ts` | Farms nav active for `/farms/*/map` |
| `apps/dashboard/package.json` | `@nertura/geo`, `mapbox-gl` |
| `apps/dashboard/.env.example` | `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` |

### Types & AI
| File | Purpose |
|------|---------|
| `packages/types/src/database.ts` | `area_m2`, `FieldGeoMetadata`, `GeoJsonPolygonLike` |
| `packages/types/src/index.ts` | Export new types |
| `packages/ai/src/farm-profile.ts` | `FieldIntelligenceContext`, prompt block |
| `packages/ai/src/index.ts` | Export `FieldIntelligenceContext` |

### Database
| File | Purpose |
|------|---------|
| `supabase/migrations/20250702000000_field_geo_intelligence.sql` | `area_m2`, `centroid`, `update_field_boundary` RPC |

### Documentation
| File | Purpose |
|------|---------|
| `docs/geo-intelligence.md` | Sprint 1A geo guide |
| `docs/NERTURA_ARCHITECTURE_BIBLE.md` | Monorepo map + integrations table |
| `docs/nertura-index.md` | Index entry |

---

## New Components

| Component | Location | Notes |
|-----------|----------|-------|
| `MapView` | `@nertura/ui` | Provider-agnostic; zoom, GPS, layer placeholder |
| `FarmMapWorkspace` | Dashboard | Draw polygon, metrics preview, save |
| `FieldContextSelector` | Dashboard Doctor | Persists selection in localStorage |

---

## Database Changes

**Migration:** `20250702000000_field_geo_intelligence.sql`

- `fields.area_m2` — numeric(14,2), square metres
- `fields.centroid` — PostGIS Point (EPSG:4326)
- GIST index on `centroid`
- RPC `update_field_boundary(field_id, geojson)` — writes PostGIS `boundary`, updates `area`, `area_m2`, `centroid`, and `metadata.boundary_geojson`

Existing `fields.boundary` and `metadata.boundary_geojson` (onboarding) remain compatible.

---

## Tests Performed

| Command | Result |
|---------|--------|
| `pnpm install` | Pass |
| `pnpm typecheck` | Pass (8/8 packages) |
| `pnpm build` | Pass — marketing, dashboard, admin |

---

## Remaining Manual Actions

1. **Apply migration:** `pnpm supabase:push` (local + production Supabase).
2. **Mapbox token:** Create token at [mapbox.com](https://account.mapbox.com/) → set `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` in dashboard `.env.local` and Vercel.
3. **HTTPS:** Browser geolocation requires HTTPS in production (`app.nertura.com`).
4. **Optional:** Restrict Mapbox token URL to your domains.
5. **Future:** Replace onboarding CSS `map-placeholder.tsx` with shared `MapView` (not in this sprint scope).

---

## Architecture Notes

- **No Mapbox hard-coding in UI** — apps pass `MapProvider` from `@nertura/geo`.
- **Weather / soil / satellite** — interfaces + stubs only; no live API keys wired.
- **AI Doctor** — optional `fieldId`; enriches Gemini prompts via `FieldIntelligenceContext`.
- **Mobile** — responsive grid (map stacks above sidebar on small screens).
