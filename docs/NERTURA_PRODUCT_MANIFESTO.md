# Nertura Product Manifesto

> **Superseded for canonical product law by [Foundation Book 01 — Product Bible](foundation/01-product-bible/)** (June 2026).  
> This file remains a useful sprint audit reference and narrative summary. When they conflict, **Foundation wins**.

> Engineering details: [`NERTURA_ARCHITECTURE_BIBLE.md`](NERTURA_ARCHITECTURE_BIBLE.md) · Navigation: [`nertura-index.md`](nertura-index.md) · **Canonical:** [`foundation/README.md`](foundation/README.md)  
> Last updated: June 2026 · **Foundation pass**

---

## What Nertura Is

**Nertura is the AI Brain for Agriculture.**

It is not only a plant-photo diagnosis app, farm management software, CRM, or content tool. It is an independent agriculture intelligence companion — from home plants to global producers.

**User-facing:** simple, calm, premium — Google + ChatGPT for agriculture.  
**Background:** safe AI operating system — Knowledge Bank, field memory, review queues, RLS, citations.

**Brand (text-only for now):**

- **Nertura**
- Tagline: *The AI Brain for Agriculture* / *The AI Agriculture Doctor*

---

## Core Product Philosophy

### First experience = extremely simple

New and free users open Nertura and see a **clean, wide, premium input composer**:

> “Ask about your plants, fields, trees, crops or soil…”

**Supported first actions:**

- Ask a question
- Upload a photo
- Use voice *(scaffold / future)*
- Share location *(via intake / field context)*
- Continue previous conversation

**Do not overload new users with farm dashboards first.**

### Gradual depth (the product ladder)

1. Ask a simple question  
2. Upload a photo  
3. Receive a **short useful answer**  
4. Optionally add location / crop / field context  
5. Optionally create a field (intake → map → boundary)  
6. Optionally start continuous monitoring (field case)  
7. Optionally generate premium reports (credits)

The experience must **not feel technical**.

### Logged-in experience

Registered users with farms get a **field-first dashboard** (RC-2) — fields, cases, recommendations — but it must remain **calm and not overwhelming**. AI Doctor stays one click away; intake remains the natural path to field creation.

| Surface | Primary entry |
|---------|----------------|
| **Marketing** (`nertura.com`) | Google-like composer → guest AI Doctor |
| **Dashboard** (logged-in) | Field OS home + prominent AI Doctor CTA |
| **AI Doctor** | Full intelligence with optional field/case context |

---

## Four Intelligence Layers

| Layer | Role | User sees |
|-------|------|-----------|
| **1. AI Doctor** | Questions, photos, diagnosis, prevention, treatment guidance, follow-up, field cases | Nertura Intelligence Engine — never raw Gemini |
| **2. Field Intelligence** | Digital twin per field: crop, boundary, area, history, cases, recommendations, reports | Field workspace, health score, patient-file cases |
| **3. Knowledge Intelligence** | Verified Knowledge Bank + research layer, citations, review queue | Evidence cards, source labels, admin approval |
| **4. Growth Intelligence** | Market research, SEO, content drafts, outreach leads, campaigns | Admin drafts only — **no auto-send, no auto-publish** |

---

## AI Doctor Rules

Every answer flows through **`runIntelligenceEngine`** — never a raw Gemini wrapper.

**Inputs:** question, image, crop, plant type, field context, location, area, farm memory, cases, conversation history, Knowledge Bank, evidence cards, weather/soil/satellite placeholders.

**Answer style — short first, expandable detail:**

1. Short answer / likely issue  
2. What I see or understand  
3. Top possible causes  
4. What to check next  
5. Safe immediate actions  
6. What not to do  
7. Follow-up question  
8. Optional: detailed explanation, sources, treatment plan, follow-up plan  

**Tone:** useful, region-aware, confidence-aware — *not* overconfident. Use *“Most likely”*, *“Possible causes”*, *“I need more context”*, *“Consult a certified expert for chemical dosage.”*

**Implementation:** `packages/ai/src/answer-formatter.ts` → `buildNerturaSections` / `DoctorAnswerCard` expandable UI.

---

## Photo Diagnosis Workflow

Photo analysis is a **diagnosis workflow**, not a one-shot image caption.

1. Detect visible observations (yellowing, spots, wilting, burn, insect damage, mold, deficiency, water stress)  
2. Detect likely plant part (leaf, stem, fruit, root, soil, whole plant)  
3. Infer or ask crop carefully  
4. Use field/crop/location when available  
5. Top 3 possible causes + confidence  
6. Ask missing context (duration, irrigation, fertilizer, spread, weather)  
7. Safe immediate steps  
8. Save to conversation + field case when `fieldId` / `caseId` present  
9. Recommend follow-up photo if needed  

Photo analysis may consume separate credits in future.

---

## Field Intelligence

A **field is a patient file.**

Stores: farm, name, crop, location, boundary polygon, `area_m2`, dönüm, hectares, centroid, history, images, cases, diagnoses, treatment notes, recommendations, premium reports, future weather/soil/satellite context.

**Canonical intake flow:**

> “Osmaniye Toprakkale'de 10 dönüm buğday tarlam var, buğday sararıyor.”

1. Extract location, area, crop, symptom  
2. Editable confirmation  
3. Geocode → map fly-to  
4. User finds exact field  
5. Draw boundary (satellite default)  
6. Calculate exact area; warn on stated vs drawn mismatch  
7. Save field  
8. Open ongoing field case  
9. AI Doctor starts with full field context  

**Map UX:** Mapbox satellite-first, search, current location, draw tutorial, undo/clear/finish, live m²/dönüm/ha, large-area warning, success state. Client-side only; Server Components stay server-safe.

---

## Field Cases

Statuses: `open` · `monitoring` · `resolved` · `archived` (metadata flag)

Each case: title, symptom, severity, crop, `field_id`, `conversation_id`, diagnosis summary, treatment/prevention, timeline, follow-up, images, current recommendation.

Doctor must communicate: *“I saved this as an ongoing field case.”*

---

## Knowledge Intelligence

**Two layers:**

1. **Verified Knowledge Bank** — approved, reviewed, trusted  
2. **Current research / web research** — labeled unverified until reviewed  

AI must distinguish verified knowledge, current research, and general reasoning.

**Ingestion:** source collection → summarization → citations → duplicate detection → **review queue** → human approval → Knowledge Bank.

**Never** auto-publish risky treatment, chemical, pesticide, or dosage claims.

**Sources (current + future):** FAO/AGROVOC, USDA, CABI, PlantVillage, SoilGrids, ministries, universities, manual upload, web research placeholder.

Show reference panels **when confidence, safety, or scientific support matters** — not on every answer.

---

## Content Engine (Growth Intelligence)

Generates **drafts only** for: blog, Instagram, carousel, Reels, TikTok, YouTube Shorts/long outline, LinkedIn, X, newsletter, voiceover, thumbnail concepts.

Based on: Knowledge Bank, trends, user problems, regional crop issues, approved internal formulas.

**All outputs → review queue.** Admin/founder approval required. Safety disclaimers on treatment claims.

---

## CRM / Outreach (Growth Intelligence)

Background AI may discover markets, cooperatives, chambers, consultants, universities, companies, and draft localized outreach.

**Hard rules:**

- No automatic mass email  
- No spam  
- No send without approval  
- Respect unsubscribe and do-not-contact  
- Log every send (Resend when configured)  

Flow: find → enrich → draft → **founder review** → approve → send → log → track.

---

## Premium / Credits

**Free:** initial credits, basic AI Doctor, limited photo analysis, basic Q&A.

**Premium / credits (future):** field memory, ongoing monitoring, detailed diagnosis, PDF care plans, fertilizer/irrigation plans, seasonal programs, disease risk, satellite/NDVI reports.

Premium reports: credit-based, disclaimer-aware, gated until Stripe tested (`NEXT_PUBLIC_PREMIUM_REPORTS_ENABLED`).

---

## Marketplace Rule

**Do not build marketplace/sales in current phase.**

Nertura must **not** sell pesticides, fertilizers, seeds, chemicals, or import products. Remain **trusted and neutral** — independent advisor, not a seller.

Marketplace = **future placeholder only** (deferred V2 per `mvp-definition.md`).

---

## Global / Language Strategy

**Priority:** Turkish · English

**Future:** auto-detect from browser, country, `Accept-Language`. Turkey → Turkish default. Others → English or local when supported. Manual language override required.

**Current implementation:** `analyzeQuestion()` language detection in `@nertura/ai`; TR/EN answer sections in `answer-formatter.ts`. Full i18n UI scaffold pending.

---

## Design Principles

| Surface | Feel |
|---------|------|
| **Marketing / guest Doctor** | Google-like, calm, mobile-first, text logo |
| **Dashboard** | Field-first for logged-in users, clear cards, easy Doctor access |
| **Admin** | Professional SaaS, approval-focused, no unfinished clutter |

Shared design tokens in `@nertura/ui`. No random one-off styling.

---

## Safety & Trust (Non-Negotiable)

- RLS on all tenant data  
- Admin guards + platform_admin role  
- Never expose raw Gemini errors, secrets, stack traces, or other users’ farm data  
- Outreach/content: human approval gates  
- Knowledge: review before publish  
- Friendly AI errors (`friendlyAiError`)  
- Rate limits and upload safety on doctor routes  

Pre-beta audit: RLS, auth, env secrets, CSP, monitoring (Sentry scaffold), abuse prevention.

---

## Foundation Pass Audit (June 2026)

| Area | Status | Notes |
|------|--------|-------|
| Guest-first composer (marketing) | ✅ | `HomeDoctorForm` on `/` |
| Logged-in field OS | ✅ | RC-2 home + field workspace |
| Intelligence Engine (not raw Gemini) | ✅ | `runIntelligenceEngine` in all doctor paths |
| Short-first answer sections | ✅ | `answer-formatter.ts` + `DoctorAnswerCard` |
| Intake → map → field → case | ✅ | `farm-intake-flow`, Mapbox client |
| Field cases patient files | ✅ | `field_cases` + workspace + PATCH actions |
| Knowledge review queue | ✅ | ingestion admin + `review_pending` |
| Content Engine draft-only | ✅ | `auto_publish: false` |
| Outreach approval-only | ✅ | no cron auto-send |
| Marketplace inactive | ✅ | not in app nav; docs defer V2 |
| Premium reports gated | ✅ | env flag |
| Language TR/EN (AI) | ✅ partial | UI i18n scaffold pending |
| Voice input | ⏳ | future |
| Live weather / satellite | ⏳ | placeholders |
| Stripe live checkout | ⏳ | scaffold only |

**Production readiness:** ~83% closed beta · ~65% GA (pending security audit, i18n UI, live payments, weather API)

---

## Recommended Next Sprint

1. **Security & trust pass** — RLS audit, rate limits, Sentry, CSP hardening  
2. **Language UI scaffold** — TR/EN toggle, Accept-Language default  
3. **Photo diagnosis polish** — explicit “top 3 causes” + missing-context prompts in engine prompts  
4. **Authenticated E2E test script** — intake → map → doctor → case actions  
5. **Weather placeholder → regional API** — one provider behind feature flag  

---

## Final Principle

**Every feature must help someone grow something.**

If a change does not help growers make better decisions, do not prioritize it.

*Nertura — the trusted digital agricultural intelligence companion for the world.*
