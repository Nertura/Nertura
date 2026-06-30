# Chapter 02 — Color System

> void `#0B1220`, signal `#2DDAAF`, and shadcn HSL semantic tokens.

---

## Purpose

This chapter documents **every color token used in production UI** — brand anchors, semantic shadcn variables, and when to use each. All values trace to `packages/ui/tailwind.config.ts` and `packages/ui/src/styles/globals.css`.

Do not introduce new hex values in feature code without updating this chapter and the token files.

---

## Principles

1. **Semantic first** — Use `bg-primary`, `text-muted-foreground`, `border-border` in components; not raw hex.
2. **Brand anchors for identity** — `void` and `signal` for logo, wordmark, and accent moments only.
3. **HSL variables for theming** — Light/dark modes swap `:root` and `.dark` CSS variables; Tailwind reads `hsl(var(--token))`.
4. **Destructive is rare** — Red (`destructive`) for errors and failures; amber/info for recoverable states.
5. **Signal = intelligence accent** — Outcome follow-ups, success alerts, feedback hover — not primary CTA fill (that is `primary`).

---

## Architecture

### Brand tokens (fixed hex)

Defined in `packages/ui/tailwind.config.ts`:

| Token | Hex | Tailwind class | Role |
|-------|-----|----------------|------|
| **void** | `#0B1220` | `text-void`, `bg-void` | Wordmark, history drawer title, high-contrast headings |
| **void-foreground** | `#F8FAFC` | `text-void-foreground` | Text on void backgrounds |
| **signal** | `#2DDAAF` | `text-signal`, `bg-signal`, `border-signal` | Logo gradient end, success alert border, follow-up panel tint |
| **signal-foreground** | `#0B1220` | `text-signal-foreground` | Text on signal backgrounds |

### Semantic tokens (HSL CSS variables)

Defined in `packages/ui/src/styles/globals.css`, consumed via Tailwind in `tailwind.config.ts`:

| Tailwind key | CSS variable | Light (`:root`) | Dark (`.dark`) |
|--------------|--------------|-----------------|----------------|
| `background` | `--background` | `0 0% 100%` | `222 47% 6%` |
| `foreground` | `--foreground` | `222 47% 8%` | `210 40% 98%` |
| `card` | `--card` | `0 0% 100%` | `222 47% 9%` |
| `card-foreground` | `--card-foreground` | `222 47% 8%` | `210 40% 98%` |
| `primary` | `--primary` | `162 69% 45%` | `162 69% 52%` |
| `primary-foreground` | `--primary-foreground` | `0 0% 100%` | `222 47% 8%` |
| `secondary` | `--secondary` | `210 40% 97%` | `217 33% 14%` |
| `secondary-foreground` | `--secondary-foreground` | `222 47% 8%` | `210 40% 98%` |
| `muted` | `--muted` | `210 40% 96%` | `217 33% 14%` |
| `muted-foreground` | `--muted-foreground` | `215 16% 42%` | `215 20% 62%` |
| `accent` | `--accent` | `162 69% 45%` | `162 69% 52%` |
| `accent-foreground` | `--accent-foreground` | `0 0% 100%` | `222 47% 8%` |
| `destructive` | `--destructive` | `0 72% 51%` | `0 62% 50%` |
| `destructive-foreground` | `--destructive-foreground` | `0 0% 98%` | `0 0% 98%` |
| `border` | `--border` | `214 32% 91%` | `217 33% 16%` |
| `input` | `--input` | `214 32% 91%` | `217 33% 16%` |
| `ring` | `--ring` | `162 69% 45%` | `162 69% 52%` |

### Radius token

| Variable | Value | Usage |
|----------|-------|-------|
| `--radius` | `0.75rem` | `rounded-lg`, `rounded-md`, `rounded-sm` via Tailwind |

### Chat layout token

| Variable | Value | Usage |
|----------|-------|-------|
| `--chat-max-width` | `52rem` | `.chat-container` max width |

---

## Decision Rationale

| Decision | Rationale |
|----------|-----------|
| shadcn HSL pattern | Industry-standard dark mode swapping; one source in CSS, many consumers in Tailwind |
| `primary` hue 162 (teal-green) | Aligns with agriculture / growth without using signal hex as button fill |
| Fixed `void`/`signal` hex | Logo and wordmark need pixel-stable brand colors independent of theme math |
| `Alert` success variant uses signal | Distinguishes positive guidance from neutral default alerts |
| Map unconfigured placeholder uses emerald gradient | Map-specific fallback in `MapView` — not a global token; intentional exception for map context |

---

## Examples

### Logo mark gradient

`NerturaLogo` in `packages/ui/src/components/ai-chat/logo-hero.tsx`:

```tsx
className="bg-gradient-to-br from-signal to-emerald-600 ... shadow-signal/25"
```

### User message bubble

`.chat-message-user` in `globals.css`:

```css
@apply rounded-2xl bg-primary/10 px-4 py-3 text-[15px] leading-relaxed text-foreground;
```

### Field case status badges

| Class | Meaning |
|-------|---------|
| `.nertura-status-open` | Sky tint — active case |
| `.nertura-status-monitoring` | Amber tint — watch state |
| `.nertura-status-resolved` | Emerald tint — closed case |

### Geolocation info card (non-destructive)

`MapView` with `geoErrorVariant="info"` uses `border-border/80 bg-background/95 text-muted-foreground` — permission denied is informational, not a system failure.

---

## Best Practices

- Import colors only through Tailwind classes or CSS variables
- Use opacity modifiers (`bg-primary/10`, `border-emerald-500/25`) for tinted surfaces
- Test both `:root` and `.dark` when adding new surfaces
- Use `text-void` for hero headlines on light backgrounds; switches appropriately in dark via component context
- Document any new CSS variable in `globals.css` **and** `tailwind.config.ts`

---

## Bad Practices

- Hardcoding `#2DDAAF` in dashboard components when `signal` or `primary` tokens exist
- Using `destructive` for geolocation permission hints (use info styling)
- Applying signal gradient to arbitrary buttons — dilutes brand
- Adding Tailwind color keys without HSL variable backing (breaks dark mode)
- Referencing legacy Forest/Canopy hex from `docs/design-system.md` in new code — superseded by shipped tokens above

---

## Future Considerations

- Migrate legacy brand doc palette (`#2D6A4F` Forest) to optional extended tokens if marketing and product unify
- CSS `color-mix()` for automatic contrast on custom surfaces
- High-contrast accessibility theme (separate from light/dark)
- Figma token sync pipeline ([Book 03](../03-engineering-standards/))

---

## Related Chapters

- [13 — Dark & Light Mode](13-dark-and-light-mode.md)
- [06 — Components Foundation](06-components-foundation.md) (Alert variants)
- [11 — States: Loading, Empty, Error](11-states-loading-empty-error.md)
