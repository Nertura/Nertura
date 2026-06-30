# Nertura — Media Factory

> Industrial-scale content production facility for a self-growing AI company — orchestrating text, image, voice, and video generation into publish-ready packages across every growth channel.

---

## Purpose

The **Media Factory** is Nertura's internal **content manufacturing plant**. It transforms intelligence (Learning System trends, Brain insights, seasonal calendars) into daily media inventory — not ad hoc creative work.

```
Intelligence in  →  Factory produces  →  Approval (launch)  →  Distribution out
```

**Launch mode:** Approval-first — nothing ships without human sign-off.  
**Future mode:** Full-auto by content class — see Operating Modes below.

**Companion docs:** `/automation/content-pipeline.md`, `/automation/social-distribution-engine.md`, `/ai/voice-cloning-system.md`, `/automation/ai-media-engine.md`.

---

## Factory Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         NERTURA MEDIA FACTORY                            │
├─────────────────────────────────────────────────────────────────────────┤
│  INTAKE          │  Learning trends · SEO gaps · Social analytics       │
│                  │  · Seasonal calendar · Sponsor campaigns              │
├──────────────────┼──────────────────────────────────────────────────────┤
│  PLANNING        │  AI Content Director · Editorial calendar · Budget    │
├──────────────────┼──────────────────────────────────────────────────────┤
│  PRODUCTION      │  Text → Image → Voice → Video → Package             │
├──────────────────┼──────────────────────────────────────────────────────┤
│  QUALITY         │  Brand check · Safety · Legal · Agronomic review      │
├──────────────────┼──────────────────────────────────────────────────────┤
│  GOVERNANCE      │  Approval queue · Credit metering · Audit trail       │
├──────────────────┼──────────────────────────────────────────────────────┤
│  OUTPUT          │  Channel bundles → Distribution Engine                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Production Lines

### Line 1 — Short-form video (TikTok, Reels, Shorts)

| Stage | Output | Models/tools |
|-------|--------|--------------|
| Topic + script | 30–60s script, storyboard | Claude / GPT via Brain |
| Visuals | B-roll clips, thumbnails | Runway, Veo, Kling, DALL·E |
| Voice | MP3 voiceover | Voice Cloning System |
| Compose | 9:16 MP4, captions burned | FFmpeg assembly |
| Package | Caption + hashtags per platform | Brain copywriter |

**Daily target (scale):** 3–5 short videos/day (brand); approval-first at launch.

### Line 2 — Static / carousel (Instagram, Facebook, LinkedIn)

| Stage | Output |
|-------|--------|
| Script | Slide copy |
| Design | 1080×1080 or 4:5 images |
| Package | Carousel PDF/PNG set + caption |

### Line 3 — Blog (SEO growth engine)

| Stage | Output |
|-------|--------|
| Keyword research | Target cluster |
| Outline | H2/H3 structure |
| Draft | 1,200–2,000 word article |
| Meta | Title, description, schema |
| Assets | Hero image + inline diagrams |
| Audio optional | Blog narration embed |

### Line 4 — Email (lifecycle + newsletter)

| Stage | Output |
|-------|--------|
| Segment | Audience cohort |
| Subject lines | 3 variants A/B |
| Body | HTML + plain text |
| Personalization | `{{first_name}}`, crop context |

### Line 5 — WhatsApp (growth + retention)

| Stage | Output |
|-------|--------|
| Template draft | Meta-approved template copy |
| Media | Optional image/video snippet |
| Trigger | Campaign rules |

---

## Media Generation Stack

| Modality | Primary providers | Nertura future |
|----------|-------------------|----------------|
| **Text** | Claude, GPT-4o, Gemini | Nertura Ag LLM |
| **Image** | DALL·E 3, Imagen 3, Flux | Fine-tuned style LoRA |
| **Voice** | ElevenLabs, OpenAI TTS, Google | Nertura TTS |
| **Video** | Runway Gen-3, Veo, Kling | Scene templates + CNN b-roll |
| **Publishing** | Distribution Engine | — |

Detailed routing: `/ai/brain-architecture.md`.

---

## Factory Job Model

### MediaFactoryJob

| Field | Description |
|-------|-------------|
| `job_id` | UUID |
| `production_line` | short_video, carousel, blog, email, whatsapp |
| `status` | intake, planning, producing, qa, pending_approval, approved, shipped, failed |
| `topic_brief` | JSON |
| `assets` | script, images[], audio, video, captions |
| `credits_consumed` | TEXT, MEDIA, VOICE breakdown |
| `approval_id` | FK |
| `channel_targets` | tiktok, instagram, youtube, blog, email, whatsapp |
| `created_at` | |

Jobs async; worker pool scales on queue depth.

---

## Quality Gates (Every Job)

| Gate | Owner | Block publish if fail |
|------|-------|----------------------|
| **Brand** | Style guide match | Yes |
| **Safety** | No harmful ag advice | Yes |
| **Agronomic** | AI Agronomist agent review flag | Yes if high risk |
| **Legal** | Sponsor label, AI disclosure | Yes |
| **Technical** | Resolution, duration, LUFS | Yes |
| **Human** | Approval workflow [launch] | Yes |

---

## Credit & Budget Governance

| Control | Setting |
|---------|---------|
| Daily MEDIA budget cap | Configurable (e.g., 500 credits/day) |
| Per-job estimate | Shown before production start |
| Over-budget | Queue pauses; alert ops |
| Sponsor pool | Can fund factory runs — `/product/sponsor-network.md` |

---

## Operating Modes

### Mode A — Approval-first (Launch)

```
Factory produces → QA → Pending Approval → Human approves → Distribution Engine
```

| Role | Approver |
|------|----------|
| Nertura brand social | Founder / marketing lead |
| Blog | Editor |
| Email campaign | Marketing admin |
| WhatsApp broadcast | Admin + Meta template pre-approval |
| White-label | Customer admin |

No cron may call Distribution Engine publish API without `approved` status.

### Mode B — Full-auto (Future phases)

| Content class | Auto eligibility | Guardrails |
|---------------|------------------|------------|
| Weather tip reel | L1 after 50 approvals | Template + region lock |
| Crop fact carousel | L1 | Pre-approved slide master |
| Blog (evergreen) | L2 | SEO category whitelist |
| Onboarding email drip | L2 | Transactional/lifecycle only |
| WhatsApp frost reminder | L2 | Meta template only |
| Promotional / sponsor | Never full-auto | Always human |
| New topic category | Never until graduated | — |

Global **AUTO_PUBLISH_ENABLED** flag per org; default false.

Kill switch: one click pauses all auto pipelines.

---

## Self-Growing Factory Loop

```
Social/blog performance data
    → Learning System tags high-performing topics
    → Content Director prioritizes similar briefs
    → Factory produces more of what converts
    → Signups ↑ → operational data ↑ → smarter topic selection
```

Factory throughput scales with revenue — not headcount.

---

## White-Label Factory [Business+]

| Feature | Description |
|---------|-------------|
| Brand kit | Colors, logo, fonts, voice |
| Topic focus | Crops, regions |
| Approval chain | Customer admin |
| Output | Same production lines, isolated tenant |

---

## Infrastructure

| Component | Spec |
|-----------|------|
| Job queue | Redis/SQS; priority lanes per line |
| Workers | CPU (compose) + GPU (video gen) pools |
| Storage | S3-compatible; CDN for previews |
| Preview | Signed URLs for approval UI |

---

## Metrics

| Metric | Launch target | Scale target |
|--------|---------------|--------------|
| Jobs completed / week | 20 | 200+ |
| Approval SLA | <24h | <4h |
| QA first-pass rate | >80% | >92% |
| Cost per short video | <$8 credits equiv | <$5 |
| Content-attributed signups | Track via UTM | 15% of new users |

---

## Phase Rollout

| Phase | Factory capability |
|-------|-------------------|
| **4a** | Short video + IG carousel; manual approval |
| **4b** | Blog line + email newsletter |
| **4c** | WhatsApp template factory |
| **5** | White-label; performance loop automated |
| **6** | L1/L2 auto-publish domains live |

---

*Document owner: Chief Growth & Intelligence Architect*  
*Last updated: June 2026*  
*Status: Final platform foundation*
