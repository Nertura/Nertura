# Chapter 12 — Accessibility & Motion

> WCAG-oriented patterns, SkipLink, ARIA, and reduced motion.

---

## Purpose

This chapter documents **accessibility and motion standards** implemented in `packages/ui` and dashboard. Nertura targets WCAG 2.1 Level AA practices for core flows (Doctor, map, forms).

---

## Principles

1. **Keyboard reachable** — All actions use native buttons/links; focus rings visible.
2. **Screen reader context** — `aria-label`, `aria-live`, `role="alert"`, `role="status"`.
3. **Skip navigation** — Skip to main content link on every dashboard page.
4. **Motion supports, never distracts** — Short fade/slide; respect reduced motion preference (future hardening).
5. **Touch targets** — Minimum ~40px for primary controls (buttons h-9/h-10).

---

## Architecture

### SkipLink

**File:** `packages/ui/src/components/skip-link.tsx`

```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 ...">
  Skip to main content
</a>
```

Rendered in `apps/dashboard/src/app/layout.tsx` inside providers.

**Requirement:** Main content landmarks must expose `id="main-content"` on primary `<main>` elements.

### Focus visibility

Button/Input focus:

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

Skip link uses `focus:ring-2 focus:ring-ring`.

### ARIA patterns in production

| Component | ARIA |
|-----------|------|
| `Alert` | `role="alert"` |
| `AiChatThinking` | `role="status"`, `aria-live="polite"` |
| `MapView` container | `role="application"`, `aria-label` from labels |
| Map zoom/geo buttons | `aria-label` per action (localized) |
| History drawer | `aria-label="Conversation history"` |
| Field cases tabs | `role="tablist"`, tabs `aria-selected` |
| Icon buttons | `aria-label` required (Upload, Send, History, Close) |
| `CompactStepBar` | `role="list"`, items `role="listitem"`, `aria-label` on container |
| Decorative icons | `aria-hidden` on MapPin, ClipboardList, etc. |

### Screen reader utilities

**File:** `packages/ui/src/styles/globals.css`

```css
.sr-only { /* visually hidden, available to SR */ }
.focus:not-sr-only:focus { /* skip link reveal */ }
```

### Motion system

**Tailwind config** (`packages/ui/tailwind.config.ts`):

| Animation | Duration | Easing |
|-----------|----------|--------|
| `fade-in` | 0.35s | ease-out |
| `slide-up` | 0.4s | cubic-bezier(0.16, 1, 0.3, 1) |

**CSS duplicates** in globals for utility classes.

**Usage:**

- New chat messages: `animate-slide-up`
- Drawers/backdrops: `animate-fade-in`
- Success pulse: `.animate-success-pulse` on primary ring (keyframes in globals)

### Color contrast

Semantic tokens designed for light/dark:

- Body: `bg-background text-foreground`
- Muted secondary: `text-muted-foreground` on `background` / `card`
- Primary CTA: `primary` + `primary-foreground`
- Destructive: dedicated foreground pair

Test void wordmark on light backgrounds and card surfaces in both themes.

---

## Decision Rationale

| Decision | Rationale |
|----------|-----------|
| Skip link over complex landmark nav | MVP accessibility win for keyboard users |
| aria-live polite for thinking | Avoid aggressive interrupt while loading |
| Map as application role | Mapbox canvas not fully SR-navigable — label documents purpose |
| Native select for field context | Better SR support than unlabeled custom dropdown |
| focus-visible not focus | Avoid mouse focus rings on click |

---

## Examples

### Accessible icon button

```tsx
<Button type="button" variant="ghost" size="icon" aria-label="Close history" onClick={onClose}>
  <X className="h-5 w-5" />
</Button>
```

### Geolocation control

```tsx
<Button aria-label={L.myLocation} onClick={handleGeolocation} disabled={geoLoading}>
  {geoLoading ? <Loader2 className="animate-spin" /> : <LocateFixed />}
</Button>
```

### Case status tablist

```tsx
<div role="tablist" aria-label="Case status">
  <button role="tab" aria-selected={statusTab === tab.id} ...>
```

---

## Best Practices

- Every icon-only control gets `aria-label` (English label acceptable; localize when copy system exists)
- Use semantic headings in cards (`CardTitle` → `h3`)
- Prefer native form controls for selects and checkboxes
- Test tab order in Doctor: header → field select → messages → composer
- Verify contrast when using opacity tints (`bg-primary/10`)

---

## Bad Practices

- `div` with `onClick` and no keyboard handler
- Removing focus outlines without ring replacement
- Autoplay animations on loop
- Color-only status (case badges include text labels — good)
- Placeholder-only labels without `<Label htmlFor>`

---

## Future Considerations

- `@media (prefers-reduced-motion: reduce)` wrapper disabling slide-up/fade-in
- Full map keyboard alternative (coordinate list view)
- Automated axe/pa11y in CI ([Book 03](../03-engineering-standards/))
- Turkish aria-label localization pass
- High contrast theme token set

---

## Related Chapters

- [06 — Components Foundation](06-components-foundation.md)
- [13 — Dark & Light Mode](13-dark-and-light-mode.md)
- [14 — Interaction Principles](14-interaction-principles.md)
