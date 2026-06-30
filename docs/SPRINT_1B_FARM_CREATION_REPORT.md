# Sprint 1B — Smart Farm Creation + Map UX Report

**Date:** June 2026  
**Status:** Complete — `pnpm typecheck` (8/8) and `pnpm build` (3 apps) pass

---

## Summary

Professional farm creation wizard, improved My Farm hub, UUID-safe routing, and a guided field-drawing workflow. Users create a farm → land on `/farms/{uuid}/map` → name/type/crop → draw polygon → save via `update_field_boundary` RPC.

---

## Root cause: `/farms/1/map` 404

Farm IDs are **UUIDs**, not integers. Visiting `/farms/1/map` correctly returns not-found because no farm with id `1` exists. Sprint 1B adds `InvalidFarmIdHint` for non-UUID paths and ensures all UI links use `farm.id` from the database.

---

## Files changed

### New
| File | Purpose |
|------|---------|
| `apps/dashboard/src/components/farm/create-farm-wizard.tsx` | 3-step wizard: details → size → geolocation |
| `apps/dashboard/src/components/farm/farms-empty-state.tsx` | Rich empty state with CTA |
| `apps/dashboard/src/components/farm/farm-hub-card.tsx` | Farm card: location, area, field count, actions |
| `apps/dashboard/src/components/farm/invalid-farm-id.tsx` | Helpful message for invalid farm IDs |
| `apps/dashboard/src/lib/farm/types.ts` | Site types, field types, area units |
| `apps/dashboard/src/lib/farm/area-units.ts` | Dönüm/hectare/acre normalization |
| `apps/dashboard/src/lib/farm/location.ts` | Location label formatter |
| `apps/dashboard/src/lib/farm/uuid.ts` | UUID validation helper |
| `apps/dashboard/src/app/api/farms/route.ts` | `POST` create farm |

### Updated
| File | Change |
|------|--------|
| `apps/dashboard/src/app/(dashboard)/farms/page.tsx` | Hub with field counts, empty state, cards |
| `apps/dashboard/src/app/(dashboard)/farms/new/page.tsx` | Uses `CreateFarmWizard` |
| `apps/dashboard/src/app/(dashboard)/farms/[id]/map/page.tsx` | UUID guard, location header, `?draw=1` |
| `apps/dashboard/src/app/(dashboard)/farms/[id]/page.tsx` | UUID guard, formatted location/area |
| `apps/dashboard/src/components/farm/farm-map-workspace.tsx` | Setup → draw → save; field type & crop |
| `apps/dashboard/src/app/api/fields/route.ts` | `fieldType`, optional `cropName` |
| `apps/dashboard/src/lib/actions/operations.ts` | Legacy `createFarm` redirects to map |
| `apps/dashboard/src/components/doctor/field-context-selector.tsx` | Farm + area + crops in labels |
| `apps/dashboard/src/app/(chat)/doctor/page.tsx` | Loads crops per field |
| `packages/ai/src/farm-profile.ts` | `fieldType` in AI prompt block |
| `apps/dashboard/src/lib/onboarding/farm-profile-loader.ts` | Loads `fieldType` |
| `docs/geo-intelligence.md` | Sprint 1B routes |

---

## Routes fixed / added

| Route | Behavior |
|-------|----------|
| `/farms` | Empty state CTA or farm cards with real UUID links |
| `/farms/new` | Create farm wizard |
| `/farms/[uuid]/map` | Works with real UUIDs; invalid IDs show hint |
| `/farms/[uuid]/map?draw=1` | Auto-opens add-field setup |
| `POST /api/farms` | Creates farm → `{ redirectTo: /farms/{id}/map }` |

No hard-coded `/farms/1` links in codebase.

---

## DB / API changes

**No new migration.** Uses existing `farms`, `fields`, `crops`, and `update_field_boundary` RPC.

- **Dönüm** stored as hectares in DB with `metadata.display_area_unit` + `metadata.display_area`
- Farm `metadata.site_type`, `address` JSON (country, city, district)
- Field `metadata.field_type`; optional crop row on field create

---

## Create farm wizard fields

| Field | Required |
|-------|----------|
| Farm name | Yes |
| Country | Yes |
| City | Yes |
| District | Yes |
| Site type (farm/greenhouse/orchard/cooperative/other) | Yes |
| Total area | No |
| Unit (hectare / dönüm / acre) | Yes if area set |
| GPS (Use my location) | No |

---

## Tests performed

| Command | Result |
|---------|--------|
| `pnpm typecheck` | Pass (8/8) |
| `pnpm build` | Pass (marketing, dashboard, admin) |

---

## Remaining manual actions

1. **Create a farm** at `/farms/new` — you will be redirected to `/farms/{uuid}/map` (not `/farms/1/map`).
2. Set `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` in `apps/dashboard/.env.local` for satellite map tiles.
3. Allow browser geolocation when prompted (HTTPS in production).

---

## User flow (happy path)

1. `/farms` → **Create your first farm**
2. Wizard: name, location, site type → optional area → optional GPS
3. Redirect to `/farms/{uuid}/map`
4. **Add your first field** → name, type, optional crop → **Draw on map** → save
5. Field boundary saved; area_m², ha, centroid computed via RPC
6. **Ask AI Doctor** with field context from selector
