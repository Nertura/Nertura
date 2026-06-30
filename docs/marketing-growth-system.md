# Nertura — Marketing & Growth System

> End-to-end marketing architecture: content, channels, approval, analytics, attribution.

**Status:** Pre-implementation · **Owner:** CGO  
**Companion:** [`../automation/media-factory.md`](../automation/media-factory.md), [`../product/approval-workflow.md`](../product/approval-workflow.md)

---

## Growth Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MARKETING ENGINE                              │
├─────────────────────────────────────────────────────────────────┤
│  STRATEGY → CREATE → APPROVE → DISTRIBUTE → MEASURE → OPTIMIZE   │
└─────────────────────────────────────────────────────────────────┘
         │              │            │              │
         ▼              ▼            ▼              ▼
   Content Cal    AI Media      Admin Panel    GA4/PostHog
   UTM rules      Factory       Approval       Stripe attrib
   ICP targeting  Brain         Queues         Campaign reports
```

---

## Phase Alignment

| Phase | Marketing capability |
|-------|---------------------|
| **Day 90 MVP** | Homepage, pricing, UTM tracking, manual founder social, transactional email only |
| **V2** | Blog CMS, lifecycle email, newsletter, demo pipeline |
| **V3 (Media Factory)** | AI content gen, multi-channel auto-packaged, approval L0–L2 |
| **V4** | Sponsor campaigns, cooperative co-marketing |

---

## Content Calendar

### Operating rhythm (at scale — V3)

| Day | Output |
|-----|--------|
| Mon | Blog article + LinkedIn |
| Tue | TikTok/Reels short |
| Wed | Carousel (IG/FB) |
| Thu | YouTube Short |
| Fri | Newsletter draft + WhatsApp utility tip (where live) |
| Sat–Sun | Monitor; optional evergreen repost |

MVP: 2 founder posts/week manual; no calendar automation.

### Calendar tool

Notion or admin Content Calendar module (V2): title, channel, status, owner, publish datetime, UTM link.

---

## AI Content Generation (V3)

Pipeline: [`content-pipeline.md`](../automation/content-pipeline.md)

| Stage | Tool |
|-------|------|
| Research | Brain + web search |
| Script | Claude / GPT-4o |
| Image | DALL·E 3 / Imagen |
| Voice | ElevenLabs |
| Video | Runway / Veo / Kling |
| Package | Internal compositor |
| Queue | Admin approval |

**Launch rule:** Founder approves every public post (L0).

---

## Channel Strategy

| Channel | Purpose | Phase | Admin module |
|---------|---------|-------|--------------|
| **Instagram** | Brand awareness, reels | V3 | Social approval |
| **TikTok** | Acquisition, education | V3 | Social approval |
| **YouTube Shorts** | SEO + authority | V3 | Social approval |
| **LinkedIn** | B2B, enterprise, co-ops | V2 | Social approval |
| **Facebook** | EM farmers, co-ops | V3 | Social approval |
| **Blog** | SEO, depth | V2 | Content approval |
| **Newsletter** | Retention, nurture | V2 | Email campaign center |
| **WhatsApp broadcast** | Co-op utility | V3 | WA center |
| **Sponsor campaigns** | Partner credits | V5 | Finance + Legal |

---

## Founder Approval Workflow

```
AI/human draft → PENDING in Admin
    → Founder or Content Admin reviews
    → APPROVE → schedule → publish via n8n/social API
    → REJECT → revision notes → re-draft
```

SLA: founder review within 48h. Nothing auto-publishes at L0.

Graduation to L1/L2 auto only after 50+ approved posts per domain ([`ai-governance-policy.md`](ai-governance-policy.md)).

---

## UTM Tracking Standard

| Parameter | Convention |
|-----------|------------|
| `utm_source` | tiktok, instagram, linkedin, newsletter, whatsapp |
| `utm_medium` | social, email, cpc, organic |
| `utm_campaign` | launch_2026, frost_alert_series, corn_guide |
| `utm_content` | variant_a, reel_042 |

All marketing links use `@nertura/utm` builder. Stored on signup `users.utm_attribution` JSONB.

---

## Performance Analytics

| Metric | Source | Review |
|--------|--------|--------|
| Signups by channel | PostHog + UTM | Weekly |
| CAC by channel | Ad spend / signups | Monthly |
| Content → signup | GA4 path | Weekly |
| Email open/click | Resend | Per campaign |
| Social engagement | Platform APIs | Weekly |
| 15% content-attributed signups | Target Year 1 post-Factory | Quarterly |

Admin **Campaign Reporting** dashboard (V2): filter by campaign, channel, date, conversions, revenue influenced.

---

## Automation Stack

| Workflow | Tool |
|----------|------|
| Approved post → Buffer/Late API | n8n V3 |
| New blog → Twitter/LinkedIn teaser | n8n V2 |
| Signup → welcome sequence | Resend + n8n V2 |
| Demo request → Slack sales | n8n MVP |
| Stripe trial start → founder alert | n8n MVP |

Internal workflow engine replaces n8n for core flows V4+.

---

## Brand & Quality Guardrails

- Colors: `#0B1220`, `#2DDAAF` per [`../brand/README.md`](../brand/README.md)
- No stock farmer clichés in generated imagery
- No fake certification badges
- Sponsor content always labeled
- Agricultural advice in content includes disclaimer link

---

## MVP Marketing Deliverables (Day 90)

- [ ] Homepage live with conversion tracking
- [ ] Pricing page with Stripe checkout links
- [ ] GA4 + conversion events (signup, subscribe)
- [ ] UTM capture on registration
- [ ] Legal pages published
- [ ] hello@ and support@ monitored
- [ ] Demo/waitlist forms working
- [ ] Founder manual social (no automation)

---

*Marketing & Growth System v1.0 — Pre-implementation.*
