# Chapter 10 — History UI

> Conversations, field cases, and drawer patterns.

---

## Purpose

This chapter documents **history and case navigation UI** — how farmers return to past Doctor questions and ongoing field patient files.

Components: `AiChatHistoryDrawer`, `DoctorHistoryDrawerWithTabs`, `FieldCasesPanel`, `OutcomeFollowUpPanel`.

---

## Principles

1. **History is a drawer, not a page** — Overlay from left; map/Doctor context preserved.
2. **Two history concepts** — Conversations (chat log) vs field cases (clinical files).
3. **Active item highlighted** — `bg-primary/10 font-medium` on selected conversation/case.
4. **Empty states guide action** — Link to intake or plain-language placeholder.
5. **Cases have status** — Open, monitoring, resolved — with color-coded badges.

---

## Architecture

### Conversation history

**Component:** `AiChatHistoryDrawer` (`packages/ui/src/components/ai-chat/shell.tsx`)

| Element | Behavior |
|---------|----------|
| Backdrop | `fixed inset-0 bg-black/30 backdrop-blur-[2px] animate-fade-in` |
| Drawer | `w-[min(100%,20rem)]`, slides from left |
| Header | "History" title (`text-void`), close button |
| List | `HistoryItem[]` — `id`, `title`, `updated_at` |
| Loading | "Loading…" muted text |
| Empty | "Your questions will appear here." |
| Item | `line-clamp-2` title; untitled fallback |

**Dashboard wiring:** `DoctorChatApp` loads `/api/ai/conversations`, stores active ID in `localStorage` (`nertura_dashboard_active_conversation`).

**Header entry:** History icon button in `AiChatHeader`; "Field cases" ghost button opens cases tab.

### Field cases panel

**Component:** `apps/dashboard/src/components/doctor/field-cases-panel.tsx`

| Section | Content |
|---------|---------|
| Header | "Field patient files" + refresh button |
| Description | AI remembers symptoms, diagnosis, follow-up |
| Status tabs | Open · Monitoring · Resolved (`role="tablist"`) |
| Field filter | Checkbox "Only selected field" when `selectedFieldId` set |
| List | Scrollable `max-h-64` in sidebar; full height in drawer |
| Empty | `.nertura-empty-state` + link to `/intake` |

**Status badges** (from `globals.css`):

| Status | Class |
|--------|-------|
| open | `.nertura-status-open` |
| monitoring | `.nertura-status-monitoring` |
| resolved | `.nertura-status-resolved` |

**API:** `GET /api/field-cases?status=&fieldId=`

### Doctor side drawer with tabs

**Component:** `apps/dashboard/src/components/doctor/doctor-side-drawer.tsx`

| Tab | Drawer content |
|-----|----------------|
| `history` | Delegates to `AiChatHistoryDrawer` |
| `cases` | Custom aside `w-[min(100%,22rem)]` with tab switcher + `FieldCasesPanel` |

Case selection navigates: `/doctor?caseId=&fieldId=&q=` (raw intake as query).

### Desktop layout split

`DoctorChatApp` shows `FieldCasesPanel` in permanent `aside` (`hidden lg:block w-64`) — drawer used on smaller viewports via header buttons.

### Outcome follow-up (memory history)

**Component:** `OutcomeFollowUpPanel` (`packages/ui/src/components/outcome-follow-up.tsx`)

- Fetches `/api/memory/follow-ups`
- Signal-tinted panel (`border-signal/30 bg-signal/5`)
- Per-item outcome buttons: solved, improved, no change, worse
- Hidden when loading or empty

---

## Decision Rationale

| Decision | Rationale |
|----------|-----------|
| Drawer vs dedicated `/history` route | ChatGPT pattern — faster return to active thread |
| Separate cases from conversations | Cases tie to field memory; conversations are chat logs |
| lg sidebar for cases | Power users on laptop see cases while chatting |
| Tab switcher in cases drawer | Single entry point from header without two icons |
| Relative dates on cases | "Today", "Yesterday", `Nd ago` — scannable |

---

## Examples

### History list item

```tsx
<button
  className={cn(
    'w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
    activeId === item.id
      ? 'bg-primary/10 font-medium text-void'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  )}
>
  <span className="line-clamp-2">{item.title ?? 'Untitled question'}</span>
</button>
```

### Case row selection

```tsx
className={cn(
  'w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
  activeCaseId === c.id
    ? 'border-primary/40 bg-primary/5'
    : 'border-border/60 hover:border-primary/30 hover:bg-muted/30'
)}
```

### Open drawer from header

```tsx
<AiChatHeader
  showHistory
  onOpenHistory={() => openDrawer('history')}
  ...
/>
```

---

## Best Practices

- Close drawer after selecting conversation or case
- Show loading spinner in cases panel refresh button (`animate-spin`)
- Preserve scroll position in case list when filtering by field
- Use `HistoryItem` type from `@nertura/ui` for conversation lists
- Load conversation messages via `/api/ai/conversations/${id}`

---

## Bad Practices

- Full page navigation for history that loses composer draft
- Deleting history without confirmation (not implemented — don't add silently)
- Mixing conversation titles with case titles in one undifferentiated list
- Showing case status without badge color semantics
- Blocking chat while history loads

---

## Future Considerations

- Search/filter in history drawer
- Pinned conversations
- Case timeline view with diagnosis events
- Swipe-to-close drawer on mobile
- Unified "Activity" feed merging cases + conversations

---

## Related Chapters

- [07 — Doctor UI](07-doctor-ui.md)
- [09 — Farm & Field UI](09-farm-and-field-ui.md)
- [11 — States: Loading, Empty, Error](11-states-loading-empty-error.md)
