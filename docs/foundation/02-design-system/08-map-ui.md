# Chapter 08 — Map UI

> MapView, farm-map-client patterns, panel scroll, and geolocation info cards.

---

## Purpose

This chapter documents **interactive farm map UI** — the shared `MapView` component and the dashboard `FarmMapClient` that implements field drawing, geocoding, and the 73/27 layout.

Code: `packages/ui/src/components/map-view.tsx`, `apps/dashboard/src/components/farm/farm-map-client.tsx`.

---

## Principles

1. **Map dominates** — 73% flex on lg+; panel supports, never competes.
2. **Provider abstraction** — `MapView` accepts `MapProvider` from `@nertura/geo`; dashboard wires Mapbox.
3. **Info over alarm for geo** — Permission denied uses info styling, not destructive red.
4. **Localized labels** — `MapViewLabels` passed from `getFarmMapCopy(locale)`.
5. **Drawing feedback on map** — Area overlay card floats bottom-left during draw/confirm phases.

---

## Architecture

### MapView states

| Status | UI |
|--------|-----|
| `loading` | Spinner overlay on muted background |
| `unconfigured` | Emerald gradient placeholder + token hint |
| `error` | Destructive tint overlay |
| `ready` | Map + controls |

### MapView controls (ready state)

| Control | Position | Component |
|---------|----------|-----------|
| Layer hint / controls | Top-left | Dashed chip or `layerControls` slot |
| Zoom in/out | Bottom-right stack | `Button` secondary icon |
| My location | Bottom-right | Geolocation with loading spinner |

### Geolocation info card

When geolocation fails, bottom banner:

```tsx
// geoErrorVariant === 'info' (default in FarmMapClient)
'border border-border/80 bg-background/95 text-muted-foreground'

// geoErrorVariant === 'destructive'
'border border-destructive/30 bg-background/95 text-destructive'
```

Messages: unsupported browser, permission denied, retrieve failed — all localized via `labels`.

### FarmMapClient layout

**Route context:** `/farms/[id]/map`

| Region | Classes | Content |
|--------|---------|---------|
| Map column | `lg:flex-[73]`, mobile `min-h-[min(50dvh,400px)]` | `MapView` + area overlay |
| Panel | `lg:flex-[27] lg:max-w-[400px]` | Scrollable `overflow-y-auto overscroll-contain` |

**Panel contents (idle):**

- Farm `Card` with name, location, field count
- Field card buttons (selected state: `border-primary bg-primary/5 ring-1 ring-primary/25`)
- Actions: redraw boundary, field details link

**Create flow phases:** `idle` → `locate` → `draw` → `confirm`

- `CompactStepBar` — 3 steps with dot indicators
- Geocode search, GPS locate, polygon draw on map
- Confirm: field name, crop, area mismatch warnings

### Map layers on draw

| Layer | Source |
|-------|--------|
| Existing polygons | `fieldsToPolygonMap(fields)` |
| Draft polyline | 2+ vertices preview |
| Draft vertices | Green points `#16a34a` |
| `viewTarget` | Fly/fit on geocode result |

### Area overlay (draw/confirm)

Floating card `max-w-[220px] sm:max-w-[240px]`:

- m² primary metric (tabular-nums)
- dönüm · ha secondary
- Vertex count
- Amber mismatch warning if stated area differs

---

## Decision Rationale

| Decision | Rationale |
|----------|-----------|
| `hideLayerHint` in FarmMapClient | Layer chip is placeholder; farm map hides default "coming soon" text |
| Info geo errors | Denying location is user choice, not app failure |
| Panel `max-h-[min(52dvh,520px)]` mobile | Ensures map remains visible above fold |
| Step bar at 10px/-xs | Dense but readable in 400px panel |
| Separate geocoding + map providers | Mapbox map vs geocoding API configuration independence |

---

## Examples

### MapView with farm labels

```tsx
<MapView
  provider={mapProvider}
  className="h-full min-h-[280px]"
  center={mapCenter}
  zoom={mapZoom}
  viewTarget={viewTarget}
  polygons={polygons}
  polylines={polylines}
  points={isDrawing ? vertices : undefined}
  drawingMode={isDrawing}
  hideLayerHint
  labels={mapLabels}
  geoErrorVariant="info"
  onMapClick={handleMapClick}
/>
```

### Field selection card

```tsx
<button
  className={`w-full rounded-lg border p-3 text-left transition-colors ${
    isSelected
      ? 'border-primary bg-primary/5 ring-1 ring-primary/25'
      : 'border-border hover:border-primary/40 hover:bg-muted/40'
  }`}
>
```

### Unconfigured map message

Panel shows when `!mapConfigured`:

```tsx
<p className="rounded-lg border border-border/80 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
  {copy.mapUnconfigured}
</p>
```

---

## Best Practices

- Pass `viewTarget.token` increment to re-fly same bounds on repeat search
- Use `geoErrorVariant="info"` for permission UX unless true system failure
- Keep map `min-h-[280px]` for Mapbox init stability
- Localize all `MapViewLabels` through `getFarmMapCopy`
- Show `Alert` for save errors; `infoMessage` for non-blocking guidance

---

## Bad Practices

- Embedding Mapbox directly in dashboard bypassing `MapView`
- Destructive styling for "enable location" hints
- Panel scroll without `overscroll-contain` (scroll bleed)
- Drawing mode without visual vertex feedback
- Hard-coded English map strings in `FarmMapClient`

---

## Future Considerations

- `layerControls` slot for weather/soil/satellite (hint text exists, not implemented)
- Clustered field markers at low zoom
- Offline map tiles for field walk
- Split-screen Doctor + map (not current route structure)

---

## Related Chapters

- [05 — Responsive Behavior](05-responsive-behavior.md)
- [09 — Farm & Field UI](09-farm-and-field-ui.md)
- [11 — States: Loading, Empty, Error](11-states-loading-empty-error.md)
