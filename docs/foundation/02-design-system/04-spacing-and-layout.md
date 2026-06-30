# Chapter 04 — Spacing & Layout

> chat-container, card rhythm, panel scroll, and vertical shell structure.

---

## Purpose

This chapter defines **spatial rhythm** — padding, gaps, max-widths, and scroll regions — so every screen feels consistent without a bespoke grid system. Patterns are extracted from `globals.css`, `AiChatShell`, `FarmMapClient`, and shadcn Card defaults.

---

## Principles

1. **Centered conversational column** — Doctor chat uses `.chat-container` (`max-width: 52rem`, horizontal padding).
2. **4px Tailwind grid** — Standard `gap-2`, `gap-3`, `gap-4`, `p-4`, `p-6` scale.
3. **Scroll inside panels, not page** — Map layout and case lists use `overflow-y-auto` on designated regions.
4. **Sticky footer composer** — Chat input sticks to bottom with safe-area inset for mobile.
5. **Full viewport shells** — Doctor uses `min-h-[100dvh]`; map uses `calc(100dvh - offset)` on large screens.

---

## Architecture

### Global layout tokens

| Token / class | Definition | Usage |
|---------------|------------|-------|
| `--chat-max-width` | `52rem` | Doctor message column |
| `.chat-container` | `max-width + mx-auto + px-4 sm:px-6` | Messages, alerts, composer wrapper |
| `--radius` | `0.75rem` | Cards, inputs, rounded-xl chat shells |

### Card spacing (shadcn defaults)

| Part | Padding |
|------|---------|
| `CardHeader` | `p-6`, compact variants override to `pt-4 pb-2` |
| `CardContent` | `p-6 pt-0` |
| `CardFooter` | `p-6 pt-0`, flex row |

### Shell structures

**AiChatShell** (`packages/ui/src/components/ai-chat/shell.tsx`):

```
┌──────────────────────────── min-h-[100dvh] ────────────────────────────┐
│ [History drawer overlay — optional]                                     │
│ ┌─ header h-14 sticky ─────────────────────────────────────────────┐ │
│ ├─ main flex-1 overflow-hidden ────────────────────────────────────────┤ │
│ │   scrollable chat / hero                                              │ │
│ └─ footer sticky composer ─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

**FarmMapClient** (lg+):

```
┌─ flex-row lg:h-[calc(100dvh-10.5rem)] ─────────────────────────────────┐
│  map lg:flex-[73]          │  aside lg:flex-[27] lg:max-w-[400px]      │
│                            │  └─ overflow-y-auto panel                  │
└────────────────────────────┴────────────────────────────────────────────┘
```

**DoctorChatApp** (lg+ with cases sidebar):

```
aside hidden lg:block w-64 | chat-container flex-1
```

---

## Decision Rationale

| Decision | Rationale |
|----------|-----------|
| 52rem chat max | ~832px — readable line length; matches ChatGPT-like centered column |
| Composer `max-w-[860px]` when centered | Slightly wider than chat column for input affordances |
| Map panel `max-w-[400px]` | Prevents field list from stretching on ultrawide; keeps map primary |
| `pb-[max(1rem,env(safe-area-inset-bottom))]` | iOS home indicator clearance |
| `overscroll-contain` on panel scroll | Prevents scroll chaining to map behind panel on touch devices |

---

## Examples

### Sticky chat footer

```tsx
className="sticky bottom-0 border-t border-border/60 bg-gradient-to-t from-background via-background/95 to-transparent pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
```

### Panel scroll region

```tsx
<div className="flex-1 space-y-3 overflow-y-auto overscroll-contain pr-0.5 lg:max-h-full">
```

### Mobile map minimum height

```tsx
<div className="relative min-h-[min(50dvh,400px)] shrink-0 lg:min-h-0 lg:flex-[73]">
```

### Empty state spacing

`.nertura-empty-state`: `rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center`

---

## Best Practices

- Use `space-y-*` for vertical stacks inside cards; `gap-*` for flex/grid
- Apply `min-h-0` on flex children that need internal scroll (map layout pattern)
- Keep header at `h-14` across Doctor and drawers for rhythm alignment
- Use `shrink-0` on map column wrapper to prevent flex collapse
- Prefer `dvh` over `vh` for mobile browser chrome stability

---

## Bad Practices

- Page-level scroll for map + panel combo (breaks sticky map height)
- Inconsistent horizontal padding between header (`px-4 sm:px-6`) and custom sections
- Nested scroll containers without max-height (double scrollbars)
- Fixed `100vh` on iOS without safe-area padding
- `max-w-full` on chat bubbles that span entire ultrawide monitor

---

## Future Considerations

- Dashboard-wide layout shell component (top nav + content area) documented when unified
- CSS container queries for field card grid density
- Spacing tokens as named variables (`--space-panel`) if scale grows beyond Tailwind defaults

---

## Related Chapters

- [05 — Responsive Behavior](05-responsive-behavior.md)
- [07 — Doctor UI](07-doctor-ui.md)
- [08 — Map UI](08-map-ui.md)
