# Nertura — Community Network

> Future farmer knowledge-sharing network — peer learning, expert validation, and collective intelligence that feeds the Nertura data moat while strengthening user retention and global agricultural equity.

---

## Vision

Nertura Community transforms isolated farm decisions into **connected agricultural wisdom** — where a corn farmer in Turkey learns from verified practices in Brazil, where agronomists validate crowd knowledge, and where every shared insight (with consent) makes the platform smarter for everyone.

```
Individual farm intelligence  +  Peer network  +  Expert layer  =  Nertura Community Brain
```

**Phase:** 5+ (Months 24–36). Architecture defined now; build when Learning System and Memory layers reach critical mass.

---

## Strategic Objectives

| Objective | Outcome |
|-----------|---------|
| **Peer learning** | Farmers share practices that worked — crop-specific, region-aware |
| **Expert validation** | Certified agronomists elevate quality |
| **Retention** | Social embed increases switching cost beyond operational data |
| **Moat** | Community-generated knowledge exclusive to Nertura |
| **Equity** | Smallholders access collective intelligence previously reserved for enterprise |
| **Trust** | Reputation system rewards accuracy, not volume |

---

## Network Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    NERTURA COMMUNITY NETWORK                       │
├─────────────────────────────────────────────────────────────────┤
│  DISCOVERY        │  Feed, search, crop/region filters           │
│  CONTRIBUTION     │  Posts, practices, photos, Q&A                │
│  VALIDATION       │  Upvotes, expert badges, outcome confirmation  │
│  REPUTATION       │  Trust scores, leaderboards, credentials       │
│  MODERATION       │  AI + human; anti-misinformation               │
│  INTELLIGENCE     │  Feed Learning System + Knowledge Graph        │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        AI Farmer      Learning System   Knowledge Graph
        (surfaces        (promotes         (CommunityPost
         community         validated         nodes)
         insights)         practices)
```

---

## User Roles in Community

| Role | Capabilities |
|------|--------------|
| **Farmer** | Post, comment, share practices, ask community |
| **Farm Manager** | Same + team visibility controls |
| **Expert agronomist** | Validate posts; "Expert verified" badge |
| **Cooperative admin** | Private co-op spaces; member-only forums |
| **Moderator** | Remove content; escalate |
| **Nertura staff** | Official announcements; policy |

---

## Content Types

### CommunityPost

| Type | Description | Example |
|------|-------------|---------|
| **Question** | Ask the community | "Best fungicide timing for rust in humid June?" |
| **Practice** | Structured what-worked | Crop, action, context, outcome |
| **Observation** | Field note with photos | "Unusual leaf pattern — anyone seen this?" |
| **Success story** | Yield or cost win | "+15% corn with split N application" |
| **Discussion** | Open thread | Policy, market, equipment |
| **Expert article** | Long-form validated | Agronomist deep dive |

### SharedPractice (Structured)

| Field | Required |
|-------|----------|
| Crop | ✓ |
| Region (province level) | ✓ |
| Practice description | ✓ |
| Context (soil, weather, season) | ✓ |
| Outcome metric | Optional but weighted higher |
| Photos | Optional |
| Linked field record | Optional (private link) |

Structured practices feed Learning System with higher promotion weight than free text.

---

## Visibility & Spaces

| Space type | Access |
|------------|--------|
| **Public global** | All registered users; discoverable |
| **Regional** | Filter by country/province |
| **Crop-specific** | Corn, wheat, coffee channels |
| **Cooperative private** | Members only |
| **Organization private** | Ag company internal |
| **Expert lounge** | Verified experts + Nertura staff |

---

## Reputation System

### Farmer reputation

| Signal | Weight |
|--------|--------|
| Practice confirmed by outcomes (linked harvest) | +10 |
| Expert validation | +15 |
| Upvotes from high-reputation users | +3 |
| AI-confirmed accurate (matches diagnosis) | +5 |
| Downvotes / corrections | −5 |
| Misinformation flag upheld | −50 |

### Reputation tiers

| Tier | Score | Benefits |
|------|-------|----------|
| **New** | 0–49 | Post, comment |
| **Contributor** | 50–199 | Highlighted in feed |
| **Trusted** | 200–499 | Weighted upvotes; beta features |
| **Expert** | 500+ or credential | Validation badge eligibility |
| **Verified Expert** | Credential + review | Official validation power |

### Expert credentialing

| Path | Requirement |
|------|-------------|
| Professional | Degree in agronomy + license verification |
| Cooperative | Nominated by co-op admin + Nertura review |
| Nertura certified | Complete Nertura agronomy certification program |

---

## Validation Workflow

```
Farmer posts SharedPractice
    → Community upvotes / comments
    → IF upvotes > threshold OR expert flags:
        Expert reviews → Validated / Needs revision / Rejected
    → IF Validated:
        Knowledge Graph: SharedPractice node
        Learning System: promotion queue (with author consent)
        AI Farmer: can cite "847 farmers validated this practice"
    → IF linked harvest outcome confirms:
        Auto-elevated weight
```

AI Agronomist agent cross-checks posts against global corpus — flags contradictions for review.

---

## AI Integration

| Agent | Community role |
|-------|----------------|
| **AI Farmer** | Surfaces relevant community posts in answers; "Farmers in your region also..." |
| **AI Agronomist** | Validates technical claims; drafts expert review summaries |
| **AI Support** | Community guidelines; report handling |
| **Moderation AI** | Pre-screen spam, unsafe chemical advice, off-topic |

Community content **never auto-trains** global corpus without author consent + validation.

---

## Feed Algorithm (Principles)

| Signal | Weight |
|--------|--------|
| Relevance to user's crops/region | Highest |
| Validated / expert content | High |
| Recency | Medium |
| Author reputation | Medium |
| Engagement | Low (avoid viral misinformation) |

No engagement-bait; educational quality over clicks.

---

## Moderation & Safety

| Layer | Action |
|-------|--------|
| **Automated** | Block prohibited content (illegal chemicals, hate, PII) |
| **Community** | Report → queue |
| **Expert** | Technical misinformation review |
| **Staff** | Final appeal; ban |

Agricultural misinformation policy: unverified chemical rates, fake certifications, destructive advice → immediate removal + reputation penalty.

---

## Privacy & Consent

| Rule | Implementation |
|------|----------------|
| Default posts | User's display name + region (not exact farm GPS) |
| Link to field record | Opt-in per post |
| Promote to global learning | Separate checkbox |
| Co-op private space | Not indexed publicly |
| Delete post | Remove from graph; de-index from RAG within 24h |

KVKK/GDPR: community profile is personal data; export and deletion supported.

---

## Gamification (Restrained)

| Mechanic | Purpose |
|----------|---------|
| Seasonal challenges | "Log 4 observations this month" — drives data moat |
| Crop contributor badges | Recognition, not cash |
| Cooperative leaderboard | Member engagement (opt-in) |
| **No** | Cash rewards for posts (avoids spam farms) |

Optional: sponsor-funded credit bonuses for validated practices — see `/product/sponsor-network.md`.

---

## Knowledge Graph Integration

```
User ──AUTHORED──> CommunityPost
CommunityPost ──ABOUT──> CropCatalog
CommunityPost ──TAGGED──> Region
ExpertProfile ──VALIDATED──> SharedPractice
SharedPractice ──SIMILAR_TO──> KnowledgeNode(global)
SharedPractice ──CONFIRMED_BY──> HarvestRecord (optional)
```

---

## Monetization (Community-Adjacent)

| Model | Description |
|-------|-------------|
| **Included** | Public community in Professional+ |
| **Co-op private spaces** | Business tier |
| **Expert marketplace** | Paid consult bookings [future] |
| **Premium content** | Expert courses [future] |
| **Sponsor highlights** | Ethical, labeled — sponsor network |

Core community free for registered users to maximize network density.

---

## Launch Prerequisites

| Prerequisite | Threshold |
|--------------|-------------|
| Registered users | >25,000 |
| Validated labels in Learning System | >500K |
| Moderation team | Staff + expert panel |
| AI moderation | Stage 2 models live |
| Legal | Community guidelines + ToS addendum |

---

## Phased Rollout

| Sub-phase | Scope |
|-----------|-------|
| **5a** | Q&A + practices (public); expert validation pilot |
| **5b** | Co-op private spaces; reputation tiers |
| **5c** | AI-surfaced community in Brain answers |
| **5d** | Expert marketplace; sponsor-validated content |

---

## Success Metrics

| Metric | Year 1 community target |
|--------|-------------------------|
| MAU (% of platform MAU) | >30% |
| Posts / week | >5,000 |
| Validated practices | >10,000 |
| Expert validators | >500 |
| AI answers citing community | >20% |
| Retention lift (community users vs non) | +15% |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Misinformation | Expert layer + AI pre-screen |
| Low engagement | Seed with cooperative pilots |
| Echo chambers | Regional diversity in feed algo |
| Privacy leakage | No GPS default; moderation |
| Spam | Reputation gates; rate limits |

---

*Document owner: Chief AI Platform Architect / Community Product*  
*Last updated: June 2026*  
*Companion: `/ai/data-moat-strategy.md`, `/product/sponsor-network.md`, `/ai/knowledge-graph.md`*
