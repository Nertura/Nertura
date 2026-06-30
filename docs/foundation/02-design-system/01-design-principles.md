# Chapter 01 — Design Principles

> Calm, ChatGPT-inspired, farmer-first, no visual noise.

---

## Purpose

This chapter defines the **non-negotiable UX principles** that every Nertura screen must follow. It connects product philosophy ([Book 01 — Product Principles](../01-product-bible/07-product-principles.md)) to visual execution in `packages/ui/` and dashboard components.

When a design decision is ambiguous, return to these principles before adding pixels.

---

## Principles

### 1. Calm by default

The product should feel like early morning in the field — low-contrast chrome, soft borders, no alarm colors unless severity warrants. Backgrounds use semantic tokens (`background`, `muted`, `card`), not decorative gradients in operational views.

### 2. ChatGPT-inspired simplicity

One focal action per view. The Doctor (`/doctor`) centers on ask → answer → evidence. Empty state shows hero + composer + example prompts — not a dashboard of widgets. Headers are thin (`h-14`), sticky, and semi-transparent with backdrop blur.

### 3. Farmer-first literacy

Copy is plain language (Turkish primary in dashboard `lang="tr"`). Technical errors never reach the user — see `friendlyAiError()` in `packages/ui/src/components/ai-chat/composer.tsx`. Units are explicit: m², dönüm, ha on field cards.

### 4. No visual noise

No robot mascots, purple AI gradients, or novelty motion. Intelligence is shown through **structured answer cards** (`DoctorAnswerCard`), **evidence chips** (`EvidenceCardsPanel`), and **confidence labels** — not decorative sparkle effects.

### 5. Content over chrome

Navigation and panels recede; crop problems, maps, and diagnoses are foreground. Sidebars use `bg-muted/20` or `border-r`, not heavy brand color blocks.

### 6. Trust through structure

Progressive disclosure: short diagnosis and immediate action first; treatment plan and expert warnings behind "More details". Disclaimers always visible at card footer.

---

## Architecture

Design principles flow through three layers:

```
Book 01 Product Principles
        ↓
Book 02 Design Principles (this chapter)
        ↓
packages/ui tokens + component patterns
        ↓
apps/dashboard feature components
```

| Layer | Responsibility |
|-------|----------------|
| **Tokens** | `globals.css` HSL variables, `void`/`signal` brand anchors |
| **Components** | Reusable primitives (Button, Alert) and domain shells (AiChatShell, MapView) |
| **Features** | `chat-app.tsx`, `farm-map-client.tsx` compose components with business logic |

---

## Decision Rationale

| Decision | Why |
|----------|-----|
| ChatGPT-like Doctor layout | Farmers already understand conversational AI; zero training curve for the core loop |
| Turkish-first dashboard | Primary user base; English supported in diagnosis cards via `language` prop |
| Minimal header chrome | Field users need vertical space for map + chat on laptop (1366px) |
| Evidence as cards, not footnotes | Builds trust per [Book 01 AI Trust](../01-product-bible/09-ai-first-and-trust-philosophy.md) without overwhelming first glance |
| void/signal brand pair | High contrast for wordmark and logo mark without competing with semantic `primary` token |

---

## Examples

### Good — Doctor empty state

`DoctorChatApp` renders `AiChatHero` with centered `AiChatComposer`, example prompt chips, and no sidebar clutter until chat begins. Usage hint appears as subtle `text-xs text-muted-foreground`.

### Good — Map panel hierarchy

`FarmMapClient` puts the map at `lg:flex-[73]` and scrollable field list at `lg:flex-[27]`. Map dominates; panel supports action without competing visually.

### Good — Progressive diagnosis

`DoctorAnswerCard` shows summary, immediate action, and monitor hint collapsed; full treatment plan expands on user request.

### Bad — Dashboard widget grid on Doctor

Adding KPI tiles, weather widgets, and news feeds to `/doctor` violates one-focal-action and farmer-first principles.

---

## Best Practices

- Start every new screen with **one sentence**: "What is the farmer trying to do here?"
- Use `@nertura/ui` components before inventing local styles
- Prefer `text-muted-foreground` for secondary copy; reserve `text-foreground` for actionable content
- Use `animate-fade-in` / `animate-slide-up` sparingly for new messages and drawers — not for every hover
- Cross-check against [Book 01 — First 30 Seconds](../01-product-bible/10-first-30-seconds.md) for activation flows

---

## Bad Practices

- Exposing raw API errors, stack traces, or provider names (Gemini, OpenAI) to farmers
- Multiple competing primary buttons in one card
- Full-width saturated brand color backgrounds in data-dense views
- Custom color hex values in feature code instead of Tailwind semantic tokens
- Adding features to UI that are not implemented in code (document aspirational work in Future considerations only)

---

## Future Considerations

- Unified **design tokens package** export for Figma ↔ code parity (see [Book 03](../03-engineering-standards/) when published)
- Role-based density modes (farmer simplified vs agronomist dense) — not shipped in current Doctor UI
- Localized example prompts per region/crop from server config
- Motion preference media query wrapper around all entrance animations (partially addressed in ch. 12)

---

## Related Chapters

- [02 — Color System](02-color-system.md)
- [07 — Doctor UI](07-doctor-ui.md)
- [14 — Interaction Principles](14-interaction-principles.md)
