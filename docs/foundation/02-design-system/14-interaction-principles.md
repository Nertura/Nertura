# Chapter 14 — Interaction Principles

> ChatGPT simplicity, progressive disclosure, and one action per view.

---

## Purpose

This chapter defines **how users interact with Nertura** — motion between states, disclosure of complexity, and conversational flow patterns. It complements [Design Principles](01-design-principles.md) with actionable interaction rules grounded in shipped Doctor, map, and history UI.

Cross-ref: [Book 01 — Product Principles](../01-product-bible/07-product-principles.md), [First 30 Seconds](../01-product-bible/10-first-30-seconds.md).

---

## Principles

### 1. ChatGPT simplicity

- **One primary input** — Composer is the hero; everything else supports it.
- **Thread replaces dashboard** — After first message, UI is messages + sticky composer.
- **Suggested prompts reduce blank-page anxiety** — Example chips on empty Doctor (`DOCTOR_EXAMPLE_PROMPTS`).
- **Enter to send, Shift+Enter for newline** — Standard chat convention in `AiChatComposer`.

### 2. Progressive disclosure

- **Diagnosis summary first** — `DoctorAnswerCard` collapsed by default except action-critical sections.
- **Evidence after answer** — Secondary grid; skipped if empty.
- **Feedback after evidence** — Tertiary; does not block reading.
- **Map create flow in steps** — locate → draw → confirm via `CompactStepBar`; panel scroll reveals details.

### 3. One focal action per view

| View | Focal action |
|------|--------------|
| Doctor (empty) | Type or upload in composer |
| Doctor (active) | Continue conversation |
| Map (idle) | Select field or start create |
| Map (draw) | Tap map to add vertices |
| Map (confirm) | Save field |

Secondary actions use `outline` or `ghost` variants — never competing primary buttons.

### 4. Context without configuration

- Field context via simple select — optional, not blocking.
- URL params bootstrap intake (`q`, `fieldId`, `caseId`) — deep links feel magical, not form-heavy.
- Active case banner explains linkage inline — no settings page required.

### 5. Forgiving interactions

- Photo preview with clear remove before send.
- Retry on upload failures when `uploadRetryable`.
- Geo permission errors as info, with plain-language fix hint.
- Undo/redo on map draw (`Undo2`, `RotateCcw` icons in farm map toolbar).

---

## Architecture

### Doctor interaction flow

```
Land (empty hero)
  → type / upload / tap example chip
  → submit
  → AiChatThinking
  → DoctorAnswerCard (+ evidence + feedback)
  → optional photo quick actions
  → composer ready for follow-up
```

Parallel paths:

- Open history drawer → select conversation → thread hydrates
- Open field cases → select case → navigates with query prefilled
- Change field context → affects subsequent API calls, not visible thread rewrite

### Map interaction flow

```
View fields on map
  → select field card (highlight)
  → optional: edit boundary / view details
  → OR start create: locate (search/GPS)
  → draw vertices on map
  → confirm metadata → save
  → success message → return idle
```

Map interactions use **direct manipulation** (click map, drag pan) plus **panel forms** for metadata — not modal wizards.

### Disclosure layers (Doctor answer)

| Layer | User action to reveal |
|-------|----------------------|
| L0 | Always — summary, today action, monitor hint |
| L1 | Tap "More details" — causes, risk, full treatment |
| L2 | Scroll — evidence cards |
| L3 | Optional — feedback buttons, outcome follow-up panel |

### Keyboard and composer

| Key | Action |
|-----|--------|
| Enter | Submit (composer) |
| Shift+Enter | New line |
| Tab | Move focus through header, select, composer |

---

## Decision Rationale

| Decision | Rationale |
|----------|-----------|
| No modal for diagnosis | Keeps farmer in conversational mental model |
| Photo quick actions after upload | Guides non-expert users to structured follow-ups |
| Drawer for history not route | Preserves scroll and draft in composer |
| Step bar not wizard pages | Map stays visible throughout create flow |
| Example prompts as chips not carousel | Simpler tap target; no hidden content |

---

## Examples

### Progressive disclosure toggle

```tsx
<button onClick={() => setExpanded((v) => !v)} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
  {expanded ? labels.less : labels.more}
</button>
```

### Example prompt chip

```tsx
<button
  type="button"
  onClick={() => setQuery(prompt)}
  className="rounded-full border border-border/80 bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
>
  {prompt}
</button>
```

### Photo quick actions (post-upload)

Outline `rounded-full` small buttons submit guided questions via `PHOTO_QUICK_ACTIONS`.

### Case selection deep link

```tsx
router.push(`/doctor?caseId=${id}&fieldId=${fieldId}&q=${rawIntake}`);
```

---

## Best Practices

- Preserve composer draft when opening/closing history drawer
- Auto-scroll to bottom on new messages (`bottomRef`)
- Disable composer when `limitReached` — show credit Alert with link
- Show field greeting once when context established — not on every message
- Use `sessionStorage` / `localStorage` for cross-route hydration sparingly and with cleanup

---

## Bad Practices

- Multi-step modal onboarding before first Doctor question
- Forcing account setup before showing composer (violates First 30 Seconds)
- Accordion within accordion in diagnosis (card already has disclosure)
- Auto-opening history drawer on load
- Submit on every Enter in multi-line forms outside composer

---

## Future Considerations

- Streaming text interaction (partial reveal animation)
- Voice input hold-to-talk
- Gesture: swipe from left edge for history on mobile
- Inline editable field metadata on map confirm
- Command palette (⌘K) for power users — not in MVP

---

## Related Chapters

- [01 — Design Principles](01-design-principles.md)
- [07 — Doctor UI](07-doctor-ui.md)
- [10 — History UI](10-history-ui.md)
- [14 — Interaction Principles](14-interaction-principles.md) *(this chapter)*

---

## Book completion

This is the final chapter of Book 02. Return to [README](README.md) or proceed to [Book 03 — Engineering Standards](../03-engineering-standards/) for implementation law.
