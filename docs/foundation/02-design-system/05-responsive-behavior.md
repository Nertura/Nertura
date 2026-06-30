# Chapter 05 — Responsive Behavior

> Desktop 1920, laptop 1366, tablet, mobile — and the 73/27 map split.

---

## Purpose

This chapter defines **how Nertura layouts adapt** across viewports. Breakpoints follow Tailwind defaults; reference widths (1920, 1366) describe design review targets, not custom media queries.

Primary implementation: `FarmMapClient`, `DoctorChatApp`, `AiChatHeader`, `MapView`.

---

## Principles

1. **Mobile-first CSS** — Base styles for narrow screens; `sm:`, `lg:` enhance.
2. **Map-first on small screens** — Map gets `min-h-[min(50dvh,400px)]` before stacking panel below.
3. **Sidebars at lg (1024px+)** — Doctor cases panel and map 73/27 split activate at `lg`.
4. **Touch-friendly targets** — Composer buttons `h-10 w-10`; map controls `h-9 w-9`.
5. **Hide non-essential chrome on xs** — Usage hint, "New" label, Field cases header button use `hidden sm:*`.

---

## Architecture

### Tailwind breakpoints (defaults)

| Prefix | Min width | Nertura usage |
|--------|-----------|---------------|
| (none) | 0 | Stacked map/panel, full-width field cards |
| `sm` | 640px | Header padding, inline "New", composer 16px text |
| `md` | 768px | Secondary layouts (where used) |
| `lg` | 1024px | **73/27 map split**, cases sidebar, map full height |
| `xl` | 1280px | Comfortable Doctor on laptop 1366 |
| `2xl` | 1536px | Desktop 1920 — chat column stays capped at 52rem |

### Reference viewports

| Device class | Width | Expected experience |
|--------------|-------|---------------------|
| **Mobile** | 375–428 | Single column; drawer history; map 50dvh cap |
| **Tablet** | 768–1023 | Stacked or transitional; drawers over sidebars |
| **Laptop** | 1366 | lg split active; map + 400px panel; Doctor cases sidebar |
| **Desktop** | 1920 | Same as laptop; whitespace grows, content max-widths hold |

### 73/27 map split

Implemented in `apps/dashboard/src/components/farm/farm-map-client.tsx`:

```tsx
<div className="flex min-h-0 flex-col gap-3 lg:h-[calc(100dvh-10.5rem)] lg:flex-row lg:gap-4">
  <div className="relative min-h-[min(50dvh,400px)] shrink-0 lg:min-h-0 lg:flex-[73]">
    <MapView className="h-full min-h-[280px]" ... />
  </div>
  <aside className="flex min-h-0 w-full flex-col lg:flex-[27] lg:max-w-[400px] lg:overflow-hidden">
    {/* scrollable panel */}
  </aside>
</div>
```

| Region | Flex | Max width | Behavior |
|--------|------|-----------|----------|
| Map | `lg:flex-[73]` | — | Dominant; min 280px height |
| Panel | `lg:flex-[27]` | `400px` | Scrollable field list + create flow |

Mobile panel cap: `max-h-[min(52dvh,520px)]` before lg full height.

### Doctor responsive patterns

| Element | Mobile | lg+ |
|---------|--------|-----|
| Field cases | Drawer tab | Fixed `w-64` sidebar |
| History | Left drawer overlay | Same drawer |
| Composer | Sticky bottom, full width | Inside `chat-container` |
| Hero composer | Centered `max-w-[860px]` | Same |
| Example prompts | `flex-wrap justify-center` | Same |

### Evidence cards grid

`EvidenceCardsPanel`: `grid gap-2 sm:grid-cols-2` — single column on phone, two columns on sm+.

---

## Decision Rationale

| Decision | Rationale |
|----------|-----------|
| 73/27 not 70/30 | Flex integers `[73]`/`[27]` approximate golden map dominance without fractional CSS |
| 400px panel cap | Readable field cards without squeezing map on 1366 laptop (1024 usable ≈ 730 map + 400 panel) |
| 50dvh mobile map | Guarantees panel visible without excessive scroll on short phones |
| lg not md for split | Tablets in portrait need stacked layout; 1024 aligns with landscape tablet / small laptop |
| calc(100dvh - 10.5rem) | Accounts for dashboard chrome above map route |

---

## Examples

### Header responsive padding

```tsx
className="... px-4 backdrop-blur-md sm:px-6"
```

### Field context selector

```tsx
className="flex flex-col gap-1.5 sm:flex-row sm:items-center"
// select: w-full sm:max-w-md
```

### History drawer width

```tsx
className="fixed inset-y-0 left-0 z-50 flex w-[min(100%,20rem)] flex-col ..."
```

### Map area info card (responsive type)

```tsx
<p className="mt-0.5 text-base font-semibold tabular-nums sm:text-lg">
```

---

## Best Practices

- Test `/farms/[id]/map` at 375, 768, 1366, and 1920 widths
- Test Doctor at mobile with keyboard open (composer safe area)
- Use `min-w-0` on flex children with truncating text
- Prefer drawers over cramming sidebars below `lg`
- Use `dvh` units for viewport-height layouts

---

## Bad Practices

- Custom breakpoints in feature CSS outside Tailwind config
- Horizontal scroll on field card lists at mobile
- Fixed pixel page widths (e.g. `width: 1366px`)
- Showing three columns (sidebar + chat + evidence) on tablet
- Map controls placed under iOS safe area without bottom offset

---

## Future Considerations

- Dedicated `md` two-column farm list + map preview (not shipped)
- Landscape phone map fullscreen toggle
- Container-query-based evidence card columns
- PWA standalone mode viewport adjustments

---

## Related Chapters

- [04 — Spacing & Layout](04-spacing-and-layout.md)
- [08 — Map UI](08-map-ui.md)
- [09 — Farm & Field UI](09-farm-and-field-ui.md)
