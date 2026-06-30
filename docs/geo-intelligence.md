# Geo Intelligence (Sprint 1A)

> Map provider abstraction, field boundaries, and regional API placeholders.

## Architecture

| Layer | Package / path | Role |
|-------|----------------|------|
| Map provider | `@nertura/geo` | `MapProvider` interface; Mapbox + noop fallback |
| Map UI | `@nertura/ui` → `MapView` | Zoom, geolocation, layer slot, loading/empty/error |
| Dashboard | `apps/dashboard` | Farm map page, polygon draw, API routes |
| Geometry | `@nertura/geo/geometry` | Turf-based area (m²), hectares, centroid |
| Regional APIs | `@nertura/geo/providers` | Reverse geocode, weather, soil, satellite (stubs) |

## Environment

```bash
# apps/dashboard/.env.local
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.xxx
```

Without a token, the map shows a branded placeholder; polygon metrics still compute client-side.

## Database

Migration `20250702000000_field_geo_intelligence.sql`:

- `fields.area_m2` — square metres
- `fields.centroid` — PostGIS point (EPSG:4326)
- RPC `update_field_boundary(field_id, geojson)` — saves boundary + derived metrics

GeoJSON is also stored in `fields.metadata.boundary_geojson` for client rendering.

## Routes

| Route | Purpose |
|-------|---------|
| `/farms` | My Farm hub |
| `/farms/new` | 3-step create farm wizard → redirects to map |
| `POST /api/farms` | Create farm with address, site type, optional GPS |
| `/farms/[id]/map` | Interactive farm map + polygon drawing (`?draw=1` opens add-field flow) |
| `POST /api/fields` | Create field with boundary, type, optional crop |

## AI Doctor field context

Users select a field in Plant Doctor. Selection is persisted in `localStorage` (`nertura_selected_field_id`) and sent as `fieldId` to `/api/ai/doctor`. `loadFarmIntelligenceProfile` merges `FieldIntelligenceContext` into Gemini prompts.

## Manual actions

1. Run `pnpm supabase:push` (or apply migration on production).
2. Create a Mapbox access token with `styles:read` and add to Vercel env.
3. Enable browser geolocation over HTTPS in production (`app.nertura.com`).

## Future sprints

- Wire live weather/soil/satellite providers behind existing interfaces
- NDVI and satellite layer toggle on `MapView.layerControls`
- Replace onboarding CSS map placeholder with shared `MapView`
