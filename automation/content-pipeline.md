# Nertura — Content Pipeline

> End-to-end content lifecycle from intelligence intake through production, approval, and handoff to distribution — the operational backbone of Nertura as a self-growing AI company.

---

## Purpose

The **Content Pipeline** defines how ideas become published assets across **TikTok, Instagram, YouTube Shorts, blog, email, and WhatsApp**. It connects Brain intelligence, Media Factory production, approval governance, and the Social Distribution Engine into one repeatable system.

---

## Pipeline Overview

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  INTAKE  │──►│  PLAN    │──►│  CREATE  │──►│  REVIEW  │──►│  APPROVE │──►│  SHIP    │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
     │              │              │              │              │              │
 Intelligence   Calendar      Text→Image      QA + Human     Approval      Distribution
 Trends         Briefs        →Voice→Video     Agronomic      Workflow      Engine
 SEO gaps       Credits       Package          Brand          (launch)      (channels)
```

**Modes:**
- **Launch:** REVIEW + APPROVE mandatory for all public outputs
- **Future:** SHIP auto for graduated content classes (see Full-auto matrix)

---

## Stage 1 — Intake

### Intelligence sources

| Source | Signal | Feeds |
|--------|--------|-------|
| Learning System | Top farmer questions this week | Blog, Reels |
| Diagnosis trends | Rising rust in TR-Central | TikTok series |
| Social analytics | Low engagement on irrigation content | Topic pivot |
| SEO tool | "corn nitrogen deficiency" volume | Blog pillar |
| Seasonal calendar | Planting window LATAM | All channels |
| Sponsor campaign | Sponsor-funded credit push | Labeled content |
| Brain daily digest | AI Content Director summary | Editorial meeting |

### Intake record: ContentOpportunity

| Field | Example |
|-------|---------|
| `title` | "5 signs corn needs nitrogen week 8" |
| `priority_score` | 87/100 |
| `channels` | tiktok, instagram, youtube, blog |
| `regions` | TR, BR |
| `crops` | corn |
| `estimated_credits` | 45 MEDIA + 3 TEXT |
| `sponsor_id` | optional |

Daily intake cron: 5–10 opportunities ranked; human may pin/reject in approval UI.

---

## Stage 2 — Plan

### AI Content Director actions

1. Select opportunities within credit budget
2. Assign production line (Media Factory)
3. Slot editorial calendar (date, time, channel)
4. Assign model routing hints (script → Claude, visuals → Runway)
5. Create `ContentPipelineRun` parent job

### Editorial calendar views

| View | Horizon |
|------|---------|
| Week grid | 7 days × channels |
| Blog queue | 4-week SEO pipeline |
| Email cadence | Lifecycle + newsletter |
| WhatsApp campaigns | Template approval dates |

---

## Stage 3 — Create (Text → Image → Voice → Video → Package)

### Modality sequence

```
TEXT (script, blog, email, captions)
    │
    ├──► IMAGE (thumbnails, carousels, blog hero)
    │
    ├──► VOICE (voiceover from script)
    │
    ├──► VIDEO (compose clips + audio + captions)
    │
    └──► PACKAGE (per-channel bundles)
```

### Text generation

| Output | Model routing | Agent |
|--------|---------------|-------|
| Reel script | Claude 3.5 | AI Content Director |
| Blog draft | Claude 3.5 | AI Content Director |
| Email copy | GPT-4o | AI Content Director |
| Captions/hashtags | GPT-4o | AI Social Manager |
| WhatsApp template | Gemini (TR/PT) | AI CRM Manager |
| SEO meta | GPT-4o | AI Content Director |

### Image generation

| Use | Provider | Spec |
|-----|----------|------|
| Reel thumbnail | DALL·E 3 | 9:16 |
| Carousel slides | Imagen / DALL·E | 1:1 |
| Blog hero | Flux / DALL·E | 16:9 |
| OG social image | Template compositor | 1200×630 |

### Voice generation

Voice Cloning System — `/ai/voice-cloning-system.md`.

### Video generation

| Step | Tool |
|------|------|
| Scene clips | Runway / Veo / Kling |
| Assembly | FFmpeg + caption burn |
| Captions | SRT → hardsub for Reels/Shorts |

### Package assembly

One `ContentBundle` per pipeline run:

```json
{
  "pipeline_run_id": "...",
  "assets": {
    "master_video_9x16": "url",
    "master_video_1x1": "url",
    "voiceover": "url",
    "thumbnail": "url"
  },
  "variants": {
    "tiktok": { "caption": "...", "hashtags": [], "video": "..." },
    "instagram_reel": { "caption": "...", "hashtags": [], "video": "..." },
    "youtube_short": { "title": "...", "description": "...", "video": "..." },
    "blog": { "markdown": "...", "meta": {}, "hero": "..." },
    "email": { "subject": "...", "html": "...", "segment": "..." },
    "whatsapp": { "template_name": "...", "params": [] }
  }
}
```

---

## Stage 4 — Review (Automated QA)

| Check | Method | Fail action |
|-------|--------|-------------|
| Agronomic accuracy | AI Agronomist agent scan | Block + flag |
| Brand voice | Style embedding similarity | Regenerate |
| Toxicity / policy | Provider moderation + custom rules | Block |
| Sponsor disclosure | Regex + metadata | Block if missing |
| Duplicate content | Embedding similarity to last 30d | Warn or block |
| Media specs | FFprobe validation | Re-render |
| Plagiarism (blog) | External check API | Human review |

Status → `pending_approval` if all automated gates pass.

---

## Stage 5 — Approve (Launch mode)

### Human review surfaces

| Channel bundle | Preview | Approver |
|----------------|---------|----------|
| TikTok / IG / YT | In-app mockup + video player | Founder/marketing |
| Blog | Rendered preview + SEO panel | Editor |
| Email | Inbox preview + segment count | Marketing admin |
| WhatsApp | Template preview + recipient count | Admin |

Actions: Approve · Approve with edits · Reject · Request revision (re-enter CREATE at defined stage)

See `/product/approval-workflow.md`.

---

## Stage 6 — Ship

Handoff to **Social Distribution Engine** with `approved` token.

| Channel | Ship method |
|---------|-------------|
| TikTok | Distribution API |
| Instagram | Meta Graph API |
| YouTube Shorts | YouTube Data API |
| Blog | CMS publish (headless) |
| Email | Resend/SendGrid batch |
| WhatsApp | Meta Business API template send |

Post-ship: schedule analytics polling; attach UTM parameters.

---

## Channel-Specific Pipeline Notes

### TikTok automation

| Element | Spec |
|---------|------|
| Format | 9:16, 15–60s, captions on |
| Posting | 1–2/day peak hours local |
| Hashtags | 3–5; mix trending + ag |
| Mode launch | Approval-first |
| Mode future | L1 auto for "Ag tip" category |

### Instagram automation

| Element | Spec |
|---------|------|
| Formats | Reels (primary), carousel, feed |
| Cross-post | Reel from master video; carousel separate line |
| Stories | Manual or Phase 5 |
| Approval | Same queue as TikTok |

### YouTube Shorts automation

| Element | Spec |
|---------|------|
| Title | ≤60 chars, keyword front |
| Description | Tags + link nertura.com/register |
| Thumbnail | Custom upload required |
| #Shorts | In title or description |

### Blog automation

| Element | Spec |
|---------|------|
| CMS | Headless (Markdown → HTML) |
| SEO | Schema.org Article, sitemap ping |
| Frequency | 2–3/week launch |
| Internal links | Auto-link to crop landing pages |
| Approval | Editor required at launch |

### Email automation

| Type | Approval |
|------|----------|
| Transactional | Auto (no marketing content) |
| Lifecycle drip | L2 auto after template approval |
| Newsletter | Human approve each issue (launch) |
| AI outreach | Always approve if >10 recipients |

See `/automation/email-engine.md`.

### WhatsApp automation

| Type | Approval |
|------|----------|
| Utility templates (frost, task) | Meta pre-approve + admin enable |
| Marketing broadcast | Admin approve each campaign (launch) |
| AI session replies | Auto in 24h window (operational) |

See `/automation/whatsapp-integration.md`.

---

## Full-auto graduation matrix

| Content type | L0 Launch | L1 | L2 | L3 |
|--------------|-----------|----|----|-----|
| TikTok ag tips | Manual | Template auto | Category auto | — |
| IG Reels (same) | Manual | Template auto | Category auto | — |
| YouTube Shorts | Manual | Template auto | — | — |
| Blog evergreen | Manual | — | Category auto | — |
| Newsletter | Manual | — | Manual | Segmented auto |
| WhatsApp frost alert | Manual template | Auto send | Auto send | — |
| WhatsApp marketing | Manual | Manual | Manual | — |
| Sponsor content | **Always manual** | **Always manual** | — | — |

Graduation criteria: `/product/approval-workflow.md` trust levels.

---

## Pipeline state machine

```
intake → planned → creating → qa_passed → pending_approval
    → approved → scheduled → publishing → published → analytics_complete
    → failed / rejected / revision (loop to creating)
```

---

## Credits flow

| Stage | Credit types |
|-------|--------------|
| Plan + script | TEXT |
| Images + video | MEDIA |
| Voice | VOICE |
| Email send | WA if applicable |
| Publish | No AI credit (API cost only) |

Logged on `ContentPipelineRun` for unit economics.

---

## Observability

| Dashboard | KPIs |
|-----------|------|
| Pipeline throughput | Jobs/day by line |
| Bottleneck | Stage with longest dwell time |
| Approval queue | Depth, age |
| Channel performance | Signups per pipeline_run_id |
| Auto vs manual | Publish mix over time |

---

## Integration map

| System | Role |
|--------|------|
| Brain Architecture | Model routing, agents |
| Media Factory | Production workers |
| Voice Cloning | Audio assets |
| Distribution Engine | Publish execution |
| Approval Workflow | Human gates |
| Learning System | Intake signals |
| Credit System | Metering |

---

*Document owner: Chief Growth & Intelligence Architect*  
*Last updated: June 2026*  
*Status: Final platform foundation*
