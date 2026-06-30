# Chapter 04 — Ten-Year Roadmap

## Purpose

Provide a **long-horizon direction** without inventing new products or redesigning the current architecture. This roadmap respects RC-2 (June 2026) and production stabilization as the active priority.

---

## Principles

1. **Doctor first, platform second, ecosystem third**
2. **Each phase must work standalone** — no "wait for Phase 4" value
3. **Approval gates decrease only with proven trust** — never by default
4. **Marketplace and input sales remain deferred** — neutral advisor always
5. **Geographic expansion follows language + knowledge coverage**

---

## Roadmap Overview

```
Year 0–1          Year 1–3           Year 3–6            Year 6–10
────────          ────────           ────────            ─────────
AI Doctor         Field OS           Regional brain      Global ag intelligence
Guest → signup    Cases + memory     Weather/satellite   Partner API
TR + EN           Premium reports    Multi-crop depth    Cooperative OS
Stabilization     Stripe live        EU + MENA           IoT as input layer
```

---

## Phase 0 — Foundation (2025–2026) ✅ In progress / RC-2 complete

**Status:** Production stabilization, UX polish, trust hardening

| Capability | State |
|------------|-------|
| Guest AI Doctor (marketing) | ✅ Shipped |
| Authenticated Doctor + intelligence engine | ✅ Shipped |
| Natural-language intake → map → field | ✅ Shipped |
| Field cases (patient files) | ✅ Shipped |
| Knowledge Bank + ingestion + review queue | ✅ Shipped |
| Credits scaffold + Stripe checkout | ⏳ Scaffold |
| Full UI i18n | ⏳ Partial (TR/EN copy pattern) |
| Weather / satellite live data | ⏳ Placeholders |
| Voice input | ⏳ Future |

**Exit criteria:** Security audit, stable mobile Doctor, locked conversation language, beta cohort retention > 40% D7

---

## Phase 1 — Trusted Doctor (2026–2027)

**Focus:** Best agricultural Q&A + photo diagnosis in TR and EN

| Deliverable | Description |
|-------------|-------------|
| Vision pipeline polish | Top-3 causes, missing-context prompts, species validation |
| Conversation language lock | `ai_conversations.language` enforced end-to-end |
| UI i18n Gate 5 | Full Turkish/English UI, not AI-only |
| Premium reports (gated) | PDF care plans, credit-based, disclaimer-aware |
| Outcome tracking | Did treatment work? Feeds memory and similar cases |
| Sentry + CSP hardening | Production observability |

**Not in Phase 1:** Marketplace, auto-outreach send, auto-content publish

---

## Phase 2 — Field Operating System (2027–2029)

**Focus:** Every field is a living patient file with seasonal memory

| Deliverable | Description |
|-------------|-------------|
| Weather API integration | Regional provider behind feature flag |
| Soil / satellite layers | Map UI data (NDVI scaffold) |
| Monitoring workflows | Case status automation, follow-up reminders |
| Team / org roles | Operator vs viewer workflows at scale |
| Mobile-optimized map | Offline boundary cache |
| Similar-case ranking production | Cross-farm anonymized learning (opt-in) |

---

## Phase 3 — Regional Intelligence (2029–2032)

**Focus:** Nertura knows regions, not just languages

| Deliverable | Description |
|-------------|-------------|
| Expanded Knowledge Bank | FAO, USDA, CABI, ministry partnerships |
| Additional languages | Based on market entry, not speculation |
| Cooperative dashboards | White-label intelligence for aggregators |
| WhatsApp / SMS Doctor channel | Same engine, new surface |
| Graduated Growth autonomy | L1–L2 trust levels per AI governance |

**Explicitly deferred:** Input marketplace, chemical auto-dosing without expert review

---

## Phase 4 — Global Agriculture Brain (2032–2036)

**Focus:** Platform API, partner ecosystem, IoT as data layer

| Deliverable | Description |
|-------------|-------------|
| Nertura Intelligence API | Partners embed Doctor + field memory |
| IoT / sensor ingestion | Soil moisture, weather stations → field context |
| Predictive risk models | Seasonal disease pressure by region |
| Enterprise tier | Custom knowledge, SLA, on-prem options |
| Research partnerships | University validation programs |

---

## Decision Rationale

We **sequence depth after trust** because:

- A wrong diagnosis at scale destroys the brand faster than missing features
- Memory systems require accurate early diagnoses to compound value
- Premium monetization requires proven free-tier retention

We **defer marketplace** because:

- Neutral advisor positioning is a competitive moat
- Input sales create regulatory and liability surface
- Farmers already distrust "free advice that sells products"

---

## Examples

### Good Phase 1 prioritization

Fix photo upload errors, mixed-language UI, geolocation UX on farm map — **stabilization that increases trust**.

### Bad Phase 1 prioritization

Build social network, farmer marketplace, and live video consulting — **new products that dilute Doctor focus**.

---

## Best Practices

- Tie every sprint to a **phase exit criterion**
- Update this chapter when a phase completes — date and evidence
- Reference sprint reports as **historical artifacts**, not parallel roadmaps

## Bad Practices

- Publishing roadmap dates to investors without "subject to stabilization" caveat
- Adding phases for trendy features (blockchain traceability, NFT certificates)

---

## Future Considerations

- **Acquisition scenarios** — documentation and RLS make diligence easier
- **Open-source components** — geo utilities or knowledge schemas may open selectively
- **Regulatory regimes** — EU AI Act, Turkey KVKK evolution may shift Phase 3 timing

---

## Cross-References

- [MVP & Premium Philosophy](08-mvp-and-premium-philosophy.md)
- [Book 05 — KPIs](../05-growth-business/08-analytics-and-kpis.md)
- Legacy: `docs/SPRINT_RC2_FIELD_INTELLIGENCE.md`
