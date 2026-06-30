# Chapter 03 — Typography

> Inter, semantic scale, chat copy, and tabular numbers.

---

## Purpose

This chapter defines **typefaces, size scale, and copy formatting** used across Nertura. Typography carries trust (Stripe-like clarity) and readability for farmers outdoors on mobile screens.

Source: `packages/ui/tailwind.config.ts`, `apps/dashboard/src/app/layout.tsx`, component-level Tailwind classes.

---

## Principles

1. **One sans family** — Inter via `--font-inter`; system-ui fallback.
2. **Hierarchy through weight and size, not font switching** — No decorative display fonts in product UI.
3. **15–16px body in chat** — Slightly larger than default `text-sm` for diagnosis readability.
4. **Uppercase labels sparingly** — Section titles in cards use `text-xs font-semibold uppercase tracking-wide text-muted-foreground`.
5. **Tabular numbers for metrics** — Area, confidence %, usage counts use `tabular-nums`.

---

## Architecture

### Font stack

```ts
// tailwind.config.ts
fontFamily: {
  sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
}
```

```tsx
// apps/dashboard/src/app/layout.tsx
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
// body: `${inter.variable} min-h-screen font-sans antialiased`
```

### Type scale (production usage)

| Role | Classes | Example location |
|------|---------|------------------|
| Hero headline | `text-3xl sm:text-4xl font-semibold tracking-tight text-void` | `AiChatHero` h1 |
| Hero subhead | `text-base sm:text-lg text-muted-foreground` | `AiChatHero` p |
| Card title | `text-2xl font-semibold` (default) or `text-base` (compact) | `CardTitle`, farm map farm card |
| Section label | `text-xs font-semibold uppercase tracking-wide text-muted-foreground` | `DoctorAnswerCard` sections |
| Body / chat | `text-[15px] leading-relaxed` or `text-sm` | `.chat-message-*`, assistant bubbles |
| Composer input | `text-base sm:text-[16px]` | `AiChatComposer` textarea (16px prevents iOS zoom) |
| Micro copy | `text-[10px]` – `text-xs` | Step bar, field card metadata, usage hints |
| Button | `text-sm font-medium` | `buttonVariants` default |

### Line height and tracking

- Headlines: `tracking-tight`, often `text-balance` / `text-pretty` on hero
- Body: `leading-relaxed` in chat and diagnosis content
- Legal/disclaimer: `text-xs italic text-muted-foreground`

---

## Decision Rationale

| Decision | Rationale |
|----------|-----------|
| Inter | Neutral, highly legible, excellent Turkish Latin support, Next.js `next/font` optimization |
| 16px minimum in composer on sm+ | Prevents iOS Safari auto-zoom on focus |
| 15px diagnosis body | Between `text-sm` (14px) and `text-base` (16px) — dense but readable for long treatment text |
| Uppercase section labels | Scannable structure in `DoctorAnswerCard` without heavy borders |
| Wordmark `text-void` | Brand anchor color from [Color System](02-color-system.md) |

---

## Examples

### Doctor answer section

```tsx
<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
<p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">{children}</p>
```

### Field card metadata

```tsx
<dl className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
```

### Area overlay on map

```tsx
<p className="text-base font-semibold tabular-nums text-foreground sm:text-lg">
  {areaTriple.m2.toLocaleString()} m²
</p>
```

### Confidence badge

```tsx
<span className="rounded-full bg-muted px-2 py-0.5 font-medium tabular-nums">
  {labels.confidence}: {pct}%
</span>
```

---

## Best Practices

- Use `font-sans` explicitly only when overriding a monospace context; default body inherits from layout
- Apply `whitespace-pre-wrap` for AI-generated multi-paragraph text
- Use `line-clamp-2` for history list titles and case previews
- Keep button labels short; use `hidden sm:inline` for secondary words ("New" in header)
- Localize strings in components; do not hardcode typography per locale

---

## Bad Practices

- Mixing multiple Google Fonts in dashboard
- `text-[10px]` for primary actionable copy (too small for touch targets context)
- All-caps body paragraphs
- Fixed pixel widths on text containers that break Turkish compound words
- Using bold for entire diagnosis blocks instead of section labels

---

## Future Considerations

- `font-feature-settings` for numeric alignment in financial/marketplace modules (not in current Doctor/Map MVP)
- Dynamic type scaling tied to user preference (accessibility)
- RTL typography rules if Arabic markets launch
- Shared typography tokens export for marketing site parity

---

## Related Chapters

- [04 — Spacing & Layout](04-spacing-and-layout.md)
- [07 — Doctor UI](07-doctor-ui.md)
- [12 — Accessibility & Motion](12-accessibility-and-motion.md)
