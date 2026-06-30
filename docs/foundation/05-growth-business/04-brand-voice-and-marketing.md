# Chapter 04 — Brand Voice & Marketing

## Purpose

Define how Nertura **speaks to growers, partners, and prospects** — calm, premium, and grounded in agricultural reality. Marketing must feel like advice from a trusted agronomist, not a venture-backed agtech pitch deck.

---

## Principles

1. **Calm over hype** — No urgency tricks, no "disrupting agriculture," no fake scarcity.
2. **Premium over cheap** — Quality of language matches quality of intelligence; we compete on trust, not price shouting.
3. **Agricultural over technical** — Fields, seasons, crops, risk — not tokens, models, or neural networks.
4. **Evidence over assertion** — Cite Knowledge Bank sources; include disclaimers on treatment advice.
5. **Human approval over automation** — AI drafts; founders approve before public send (see Growth AI admin).
6. **Neutral advisor** — Never position Nertura as selling inputs, endorsements, or marketplace listings.

---

## Architecture / Structure

### Brand visual system

From [`brand/README.md`](../../../brand/README.md):

| Element | Value | Usage |
|---------|-------|-------|
| Void | `#0B1220` | Primary dark, text on light |
| Signal | `#2DDAAF` | Accent, CTAs, active states |
| Mark | Graph Kernel hexagon | Intelligence OS — not farming clipart |
| Imagery rule | No stock farmer clichés | Real fields or abstract geometry only |

Marketing materials use the same design tokens as product (`packages/ui`) — no separate "marketing brand."

### Voice spectrum

```
TOO CASUAL          NERTURA TARGET           TOO CORPORATE
─────────────────────────────────────────────────────────────
"Yo farmers!        "Your wheat shows        "Leveraging synergistic
 AI magic!"          signs of nitrogen         AI paradigms to
                     stress — here's            optimize yield
                     what to check first."      outcomes."
```

### Tone attributes

| Attribute | Do | Don't |
|-----------|-----|-------|
| **Calm** | "Here's what we'd check first." | "URGENT: Act now!" |
| **Premium** | Clear sentences, proper terms | Exclamation marks, emoji spam |
| **Agricultural** | hectare, growth stage, blight, irrigation window | inference, LLM, prompt, API |
| **Honest** | "AI advice — verify with local agronomist." | "Guaranteed cure in 48 hours." |
| **Regional** | Respect TR/EN and local crop names | US-only idioms without localization |

### Channel strategy (phase-aligned)

From [`docs/marketing-growth-system.md`](../../marketing-growth-system.md), grounded in admin implementation:

| Channel | Phase | Admin module | Auto-publish |
|---------|-------|--------------|--------------|
| Homepage / pricing | MVP | Marketing app | N/A — static |
| Founder social | MVP | Manual | Human only |
| Transactional email | MVP | Resend | System (no marketing) |
| Blog / SEO | V2 | Content engine | **Draft only** |
| Newsletter | V2 | Content engine | **Approval required** |
| LinkedIn B2B | V2 | Content engine | **Approval required** |
| TikTok / Reels / Shorts | V3 | Content engine + Growth AI | **Approval required** |
| Outreach email | Live | Growth AI → Outreach approval | **Approval required** |

### Growth AI admin (live)

**App:** `apps/admin` — `/growth-ai/*`

The Growth dashboard (`growth-dashboard-client.tsx`) states explicitly:

> *"AI automation creates drafts only — founder approval required before any send."*

Quick actions:

| Action | Route | Behavior |
|--------|-------|----------|
| Discover leads | `/growth-ai/lead-discovery` | AI web search by sector — creates lead records |
| Review outreach | `/growth-ai/outreach` | Approve/reject/edit email drafts |
| Build campaign | `/growth-ai/campaigns` | Audience + AI estimates |
| Content Studio | `/growth-ai/content-studio` | Multi-channel drafts |

Metrics tracked: leads, emails generated, pending approvals, sent/delivered/opened/clicked, new users, premium conversions (`apps/admin/src/lib/growth/stats.ts`).

### Messaging pillars

| Pillar | Message | Proof point |
|--------|---------|-------------|
| **Intelligence** | "The AI Brain for Agriculture" | Structured Doctor answers with evidence cards |
| **Memory** | "Every field is a patient file" | `field_cases` persistence |
| **Trust** | "Neutral advisor — we don't sell inputs" | No marketplace in product |
| **Access** | "Ask before you sign up" | 3 free guest questions |
| **Depth** | "Gets smarter every season" | Case history, follow-ups |

### Words we use / words we avoid

| Use | Avoid |
|-----|-------|
| field, farm, crop, season | platform, ecosystem (external-facing) |
| diagnosis, observation, risk level | prediction accuracy %, model confidence score |
| credits (when billing) | tokens, API calls |
| Agriculture Doctor | chatbot, copilot, assistant (as primary noun) |
| evidence, knowledge bank | training data, corpus |
| grower, farmer | user (in marketing copy) |

Technical terms belong in engineering docs (Book 03), not homepage hero text.

---

## Decision Rationale

### Why calm premium for farmers?

Agricultural decisions carry **financial and food-security weight**. Hype language triggers skepticism in growers who have seen five "revolutionary" apps fail. Calm tone signals competence — the same tone a good agronomist uses in a field visit.

### Why agricultural language over AI jargon?

Our buyers do not purchase "large language models." They purchase **answers about their crop**. Leading with AI tech attracts investors and journalists; leading with crop outcomes attracts growers.

### Why founder approval on all outbound AI content?

Agricultural misinformation can cause crop loss. One auto-published wrong pesticide rate destroys brand trust permanently. The outreach pipeline enforces: `taslak` (draft) → human approve → `onaylandi` → send (`send-approved.ts`).

---

## Examples

### Good homepage headline

*"Ask anything about your crop. Upload a photo. Get a clear answer — grounded in agricultural knowledge."*

### Bad homepage headline

*"Powered by cutting-edge multimodal AI to supercharge your ag workflow!"*

### Good outreach email opening

*"I noticed [Cooperative Name] supports wheat growers in [Region]. Nertura helps agronomists track field problems with photo-based diagnosis — I'd welcome 15 minutes to show how similar co-ops use it for early rust detection."*

### Bad outreach email opening

*"Our AI SaaS platform leverages GPT-4 to disrupt traditional farm management!"*

### Good social post (draft)

*"Yellowing between leaf veins often points to nutrient mobility — especially magnesium or iron — but soil pH changes what you see. Three checks before you spray: (1) new vs old leaves, (2) recent lime or gypsum, (3) wet spots in the field. — Nertura Agriculture Doctor [disclaimer link]"*

---

## Best Practices

- Every treatment mention includes link to AI disclaimer (`DOCTOR_DISCLAIMER` in `@nertura/ai`).
- Use `@nertura/utm` builder for all campaign links — store on signup.
- Review AI drafts in admin within 48h SLA ([marketing-growth-system](../../marketing-growth-system.md)).
- Localize TR/EN for Turkey launch — not English-only US idioms.
- Sponsor or partner content always labeled explicitly.

## Bad Practices

- Fake certification badges or "approved by ministry" claims without legal review.
- Stock photos of smiling farmers with perfect teeth in unrealistic poses.
- Auto-generated outreach without `do_not_contact` check (pipeline skips opted-out leads — never bypass).
- Promising yield percentages without evidence.
- Positioning Nertura as marketplace, input store, or dealer network.

---

## Future Considerations

| Item | Phase |
|------|-------|
| Graduated approval levels L0→L2 | V3 — after 50+ approved posts per domain |
| Media Factory (video/voice) | V3 — still approval-gated |
| Regional brand guides (LATAM, MENA) | V2 |
| Cooperative co-marketing templates | V4 |
| Sponsor campaigns with Finance + Legal review | V5 |

---

## Cross-References

- [SEO, Community & Content](07-seo-community-and-content.md)
- [Notifications & Email](06-notifications-and-email.md)
- [Book 01 — Farmer Psychology](../01-product-bible/05-farmer-and-user-psychology.md)
- Legacy: [`docs/marketing-growth-system.md`](../../marketing-growth-system.md)
- Code: `apps/admin/src/components/growth/growth-dashboard-client.tsx`
