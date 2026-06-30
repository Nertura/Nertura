# Nertura — AI Assistant Screens

> Complete UX specification for the Nertura AI Assistant across panel, full-page, and mobile contexts. Notion's conversational clarity meets Stripe's action precision.

---

## AI Assistant Modes

| Mode | Entry | Context | Primary use |
|------|-------|---------|-------------|
| **Floating panel** | FAB / ⌘/ | Current screen entity | Quick Q&A, inline actions |
| **Full-page chat** | `/app/ai` | Full history | Extended analysis, report generation |
| **Inline result** | Observation photo | Disease detection | Computer vision overlay |
| **Proactive insight** | Dashboard widget | System-initiated | Recommendations with CTAs |
| **Mobile voice** | Mic button [V2] | Hands-free in field | Spoken queries |

---

## Screen 1: Floating Panel (Default)

### Closed State

```
                                    ┌──────┐
                                    │  🤖  │  ← FAB, bottom-right
                                    │ Ask  │     56×56px, primary color
                                    └──────┘
```

- Visible on all `/app/*` routes except full-page AI
- Badge dot when unread proactive insight
- Suppressed during modal focus; reappears on close

### Open State — Panel Wireframe

```
┌─────────────────────────────────────┐
│ ✦ Nertura AI              ─  □  ✕  │  ← header: minimize, expand, close
├─────────────────────────────────────┤
│ Context: Field 7 · Corn 2026        │  ← auto-detected from current page
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ You                         │   │
│  │ Should I spray Field 2      │   │
│  │ today?                      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Nertura AI                  │   │
│  │ Wind is 18 km/h — above     │   │
│  │ your 15 km/h limit. Rain    │   │
│  │ expected in 6 hours.        │   │
│  │                             │   │
│  │ Recommendation: Delay until │   │
│  │ Friday morning.             │   │
│  │                             │   │
│  │ Sources: Weather · Field 2  │   │
│  │                             │   │
│  │ ┌─────────────────────────┐ │   │
│  │ │ Reschedule spray task   │ │   │  ← action card
│  │ │ to Fri 8 AM             │ │   │
│  │ │ [ Confirm ]  [ Edit ]   │ │   │
│  │ └─────────────────────────┘ │   │
│  │                             │   │
│  │ 👍  👎                      │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ Suggested:                          │
│ [ Frost risk? ] [ Today's tasks ]   │
├─────────────────────────────────────┤
│ Ask anything...              🎤  ➤  │  ← input + voice [V2] + send
└─────────────────────────────────────┘
```

### Panel Dimensions

| Breakpoint | Width | Height |
|------------|-------|--------|
| Desktop | 400px | 100vh - top bar |
| Tablet | 360px | 100vh |
| Mobile | 100vw | 85vh (sheet) |

---

## Screen 2: Full-Page Chat (`/app/ai`)

### Wireframe

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│          │  ✦ Nertura AI                              [ New chat ]       │
│ Conver-  ├──────────────────────────────────────────────────────────────┤
│ sations  │                                                              │
│          │              [Conversation thread — centered max 720px]       │
│ Today    │                                                              │
│ · Spray  │   User message                                               │
│ · Yield  │   AI response with markdown tables, lists, charts             │
│          │   Action cards inline                                        │
│ Yesterday│                                                              │
│ · Frost  │                                                              │
│ · Market │                                                              │
│          │                                                              │
│ [Search] │                                                              │
├──────────┴──────────────────────────────────────────────────────────────┤
│ Ask anything about your farms...                              🎤  ➤    │
└──────────────────────────────────────────────────────────────────────────┘
```

### Conversation List (Left Rail)

| Element | Behavior |
|---------|----------|
| Grouped by date | Today, Yesterday, Previous 7 days, Older |
| Title | Auto-generated from first message (8 words max) |
| Search | Filter conversations by content |
| New chat | Clears context; starts fresh thread |
| Delete | Swipe or context menu; confirm dialog |

---

## Screen 3: Message Types

### Text Response

Standard markdown: headings, bullets, bold, tables. Code blocks for API users only.

### Action Card

```
┌─────────────────────────────────────────┐
│  Create irrigation schedule             │
│  Field 5 · 25mm · Today 6:00 PM         │
│                                         │
│  [ Confirm ]    [ Modify ]    [ Cancel ]│
└─────────────────────────────────────────┘
```

| State | Treatment |
|-------|-----------|
| Pending | Primary + secondary buttons |
| Confirmed | Green check; link to created entity |
| Cancelled | Grayed; collapsed |
| Failed | Red error + retry |

### Data Card

Structured query result — mini table or KPI:

```
┌─────────────────────────────────────────┐
│  Field 2 yield history                  │
│  ┌──────┬────────┬─────────┐            │
│  │ Year │ Yield  │ vs avg  │            │
│  │ 2025 │ 4.2 t  │ +8%     │            │
│  │ 2024 │ 3.8 t  │ -2%     │            │
│  └──────┴────────┴─────────┘            │
│  [ Open full report ]                   │
└─────────────────────────────────────────┘
```

### Chart Card [V2]

Inline sparkline or bar chart for trend questions.

### Source Citations

Footer on every factual response:

```
Sources: Weather Intelligence (updated 14m ago) · Crop Plan #8821
```

Clickable → navigates to source entity.

---

## Screen 4: Suggested Prompts

Context-aware chips below input. Change by current module:

| Context | Suggestions |
|---------|-------------|
| **Dashboard** | "What needs attention today?" · "Weather this week" · "Overdue tasks" |
| **Field detail** | "Soil history" · "Best spray window" · "Yield forecast" |
| **Crop plan** | "Next tasks" · "Input schedule" · "Disease risk" |
| **Marketplace** | "Price trend for corn" · "Best time to sell" |
| **Irrigation** | "Optimize schedule" · "Water budget status" |
| **CRM** | "Accounts needing follow-up" · "Pipeline summary" |

Empty input shows suggestions; typing hides them.

---

## Screen 5: Disease Detection Inline (`/app/crops/observations/new`)

### Flow Wireframe

```
Step 1: Capture
┌─────────────────────────────────────────┐
│  ← Back          New observation          │
│  ┌───────────────────────────────────┐   │
│  │                                   │   │
│  │         [ Camera viewfinder ]     │   │
│  │                                   │   │
│  └───────────────────────────────────┘   │
│  [ 📷 Capture ]  [ 🖼 Gallery ]           │
└─────────────────────────────────────────┘

Step 2: Analyzing
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐   │
│  │  [photo with scan animation]      │   │
│  └───────────────────────────────────┘   │
│  Analyzing leaf pattern...               │
│  ████████░░  80%                         │
└─────────────────────────────────────────┘

Step 3: Result
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐   │
│  │  [photo with heatmap overlay]     │   │
│  │  affected area highlighted        │   │
│  └───────────────────────────────────┘   │
│  NORTHERN LEAF BLIGHT                    │
│  Confidence: 87%  ·  Severity: Medium    │
│  Affected area: ~15% of leaf             │
│                                         │
│  Recommended: Apply fungicide within     │
│  48 hours. Product in inventory:         │
│  Azoxystrobin 250 SC                     │
│                                         │
│  [ ✓ Confirm diagnosis ]                 │
│  [ ✗ Not correct — tell AI ]             │
│  [ Create spray task ]                   │
│                                         │
│  Notes: ________________________         │
│  [ Save observation ]                    │
└─────────────────────────────────────────┘
```

### Low Confidence State (<70%)

```
┌─────────────────────────────────────────┐
│  UNCERTAIN MATCH                         │
│  Confidence: 52%                         │
│  Possible: Northern leaf blight OR       │
│            Gray leaf spot                │
│                                         │
│  ⚠ Recommend expert review.              │
│  [ Send to agronomist ]  [ Save anyway ] │
└─────────────────────────────────────────┘
```

---

## Screen 6: Proactive Insight (Dashboard Widget)

See `/product/farmer-dashboard.md` — AI Insights widget.

Panel opens pre-loaded if user clicks "Why?" on insight card.

---

## Screen 7: Confirmation Dialog (Destructive Actions)

AI-initiated actions that modify data require explicit confirm:

```
┌─────────────────────────────────────────┐
│  Confirm action                         │
│                                         │
│  Nertura AI will:                       │
│  · Reschedule task "Spray Field 2"      │
│    from Today → Friday 8 AM             │
│  · Notify assignee Maria Santos         │
│                                         │
│  [ Confirm ]          [ Cancel ]      │
└─────────────────────────────────────────┘
```

No confirm for read-only responses.

---

## Screen 8: Error & Limit States

### Rate Limit (Professional)

```
┌─────────────────────────────────────────┐
│  Daily AI limit reached (100/100)       │
│  Resets in 6 hours.                     │
│  [ Upgrade to Business ]  for 500/day   │
└─────────────────────────────────────────┘
```

### Offline (Mobile)

```
┌─────────────────────────────────────────┐
│  AI requires connection                 │
│  Disease detection available offline    │
│  for supported crops.                   │
│  [ Use offline scan ]                   │
└─────────────────────────────────────────┘
```

### AI Unavailable

```
┌─────────────────────────────────────────┐
│  AI temporarily unavailable               │
│  Your data is safe. Try again shortly.   │
│  [ Retry ]                              │
└─────────────────────────────────────────┘
```

---

## Screen 9: Mobile AI (`/m/more/ai`)

Full-screen chat; no side rail. Conversations in hamburger menu.

```
┌─────────────────────────┐
│ ← AI Assistant      ⋮   │
├─────────────────────────┤
│                         │
│   [message thread]      │
│                         │
├─────────────────────────┤
│ [ Frost? ] [ Tasks ]    │
├─────────────────────────┤
│ Ask...            🎤 ➤  │
└─────────────────────────┘
```

Voice input prioritized on mobile — mic icon larger than send.

---

## Screen 10: Feedback Flow

After each response: 👍 👎

Thumbs down expands:

```
What was wrong?
○ Inaccurate data
○ Wrong recommendation
○ Didn't understand my question
○ Other: ___________
[ Submit feedback ]
```

Feedback stored for model improvement (with consent).

---

## Interaction Rules

| Rule | Detail |
|------|--------|
| Context injection | Current route entity auto-added to prompt |
| Action audit | All confirmed actions logged in audit trail |
| PII | AI never repeats passwords, API keys, payment data |
| Language | Responds in user's profile language |
| Streaming | Tokens stream for responses >50 tokens |
| Stop generation | Esc or stop button during stream |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Screen reader | Messages announced; action cards focusable |
| Keyboard | Tab through actions; Enter to confirm |
| Contrast | AI bubble distinct from user bubble |
| Motion | Scan animation respects prefers-reduced-motion |

---

## Analytics Events

| Event | Properties |
|-------|------------|
| `ai.panel.open` | trigger, context_module |
| `ai.message.send` | query_length, has_context |
| `ai.action.confirm` | action_type, entity |
| `ai.action.cancel` | action_type |
| `ai.feedback` | positive, reason |
| `ai.disease.confirm` | crop, disease, confidence |

---

*Document owner: Product Design*  
*Last updated: June 2026*  
*Technical spec: `/ai/ai-system.md`*
