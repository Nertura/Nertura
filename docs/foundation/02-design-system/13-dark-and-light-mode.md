# Chapter 13 — Dark & Light Mode

> `darkMode: ['class']` strategy, ThemeProvider, and token behavior.

---

## Purpose

This chapter documents **how Nertura switches between light and dark themes** — class-based toggling on `document.documentElement`, CSS variable swapping, and component considerations.

Code: `packages/ui/tailwind.config.ts`, `packages/ui/src/styles/globals.css`, `packages/ui/src/components/theme-provider.tsx`, `theme-toggle.tsx`.

---

## Principles

1. **Class strategy, not media-only** — User choice overrides system; system is default.
2. **CSS variables swap** — Components rarely branch on theme in JS; tokens adapt automatically.
3. **void/signal hex unchanged** — Brand anchors constant; semantic surfaces change.
4. **No flash on load** — `suppressHydrationWarning` on `<html>`; provider reads localStorage in effect.
5. **Toggle is optional chrome** — `ThemeToggle` in header areas; not forced on every screen.

---

## Architecture

### Tailwind configuration

```ts
// packages/ui/tailwind.config.ts
darkMode: ['class'],
```

Dark variants apply when ancestor has `.dark` class — typically `<html class="dark">`.

### CSS variable layers

**File:** `packages/ui/src/styles/globals.css`

| Scope | Variables defined |
|-------|-------------------|
| `:root` | Light theme HSL values |
| `.dark` | Dark theme HSL overrides |

Shared across themes:

- `--radius: 0.75rem`
- `--chat-max-width: 52rem`

Body defaults:

```css
body {
  @apply bg-background text-foreground antialiased;
}
```

### ThemeProvider

**File:** `packages/ui/src/components/theme-provider.tsx`

| Concept | Behavior |
|---------|----------|
| Storage key | `nertura-theme` |
| Modes | `light` \| `dark` \| `system` |
| Default | `system` |
| Resolution | `system` → `prefers-color-scheme` media query |
| Apply | `document.documentElement.classList.toggle('dark', resolved === 'dark')` |
| Listener | Updates when OS theme changes if mode is `system` |

**Exports:** `ThemeProvider`, `useTheme()` → `{ theme, resolvedTheme, setTheme }`

### ThemeToggle

**File:** `packages/ui/src/components/theme-toggle.tsx`

- Ghost button toggles light ↔ dark (not three-way system UI)
- `aria-label`: "Switch to light/dark mode"
- Icons: Sun (when dark), Moon (when light)

### Dashboard integration

```tsx
// apps/dashboard/src/app/layout.tsx
<html lang="tr" suppressHydrationWarning>
```

Providers wrap children in `DashboardProviders` (includes `ThemeProvider`).

### Component-specific dark styles

Some utilities use explicit dark variants:

```css
.nertura-status-open {
  @apply ... dark:bg-sky-950 dark:text-sky-200;
}
```

Status badges and amber fallback diagnosis tints include dark: pairs.

### Map unconfigured placeholder

Uses fixed emerald gradient (`from-emerald-950/90`) — readable in both themes; not token-driven.

---

## Decision Rationale

| Decision | Rationale |
|----------|-----------|
| shadcn class darkMode | De facto standard; works with Tailwind dark: prefix |
| system default | Respects OS preference for new users |
| localStorage persistence | Returning users keep choice |
| Toggle binary light/dark | Simpler than exposing system/light/dark menu in MVP |
| HSL tokens | Single variable flip vs duplicating component classes |

---

## Examples

### Using dark: prefix

```tsx
<p className="text-amber-700 dark:text-amber-400">{copy.areaMismatch(...)}</p>
```

### Checking resolved theme (JS)

```tsx
const { resolvedTheme, setTheme } = useTheme();
setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
```

### Semantic surface (automatic)

```tsx
<Card className="bg-card text-card-foreground"> {/* adapts via CSS vars */}</Card>
```

### Chat gradients in footer

```tsx
bg-gradient-to-t from-background via-background/95 to-transparent
```

Uses semantic background — works in both modes.

---

## Best Practices

- Prefer semantic tokens (`bg-muted`, `border-border`) over `bg-white dark:bg-gray-900`
- Test new components in both themes before shipping
- Use opacity modifiers on semantic colors for tints
- Include `dark:` when using Tailwind palette colors (amber, emerald, sky)
- Keep `suppressHydrationWarning` on html when using client theme

---

## Bad Practices

- Hardcoding `#fff` / `#000` backgrounds
- Reading theme in every component instead of CSS variables
- Flash of wrong theme before hydration without documented tradeoff
- Separate duplicate components for light/dark
- Forgetting dark: on status badge utility classes

---

## Future Considerations

- Three-way toggle UI (system / light / dark) in account settings
- `color-scheme` CSS property on html for native scrollbars
- Theme sync across subdomains
- Server-rendered initial theme cookie to eliminate flash
- Per-route forced theme (e.g. print-friendly light)

---

## Related Chapters

- [02 — Color System](02-color-system.md)
- [12 — Accessibility & Motion](12-accessibility-and-motion.md)
