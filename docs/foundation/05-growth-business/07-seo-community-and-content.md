# Chapter 07 — SEO, Community & Content

## Purpose

Define how Nertura **earns organic discovery and community trust** through content — with strict guardrails that AI generates **drafts only** and humans publish. No auto-posting, no SEO spam, no treatment advice without review.

---

## Principles

1. **Draft-only by default** — Content engine writes to review queue; `auto_publish: false` always.
2. **Knowledge Bank grounding** — Public content cites agricultural sources; gaps flagged for expert review.
3. **SEO serves growers** — Answer real crop questions; don't chase vanity keywords.
4. **Community is support, not growth hack** — Forum/community deferred until product retention is stable.
5. **Neutral advisor in public content** — No input promotions, affiliate links, or marketplace CTAs.
6. **Founder voice at MVP** — Manual social until approval pipeline proves quality at scale.

---

## Architecture / Structure

### Content engine (live)

**Admin UI:** `apps/admin/src/app/content-engine/page.tsx`  
**API:** `POST /api/content-engine/generate`  
**Intelligence:** `runContentIntelligence` in `@nertura/ai` (`packages/ai/src/content-engine.ts`)

```
Topic input (e.g. "Wheat yellowing in Mediterranean climate")
    → For each selected format:
        → Knowledge Bank search + evidence cards
        → Intelligence Engine (Gemini) OR knowledge-only fallback
        → Insert media_content_queue
            status: 'draft'
            metadata: {
              review_pending: true,
              auto_publish: false,
              citations: [...],
              evidence_cards: [...]
            }
    → Return count — NO publish API called
```

**Supported formats** (admin multi-select):

| Format ID | Output type |
|-----------|-------------|
| `blog` | Long-form SEO article |
| `newsletter` | Subject + body |
| `youtube_long_outline` | Section outline |
| `youtube_shorts` | Spoken script |
| `tiktok_script` | Short-form script |
| `reels_script` | Instagram Reels |
| `instagram_caption` | Caption + hashtags |
| `instagram_carousel` | Slide script |
| `linkedin` | B2B post |
| `x_post` | Thread |
| `facebook_post` | Community post |
| `pinterest_pin` | Pin copy |
| `podcast_script` | Audio script |
| `push_notification` | Short alert copy |
| `email_draft` | Campaign draft |
| `thumbnail_text` | Video thumbnail |
| `seo_metadata` | Title, description, keywords |

UI copy confirms: *"Created N draft(s) — review queue only, no auto-publish."*

### Review queue

**Table:** `media_content_queue` (skeleton from `20250621000000_ai_doctor_foundation.sql`)

| Column | Purpose |
|--------|---------|
| `platform` | blog, tiktok, instagram_reels, youtube_shorts, email |
| `title` | Generated title |
| `script` | Full draft body |
| `status` | Always `'draft'` on creation — manual promotion to publish |
| `metadata.review_pending` | `true` until founder marks reviewed |
| `metadata.auto_publish` | **`false`** — enforced in generate route |
| `metadata.citations` | Knowledge Bank slugs for fact-check |

**Publish workflow (manual):**

```
Generate drafts → Founder reviews in Content Engine admin
    → Edit script, verify citations
    → Copy to clipboard OR future: approve → schedule
    → Manual post to platform OR CMS publish
```

No n8n/social API auto-post at MVP/L0. Future V3 adds schedule **after** approval gate ([marketing-growth-system](../../marketing-growth-system.md)).

### Content intelligence quality rules

From `content-engine.ts`:

- Every draft includes `DOCTOR_DISCLAIMER` footer
- Treatment/pesticide content flagged: *"Do not publish treatment or pesticide dosage without expert review."*
- Knowledge-only fallback when Gemini unavailable — still draft, still review-required
- Citations block lists Knowledge Bank matches with confidence scores
- Missing citations: *"No Knowledge Bank matches — expert review required before publish."*

### SEO strategy

| Layer | Phase | Approach |
|-------|-------|----------|
| **Technical SEO** | MVP | Marketing site Next.js, meta tags, sitemap, Core Web Vitals |
| **Programmatic crop pages** | V2 | Knowledge Bank → static crop/problem pages (human-reviewed) |
| **Blog** | V2 | Content engine drafts → editor review → publish |
| **YouTube SEO** | V3 | Shorts scripts from engine; manual record + upload |
| **Local SEO (TR)** | V2 | TR language pages, regional crop terms |

**Target keywords (examples — not exhaustive):**

- Problem-intent: *"wheat yellow leaves causes"*, *"tomato leaf curl greenhouse"*
- Product-intent: *"AI crop diagnosis"*, *"agriculture photo analysis"*
- Avoid: generic *"farm management software"* — wrong category

**UTM on all outbound content links:**

| Parameter | Convention |
|-----------|------------|
| `utm_source` | tiktok, instagram, blog, newsletter |
| `utm_medium` | social, organic, email |
| `utm_campaign` | frost_series_2026, wheat_guide |

Stored on signup: `users.utm_attribution` JSONB.

### Community strategy

| Channel | Phase | Role |
|---------|-------|------|
| **Support email** | MVP | support@ — human response |
| **Community forum** | V3+ | Peer Q&A — moderated, not primary support |
| **Social comments** | MVP | Founder manual response |
| **Cooperative groups** | V2 | WhatsApp utility tips (consent, approval) |
| **User-generated cases** | Never public default | Field data is private — no social sharing without explicit export |

Community builds **trust**, not viral loops. No "share your diagnosis" gamification without privacy review.

### MVP marketing deliverables

From marketing-growth-system checklist:

- [ ] Homepage with conversion tracking (GA4)
- [ ] Pricing page with Stripe checkout links
- [ ] UTM capture on registration
- [ ] Legal pages (terms, privacy, AI disclaimer)
- [ ] Founder manual social — 2 posts/week
- [ ] No calendar automation until V2

---

## Decision Rationale

### Why draft-only content engine?

One auto-published wrong fungicide rate on a 50k-follower account is catastrophic. The generate route hardcodes `auto_publish: false` in metadata — not configurable from client request. Publishing is a separate human action outside the API.

### Why Knowledge Bank citations in marketing content?

SEO content without agricultural grounding is indistinguishable from AI spam — and Google farmers trust even less than Google algorithms. Citations force reviewer accountability.

### Why defer community forum?

Forums require moderation, medical/agricultural liability review, and support staff — premature before Doctor retention proves people return for **product** not **forum**.

---

## Examples

### Good content workflow

1. Admin enters topic: *"Early wheat rust identification"*
2. Selects: blog, instagram_carousel, youtube_shorts
3. Engine generates 3 drafts with citations to `wheat-rust` knowledge slug
4. Agronomist-founder edits treatment section, removes dosage specifics
5. Blog published to CMS; carousel copied to Instagram manually

### Bad content workflow

1. Engine generates 50 posts
2. Cron auto-posts to TikTok without review
3. One post recommends wrong chemical concentration

### Good SEO article opening

*"Yellow rust (Puccinia striiformis) appears first on older leaves as bright yellow stripes. Before treating, confirm it's not nitrogen deficiency — which shows differently on new growth. Here's a five-point field check you can do in ten minutes."*

### Bad SEO article opening

*"In today's fast-paced agtech landscape, leveraging AI-powered solutions can transform your yield optimization journey."*

---

## Best Practices

- Review every draft for regional applicability (Mediterranean ≠ Midwest).
- Add `seo_metadata` format pass before blog publish for title/description.
- Link to public AI disclaimer page from all treatment-adjacent content.
- Track content → signup path in GA4 weekly.
- Repurpose one expert-reviewed blog into carousel + short — not 15 thin variants.
- Keep `media_content_queue` as audit trail even after manual publish.

## Bad Practices

- Auto-publish from `media_content_queue` via cron (forbidden at L0).
- Keyword stuffing crop names without useful content.
- Copying competitor agtech blog posts into content engine topics.
- Public content with specific product brand endorsements.
- SEO landing pages that promise guaranteed yields.

---

## Future Considerations

| Feature | Phase |
|---------|-------|
| CMS integration (blog publish API) | V2 — still approval-gated |
| n8n: approved → Buffer/Late API | V3 |
| Programmatic crop problem pages from Knowledge Bank | V2 |
| Content-attributed signup target 15% Year 1 | Post–Media Factory |
| Graduated auto-publish L1/L2 | V3 — 50+ approved posts per domain |
| Image/video generation in pipeline | V3 — placeholders today |

---

## Cross-References

- [Brand Voice & Marketing](04-brand-voice-and-marketing.md)
- [Notifications & Email](06-notifications-and-email.md)
- [Analytics & KPIs](08-analytics-and-kpis.md)
- Code: `apps/admin/src/app/api/content-engine/generate/route.ts`
- Code: `packages/ai/src/content-engine.ts`
- Legacy: [`docs/marketing-growth-system.md`](../../marketing-growth-system.md)
