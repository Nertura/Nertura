# Chapter 07 — Doctor UI

> AiChatShell, DoctorAnswerCard, composer, and evidence panel.

---

## Purpose

This chapter documents the **AI Agriculture Doctor interface** — the primary logged-in experience at `/doctor`. Components live in `packages/ui` (presentation) and `apps/dashboard/src/components/doctor/` (orchestration).

Cross-ref: [Book 01 — AI-First & Trust](../01-product-bible/09-ai-first-and-trust-philosophy.md), [Book 04 — AI Behaviour](../04-ai-behaviour/) for answer content rules.

---

## Principles

1. **Shell + slots** — `AiChatShell` provides header/main/footer; app injects business logic.
2. **Hero when empty, thread when active** — Single page morphs; no route change.
3. **Diagnosis is structured** — `DoctorAnswerCard`, not raw markdown walls.
4. **Evidence follows answer** — `EvidenceCardsPanel` below card; optional.
5. **Feedback closes the loop** — `DoctorFeedbackButtons` POST to `/api/ai/feedback`.

---

## Architecture

### Component map

```
DoctorChatApp (dashboard)
├── AiChatShell
│   ├── DoctorHistoryDrawerWithTabs → AiChatHistoryDrawer | FieldCasesPanel
│   ├── AiChatHeader
│   ├── main
│   │   ├── FieldCasesPanel (lg sidebar)
│   │   ├── FieldContextSelector
│   │   ├── OutcomeFollowUpPanel
│   │   ├── AiChatHero + centered AiChatComposer (empty)
│   │   └── message thread (active)
│   └── AiChatComposer (sticky footer when active)
├── DoctorAnswerCard
├── EvidenceCardsPanel
├── DoctorFeedbackButtons
├── AiChatThinking
└── friendlyAiError
```

### AiChatShell

**File:** `packages/ui/src/components/ai-chat/shell.tsx`

| Export | Role |
|--------|------|
| `AiChatShell` | `min-h-[100dvh] flex-col` page wrapper |
| `AiChatHeader` | Sticky `h-14` bar: history, new chat, usage hint, trailing actions |
| `AiChatHistoryDrawer` | Left overlay `w-[min(100%,20rem)]`, conversation list |

### AiChatHero + NerturaLogo

**File:** `packages/ui/src/components/ai-chat/logo-hero.tsx`

Centered logo, headline (`text-void`), subheadline, children slot for composer and prompt chips.

### AiChatComposer

**File:** `packages/ui/src/components/ai-chat/composer.tsx`

| Feature | Behavior |
|---------|----------|
| `.chat-input-shell` | Rounded border, shadow, focus ring |
| Photo attach | Hidden file input; JPG/PNG/WebP preview strip |
| Submit | Enter sends; Shift+Enter newline; ArrowUp icon button |
| `centered` mode | No sticky footer styling; used in hero |
| `AiChatThinking` | `role="status"` loading block with spinner |
| `friendlyAiError()` | Maps API errors to farmer copy (TR/EN) |

### DoctorAnswerCard

**File:** `packages/ui/src/components/doctor-answer-card.tsx`

| Section | Default visible |
|---------|-----------------|
| Fallback warning | If `source === 'fallback'` — amber tint |
| Confidence + source badges | Yes |
| Short summary | Yes |
| Immediate action | Yes |
| Monitor hint (re-upload photo) | Yes |
| Causes, risk, treatment, prevention, expert | **Expanded only** |
| Disclaimer | Always footer |

Progressive disclosure toggle: "More details" / "Show less" with chevron.

Risk labels localized (`tr`/`en`). Uses `.chat-message-assistant` styling + `animate-slide-up`.

### EvidenceCardsPanel

**File:** `packages/ui/src/components/doctor-intelligence.tsx`

Renders grid of evidence cards from intelligence engine:

| Type | Icon | Title (TR example) |
|------|------|---------------------|
| `knowledge_bank` | 📚 | Bilgi Bankası |
| `farm_memory` | 🌾 | Çiftlik Profili |
| `image_analysis` | 📷 | Fotoğraf Analizi |
| `weather_regional` | 🌤 | Hava ve Bölgesel Risk |
| `similar_cases` | 🔍 | Benzer Vakalar |
| … | | |

Skips empty `image_analysis` summaries.

### Message types in thread

| Role | Presentation |
|------|--------------|
| User | `.chat-message-user max-w-[85%]`; optional `ChatMessageImage` |
| Assistant (diagnosis) | Full-width `DoctorAnswerCard` + evidence + feedback |
| Assistant (plain) | Bordered card `max-w-[85%]` |

---

## Decision Rationale

| Decision | Rationale |
|----------|-----------|
| Same route empty vs active | ChatGPT pattern — lower friction |
| Photo quick actions after upload | `PHOTO_QUICK_ACTIONS` chips for guided follow-up |
| Separate composer instances | Hero centered vs sticky footer — different layout classes |
| Field context in select | Grounds AI in field memory without blocking chat |
| PremiumReportsPanel when field selected | Premium feature surface — only when `selectedFieldId && hasChat` |

---

## Examples

### Shell assembly

```tsx
<AiChatShell
  historyDrawer={<DoctorHistoryDrawerWithTabs ... />}
  header={<AiChatHeader showHistory onOpenHistory={...} onNewChat={...} usageHint={...} />}
  footer={hasChat ? <AiChatComposer ... /> : null}
>
  {/* main content */}
</AiChatShell>
```

### Field greeting alert

```tsx
<Alert className="mb-4 border-emerald-500/25 bg-emerald-500/5">
  <AlertDescription className="text-sm">...</AlertDescription>
</Alert>
```

### Active case alert

```tsx
<Alert className="mb-4 border-primary/25 bg-primary/5">
  <AlertDescription>...</AlertDescription>
</Alert>
```

---

## Best Practices

- Scroll thread with `bottomRef` after new messages
- Pass `language` from diagnosis to evidence and feedback components
- Show `AiChatThinking` only while `loading` — remove on error
- Use example prompt chips as `rounded-full border` ghost buttons
- Store active conversation in `localStorage` (`nertura_dashboard_active_conversation`)

---

## Bad Practices

- Rendering full diagnosis JSON in a `<pre>` block
- Hiding disclaimer when expanded
- Multiple composers visible simultaneously
- Skipping evidence panel when cards exist in API response
- English-only error strings in Turkish session

---

## Future Considerations

- Streaming partial diagnosis into card sections
- Voice input in composer (not shipped)
- Inline citation links from evidence cards
- Split view: photo + diagnosis side-by-side on desktop

---

## Related Chapters

- [10 — History UI](10-history-ui.md)
- [11 — States: Loading, Empty, Error](11-states-loading-empty-error.md)
- [14 — Interaction Principles](14-interaction-principles.md)
