# Chapter 06 — Components Foundation

> Button, Card, Input, Alert — and CVA patterns from `packages/ui`.

---

## Purpose

This chapter documents the **shared primitive components** exported from `@nertura/ui`. All feature code should compose these before creating one-off styled elements.

Source: `packages/ui/src/components/`, exported via `packages/ui/src/index.ts`.

---

## Principles

1. **CVA for variants** — `class-variance-authority` defines visual variants; `cn()` merges safely.
2. **forwardRef everywhere** — Primitives support ref forwarding for forms and focus management.
3. **Semantic HTML** — Buttons are `<button>`, alerts use `role="alert"`.
4. **Token-only colors** — Variants reference `primary`, `destructive`, `signal` — not hex.
5. **Extend via className** — Callers add layout classes; rarely fork component source.

---

## Architecture

### Utility: `cn()`

`packages/ui/src/lib/utils.ts` — combines `clsx` + `tailwind-merge` to prevent conflicting Tailwind classes.

### Button

**File:** `packages/ui/src/components/button.tsx`

| Variant | Classes (summary) |
|---------|-------------------|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/90` |
| `secondary` | `bg-secondary text-secondary-foreground` |
| `outline` | `border border-input bg-background hover:bg-accent` |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` |
| `link` | `text-primary underline-offset-4 hover:underline` |

| Size | Height / padding |
|------|------------------|
| `default` | `h-10 px-4 py-2` |
| `sm` | `h-9 px-3` |
| `lg` | `h-11 px-8` |
| `icon` | `h-10 w-10` |

**Exports:** `Button`, `buttonVariants`, `ButtonProps`

Focus ring: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`

SVG icons: `[&_svg]:size-4` standardized inside button.

### Card

**File:** `packages/ui/src/components/card.tsx`

Compound component:

| Export | Default classes |
|--------|-----------------|
| `Card` | `rounded-lg border bg-card text-card-foreground shadow-sm` |
| `CardHeader` | `flex flex-col space-y-1.5 p-6` |
| `CardTitle` | `text-2xl font-semibold leading-none tracking-tight` |
| `CardDescription` | `text-sm text-muted-foreground` |
| `CardContent` | `p-6 pt-0` |
| `CardFooter` | `flex items-center p-6 pt-0` |

### Input

**File:** `packages/ui/src/components/input.tsx`

Single `<input>` wrapper:

```
h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
disabled:cursor-not-allowed disabled:opacity-50
placeholder:text-muted-foreground
```

### Alert

**File:** `packages/ui/src/components/alert.tsx`

CVA variants:

| Variant | Usage |
|---------|-------|
| `default` | Neutral info (`bg-background`) |
| `destructive` | Errors — red border/text |
| `success` | Positive guidance — `border-signal/30 bg-signal/5 text-void` |

Subcomponents: `AlertTitle`, `AlertDescription` (`role="alert"` on root).

### Label

**File:** `packages/ui/src/components/label.tsx`

Form labels paired with `Input` and native selects in dashboard.

---

## Decision Rationale

| Decision | Rationale |
|----------|-----------|
| shadcn-style primitives | Familiar to React ecosystem; easy to extend |
| Export `buttonVariants` | Allows `Link` styled as button in dashboard |
| Alert `success` uses signal | Distinct from primary without new token |
| CardTitle as `h3` | Flexible heading level inside sections |
| No separate Textarea component | Composer uses styled native textarea (domain-specific) |

---

## Examples

### Link as button

```tsx
import { buttonVariants, cn } from '@nertura/ui';

<Link href="/intake" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
  Start intake
</Link>
```

### Destructive error alert

```tsx
<Alert variant="destructive">
  <AlertDescription>{friendlyAiError(rawError, 'tr')}</AlertDescription>
</Alert>
```

### Compact farm card header

```tsx
<Card>
  <CardHeader className="space-y-1 pb-2 pt-4">
    <CardTitle className="text-base">{farmName}</CardTitle>
  </CardHeader>
  <CardContent className="space-y-2 pb-4">...</CardContent>
</Card>
```

### Icon button with aria-label

```tsx
<Button type="button" variant="ghost" size="icon" aria-label="Upload photo">
  <ImagePlus className="h-5 w-5" />
</Button>
```

---

## Best Practices

- Import from `@nertura/ui` barrel — not deep paths in apps
- Pass `type="button"` on non-submit buttons inside forms
- Use `variant="outline"` for secondary actions; one `default` primary per card
- Combine `disabled={loading}` with `Loader2 animate-spin` icon pattern
- Add new variants in CVA config, not inline in apps

---

## Bad Practices

- Copy-pasting button class strings into dashboard components
- Using `<div onClick>` instead of `Button`
- Nesting interactive buttons inside buttons
- Alert without `AlertDescription` for long text ( hurts spacing)
- Creating `packages/ui` components with app-specific API imports

---

## Future Considerations

- Shared `Textarea` primitive if used outside composer
- `Button` loading prop built-in
- Storybook or Ladle catalog ([Book 03](../03-engineering-standards/))
- Badge, Separator, Dialog shadcn additions as needed

---

## Related Chapters

- [02 — Color System](02-color-system.md)
- [07 — Doctor UI](07-doctor-ui.md)
- [11 — States: Loading, Empty, Error](11-states-loading-empty-error.md)
