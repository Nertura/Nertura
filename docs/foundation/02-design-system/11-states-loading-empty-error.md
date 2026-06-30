# Chapter 11 — States: Loading, Empty, Error

> Friendly errors, info vs destructive alerts, and empty state patterns.

---

## Purpose

This chapter defines **how Nertura communicates non-happy paths** — loading spinners, empty lists, and errors — without breaking farmer trust or exposing internals.

Key utilities: `friendlyAiError()`, `AiChatThinking`, `.nertura-empty-state`, `Alert` variants, `MapView` status overlays.

---

## Principles

1. **Never expose internals** — No stack traces, provider names, or HTTP codes in user copy.
2. **Info vs destructive** — Permission denied and geo hints are informational; save failures and AI errors are destructive or actionable.
3. **Always offer a next step** — Retry button, link to intake, link to account/credits.
4. **Loading is honest** — Named states ("Checking Knowledge Bank…") not generic "Loading".
5. **Empty is inviting** — Dashed border, short explanation, single CTA.

---

## Architecture

### Alert variants

From `packages/ui/src/components/alert.tsx`:

| Variant | When to use |
|---------|-------------|
| `default` | Neutral info — credit limits, general notices |
| `destructive` | Failed operations, validation errors, map load failure overlay |
| `success` | Positive confirmation (signal tint) — rare in alerts; follow-up uses custom panel |

**Tinted info alerts (dashboard pattern):**

```tsx
// Field saved / monitoring
border-emerald-500/25 bg-emerald-500/5

// Active case context
border-primary/25 bg-primary/5
```

These use default Alert variant with custom border classes.

### friendlyAiError()

**File:** `packages/ui/src/components/ai-chat/composer.tsx`

Maps raw API strings to TR/EN farmer copy:

| Trigger | User message (concept) |
|---------|------------------------|
| Empty | Generic retry |
| 429 / demand | AI busy — wait |
| 503 / unavailable | Service unreachable |
| Image MIME / magic bytes | JPG, PNG, WebP only |
| 5 MB / too large | Photo size limit |
| Invalid image / base64 | Could not read photo |
| Gemini / API key | Temporary AI limitation |
| limit / credit / account | Pass through (billing-related) |

### Loading patterns

| Component | Pattern |
|-----------|---------|
| `AiChatThinking` | Bordered card, spinner, title + detail, `aria-live="polite"` |
| `MapView` loading | Full overlay, `Loader2` + localized "Loading map…" |
| `FieldCasesPanel` | Inline "Loading cases…" with small spinner |
| Button submit | `Loader2 animate-spin` inside icon button |
| History drawer | Plain "Loading…" text |

### Empty patterns

**Class:** `.nertura-empty-state`

```
rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center
```

**Usages:**

| Location | Message + CTA |
|----------|---------------|
| Field cases | "No {status} cases" + Start intake → |
| History drawer | "Your questions will appear here." |
| Map field list | Dashed inline box — no fields yet |
| Map unconfigured | Gradient placeholder in MapView |

### Error + retry (Doctor)

```tsx
<Alert variant="destructive">
  <AlertDescription className="flex flex-wrap items-center gap-2">
    <span>{error}</span>
    {uploadRetryable && <Button size="sm" variant="outline">Retry</Button>}
  </AlertDescription>
</Alert>
```

Credit limit uses non-destructive Alert + link to `/account`.

### Map errors

| State | Styling |
|-------|---------|
| Load failed | `bg-destructive/10 text-destructive` overlay |
| Unconfigured token | Emerald gradient info placeholder |
| Geo permission | Info banner bottom-left (see ch. 08) |
| Boundary save | `Alert destructive` + `FRIENDLY_BOUNDARY_SAVE_ERROR` copy |

---

## Decision Rationale

| Decision | Rationale |
|----------|-----------|
| Centralized friendlyAiError | One mapping table; consistent TR/EN |
| Pass-through limit/credit errors | User needs exact billing message |
| Geo as info | Red error implies app broken; permission is user-controlled |
| Retry only when uploadRetryable | Avoid infinite retry loops on non-transient errors |
| Null OutcomeFollowUpPanel when empty | No noise when no follow-ups pending |

---

## Examples

### Thinking state

```tsx
<AiChatThinking
  label="Nertura Tarım Doktoru düşünüyor…"
  detail="Bilgi Bankası, çiftlik bağlamı ve bölgesel veriler kontrol ediliyor…"
/>
```

### Image validation (client-side)

From dashboard before upload:

```
'Sadece JPG, PNG ve WebP desteklenir.'
'Görsel 5MB altında olmalı.'
```

### Field cases empty

```tsx
<div className="nertura-empty-state mx-1 my-2 py-6">
  <p className="text-sm font-medium text-foreground">No open cases</p>
  <p className="mt-1 text-xs text-muted-foreground">Describe a field problem to start a patient file.</p>
  <Link href="/intake" className="mt-3 inline-block text-xs font-medium text-primary hover:underline">
    Start intake →
  </Link>
</div>
```

### Fallback diagnosis warning

`DoctorAnswerCard` when `source === 'fallback'`:

- Amber border/background tint
- Banner: "General guidance — retry for a tailored answer."

---

## Best Practices

- Run errors through `friendlyAiError()` before `setError()`
- Set `uploadRetryable` when retry can reuse `lastRequestRef`
- Use `role="status"` and `aria-live="polite"` for loading regions
- Localize map and farm copy via `getFarmMapCopy(locale)`
- Clear success/info messages after timeout when appropriate

---

## Bad Practices

- `{JSON.stringify(error)}` in UI
- Destructive alert for "no cases yet" empty state
- Infinite loading with no timeout message
- Generic "Error" without action
- Showing Mapbox token values in error messages

---

## Future Considerations

- Toast system for transient success (currently inline alerts)
- Offline banner pattern (specified in wireframes, not in dashboard MVP)
- Error telemetry id for support ("Reference: ABC-123") without exposing internals
- Skeleton loaders instead of spinners for long lists

---

## Related Chapters

- [06 — Components Foundation](06-components-foundation.md)
- [07 — Doctor UI](07-doctor-ui.md)
- [08 — Map UI](08-map-ui.md)
