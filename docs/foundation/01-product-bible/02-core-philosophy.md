# Chapter 02 — Core Philosophy

## Purpose

Establish the **intellectual foundation** of Nertura: why we are an operating system, how intelligence layers stack, and why simplicity at the surface is non-negotiable.

---

## Principles

1. **AI-first, not AI-added** — Intelligence is the product; UI is the interface to intelligence
2. **Depth is earned** — Users graduate from question → photo → field → case → monitoring
3. **Memory compounds** — Every field, case, and conversation makes the next answer better
4. **Trust is engineered** — Evidence, confidence, review queues, RLS — not marketing claims
5. **Neutral advisor** — We recommend actions, not products we sell

---

## Architecture: The Four Intelligence Layers

Nertura is organized as four layers. Each layer has a user-visible surface and a backend system.

| Layer | Role | User sees | Code anchor |
|-------|------|-----------|-------------|
| **1. AI Doctor** | Questions, photos, diagnosis, follow-up | Chat composer, answer cards, evidence | `runIntelligenceEngine` |
| **2. Field Intelligence** | Digital twin per field | Map, boundaries, cases, history | `field_cases`, `farm-map-client` |
| **3. Knowledge Intelligence** | Verified facts + research | Evidence cards, citations | Knowledge Bank, ingestion |
| **4. Growth Intelligence** | Content, outreach, SEO drafts | Admin-only; approval required | Growth AI platform |

```
                    ┌─────────────────────────┐
                    │   Growth Intelligence    │  ← Admin, approval-only
                    └───────────┬─────────────┘
                    ┌───────────▼─────────────┐
                    │  Knowledge Intelligence   │  ← Review queue, citations
                    └───────────┬─────────────┘
                    ┌───────────▼─────────────┐
                    │   Field Intelligence      │  ← Map, cases, memory
                    └───────────┬─────────────┘
                    ┌───────────▼─────────────┐
                    │      AI Doctor            │  ← Entry point for all users
                    └─────────────────────────┘
```

---

## Decision Rationale

### Why "Operating System" and not "Application"

An **application** solves one workflow and stops. An **operating system**:

- Provides a **runtime** (intelligence engine) other features plug into
- Maintains **persistent state** (fields, cases, memory events)
- Enforces **policies** (safety, language, credits, RLS)
- **Scales horizontally** — new modules (weather, satellite, reports) attach without redesign

Farmers do not want another app. They want **something that knows their crop and gets smarter**.

### Why Doctor is the wedge

Diagnosis is **high urgency, high frequency, low setup**. A farmer with yellowing wheat needs help *now* — not after configuring 14 dashboard widgets.

Doctor → trust → field creation → ongoing case → premium reports. This is the **product ladder**.

---

## The Product Ladder

Every user follows a natural depth progression:

| Step | Action | Feeling |
|------|--------|---------|
| 1 | Ask a simple question | "This understands me" |
| 2 | Upload a photo | "This sees my problem" |
| 3 | Receive short useful answer | "This helps immediately" |
| 4 | Add location / crop context | "This knows my situation" |
| 5 | Create a field (intake → map) | "This remembers my land" |
| 6 | Open ongoing field case | "This tracks my problem" |
| 7 | Premium reports / monitoring | "This is worth paying for" |

**Never reverse the ladder.** Do not show farm dashboards before the user has experienced value.

---

## Dual UX Model

| User state | Primary surface | Philosophy |
|------------|-----------------|------------|
| **Guest / new** | Marketing homepage composer | Google-like: one input, three actions |
| **Registered, no fields** | AI Doctor + gentle intake path | Doctor first; field creation when relevant |
| **Registered, with fields** | Field-centric dashboard (RC-2) | Calm OS home; Doctor one click away |
| **Deep workflow** | Intake → map → boundary → case → Doctor | Full context handoff |

---

## Examples

### Good: Intelligence-first feature design

**Field case from Doctor:** User asks about wheat yellowing → system offers to save as ongoing case on their field → next visit, Doctor remembers symptoms and prior recommendations.

### Bad: Dashboard-first feature design

**Landing on farm analytics:** New user sees charts, empty tables, and navigation with 12 modules before asking a single question.

---

## Best Practices

- Every new module must **feed or consume** the intelligence engine
- Field creation is **optional acceleration**, not a gate
- Admin/growth features stay **approval-only** — never auto-publish or auto-send

## Bad Practices

- Building standalone features that bypass `runIntelligenceEngine`
- Forcing onboarding wizard before first Doctor question
- Treating Knowledge Bank as optional decoration instead of grounding layer

---

## Future Considerations

- **Voice input** — same ladder, new input modality (scaffolded, not MVP)
- **WhatsApp / SMS channel** — Doctor as messaging surface (Growth book)
- **API for partners** — OS exposes intelligence to cooperatives and ERP integrations

---

## Cross-References

- [Product Principles](07-product-principles.md)
- [Book 04 — AI Architecture](../04-ai-behaviour/01-ai-architecture-overview.md)
- [Book 02 — Doctor UI](../02-design-system/07-doctor-ui.md)
