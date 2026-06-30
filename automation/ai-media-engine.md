# Nertura — AI Media Engine

> Internal content production system that researches topics, generates scripts, images, short videos, voiceovers, captions, and hashtags — feeding an approval-first publishing calendar with performance analytics.

---

## Purpose

The AI Media Engine automates **daily agricultural content creation** for Nertura's brand and customer white-label programs. It is not a social scheduler alone — it is an end-to-end **research → create → package → queue** pipeline orchestrated by the Nertura AI Brain.

**Launch constraint:** All output enters the approval queue before any public publish. See `/product/approval-workflow.md`.

---

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AI MEDIA ENGINE                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  1. TOPIC RESEARCH          2. SCRIPT           3. VISUAL               │
│  ┌──────────────┐          ┌──────────────┐    ┌──────────────┐        │
│  │ Trend scan   │─────────►│ Scriptwriter │───►│ Image gen    │        │
│  │ Seasonal     │          │ (Brain)      │    │ DALL·E/Imagen│        │
│  │ Platform fit │          └──────┬───────┘    └──────┬───────┘        │
│  └──────────────┘                 │                   │                 │
│                                   ▼                   ▼                 │
│                          4. VIDEO              5. VOICEOVER             │
│                          ┌──────────────┐    ┌──────────────┐          │
│                          │ Runway/Veo/  │───►│ ElevenLabs/  │          │
│                          │ Kling        │    │ OpenAI/Google│          │
│                          └──────┬───────┘    └──────┬───────┘          │
│                                 │                   │                   │
│                                 └─────────┬─────────┘                   │
│                                           ▼                             │
│                          6. CAPTION + HASHTAGS                          │
│                          ┌──────────────┐                               │
│                          │ Copywriter   │                               │
│                          │ (Brain)      │                               │
│                          └──────┬───────┘                               │
│                                 ▼                                       │
│                          7. APPROVAL QUEUE                              │
│                          ┌──────────────┐                               │
│                          │ Pending      │──► Founder review             │
│                          └──────┬───────┘                               │
│                                 ▼                                       │
│                          8. PUBLISHING CALENDAR                         │
│                          ┌──────────────┐                               │
│                          │ Scheduled    │──► Social automation           │
│                          └──────┬───────┘                               │
│                                 ▼                                       │
│                          9. ANALYTICS                                   │
│                          ┌──────────────┐                               │
│                          │ Performance  │──► Learning loop              │
│                          └──────────────┘                               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Stage 1: Topic Research

### Inputs

| Source | Data |
|--------|------|
| Agricultural calendar | Planting/harvest seasons by region |
| Nertura Learning System | Trending diagnoses, common questions |
| Platform analytics | Top-performing past content |
| External trends | Google Trends, TikTok Creative Center (manual/API) |
| News scan | Brain summarization of ag news RSS |
| Competitor gap | Topics underserved in target markets |

### Output: TopicBrief

| Field | Example |
|-------|---------|
| `title` | "5 signs your corn needs nitrogen before week 8" |
| `audience` | Mid-size corn farmers, LATAM |
| `format` | Reel / Short / Carousel |
| `platforms` | Instagram, TikTok, YouTube Shorts |
| `priority_score` | 0–100 |
| `seasonal_relevance` | Northern hemisphere Jun–Jul |
| `credit_budget` | Estimated MEDIA + VOICE cost |

Daily cron generates 3–5 briefs; human or founder can pin/exclude topics.

---

## Stage 2: Script Writing

Brain invoked with **Media Engine system prompt**:

| Script type | Length | Structure |
|-------------|--------|-----------|
| Reel / Short (30s) | 75–90 words | Hook → 3 points → CTA |
| Carousel (5 slides) | 50 words/slide | Headline + body per slide |
| LinkedIn article | 800 words | Problem → insight → Nertura tie-in |
| YouTube Short | 45s | Hook → demo → subscribe CTA |

### Script metadata

```json
{
  "hook": "Your corn leaves don't lie.",
  "scenes": [
    { "duration_s": 5, "visual": "Close-up yellowing leaf", "voiceover": "..." },
    { "duration_s": 8, "visual": "Field wide shot", "voiceover": "..." }
  ],
  "cta": "Link in bio — free AI crop diagnosis",
  "disclaimer": "General guidance only. Consult local agronomist."
}
```

Scripts stored as `MediaScript` entity; versioned on revision.

---

## Stage 3: Image Generation

| Use case | Provider | Spec |
|----------|----------|------|
| Carousel slides | DALL·E 3 / Imagen | 1080×1080, brand style guide |
| Thumbnail | Same | 1280×720 |
| B-roll stills | Flux API | Photorealistic field imagery |
| Text overlay | Internal compositor | Logo, captions burned in optional |

### Brand guardrails

- Nertura green (#2D6A4F) accent palette
- No identifiable real persons without license
- No fake certification badges
- Stock-style authentic agriculture; avoid uncanny AI faces in field

---

## Stage 4: Short Video Generation

| Provider | Best for | Duration | Cost tier |
|----------|----------|----------|-----------|
| **Runway Gen-3** | Cinematic b-roll, motion | 5–10s clips | High MEDIA credits |
| **Google Veo** | Natural motion, text-to-video | 5–15s | High |
| **Kling** | Fast iteration, stylized | 5s | Medium |

### Assembly workflow

1. Generate per-scene clips from script storyboard
2. FFmpeg compose: clips + transitions + captions
3. Audio track added in Stage 5
4. Export: 9:16 (Reels/TikTok/Shorts), 1:1 (feed), 16:9 (YouTube optional)

Long-running jobs async; status webhook to approval queue when render complete.

---

## Stage 5: Voiceover System

See dedicated section below.

---

## Stage 6: Caption & Hashtag Generation

Brain generates platform-specific copy:

| Platform | Caption rules | Hashtag count |
|----------|---------------|---------------|
| Instagram | 150 chars hook + line breaks | 15–20 mix broad/niche |
| TikTok | Casual, trend-aware, ≤100 chars visible | 3–5 trending + ag |
| YouTube Shorts | Title 60 chars + description SEO | Tags in description |
| Facebook | Longer form OK; link preview | 5–10 |
| LinkedIn | Professional tone; no hashtag spam | 3–5 |

Stored in `SocialPost` entity per platform variant.

---

## Stage 7: Approval Integration

Every completed asset bundle:

```
MediaProductionJob (complete)
    → Create SocialPost records (per platform)
    → Create ApprovalRequest (domain: social)
    → Notify founder via push + email
    → Block scheduling until approved
```

Preview URL: internal CDN signed link; platform mockup in approval UI.

---

## Stage 8: Publishing Calendar

| View | Function |
|------|----------|
| Calendar | Week/month grid; drag reschedule |
| Queue | Approved items awaiting slot |
| Gaps | AI suggests fill topics for empty days |
| Timezone | Per-platform optimal post times |

Default schedule (Nertura brand launch):

| Platform | Frequency | Optimal time (TRT) |
|----------|-----------|-------------------|
| Instagram | 1 feed + 3 reels/week | 12:00, 18:00 |
| TikTok | 5/week | 17:00–20:00 |
| YouTube Shorts | 3/week | 15:00 |
| Facebook | 3/week | 13:00 |
| LinkedIn | 2/week | 09:00 Tue/Thu |

---

## Stage 9: Performance Analytics

| Metric | Source | Feeds back to |
|--------|--------|---------------|
| Views, reach | Platform APIs | Topic research scoring |
| Engagement rate | Likes + comments + shares | Script style tuning |
| Click-through (link in bio) | UTM tracking | CTA optimization |
| Follower delta | Platform APIs | Calendar frequency |
| Save rate (IG) | Instagram API | Content format selection |

Underperforming content (<50% median engagement) flagged for post-mortem; patterns fed to Learning System as `content.outcome` events.

---

## Voiceover System (Detailed)

### Provider Selection

| Provider | Strengths | Use when |
|----------|-----------|----------|
| **ElevenLabs** | Natural emotion, voice clone, multilingual | Brand voice consistency; TR/EN/ES |
| **OpenAI TTS (tts-1-hd)** | Low latency, cost-efficient | English quick turns |
| **Google Cloud TTS (Neural2)** | Broad language coverage | Regional languages, Wavenet quality |

### Routing logic

```
IF language IN elevenlabs_supported AND brand_voice_clone_exists:
    → ElevenLabs (cloned "Nertura Agronomist" voice)
ELIF language IN openai_tts_optimal:
    → OpenAI TTS
ELSE:
    → Google Neural2 (language code match)
```

### Script → Voiceover pipeline

```
1. Script finalized (word count, scene markers)
2. SSML enrichment (pauses, emphasis on key terms)
3. Estimate VOICE credits (1 per 30s rounded up)
4. Reserve credits
5. Provider API: submit text + voice_id + language
6. Receive audio (MP3/WAV) → object storage
7. Quality check: duration match ±10%, no artifacts
8. Attach to video composition OR standalone for podcast [future]
9. Settle credits; log in MediaProductionJob
```

### Voice catalog (Launch)

| Voice name | Provider | Language | Persona |
|------------|----------|----------|---------|
| Nertura Agronomist | ElevenLabs clone | EN, TR | Authoritative, warm |
| Field Expert EN | OpenAI | EN | Neutral professional |
| Regional TR | Google Neural2 | TR | Local trust |

---

## Data Entities

### MediaProductionJob

| Column | Description |
|--------|-------------|
| `id` | UUID |
| `topic_brief_id` | FK |
| `status` | researching, scripting, generating, composing, pending_approval, complete, failed |
| `script_id` | FK |
| `assets` | JSONB: image URLs, video URLs, audio URL |
| `credits_consumed` | Breakdown by type |
| `created_at` | |

### SocialPost

| Column | Description |
|--------|-------------|
| `id` | UUID |
| `production_job_id` | FK |
| `platform` | instagram, tiktok, youtube, facebook, linkedin |
| `post_type` | reel, short, carousel, feed, story |
| `caption` | TEXT |
| `hashtags` | TEXT[] |
| `media_urls` | JSONB |
| `scheduled_at` | TIMESTAMPTZ |
| `published_at` | TIMESTAMPTZ |
| `external_post_id` | Platform ID |
| `approval_status` | Linked to ApprovalRequest |

---

## Credit Consumption (Typical Reel)

| Step | Credits |
|------|---------|
| Topic + script (Brain) | 3 TEXT |
| 3 image frames | 9 MEDIA |
| 2 video clips (10s each) | 30 MEDIA |
| Voiceover 45s | 2 VOICE |
| Captions/hashtags | 1 TEXT |
| **Total** | **~45 credits mixed** |

Budget cap per day configurable; engine pauses when daily MEDIA budget exhausted.

---

## White-Label Mode [Business+]

Organizations configure:

| Setting | Options |
|---------|---------|
| Brand colors / logo | Asset upload |
| Voice | Own ElevenLabs clone |
| Topic focus | Crop types, region |
| Approval chain | Org admin, not Nertura founder |
| Auto-publish level | L0–L2 per `/product/approval-workflow.md` |

---

## Failure Handling

| Failure | Recovery |
|---------|----------|
| Video gen timeout | Retry once; fallback to carousel |
| Voice mismatch duration | Regenerate with adjusted SSML |
| Brand safety block | Flag topic; skip; log |
| Approval timeout 48h | Reminder; auto-expire draft |

---

## Phase Rollout

| Phase | Capability |
|-------|------------|
| **4** | Full pipeline; manual approval; Instagram + TikTok |
| **4b** | YouTube Shorts, Facebook, LinkedIn |
| **5** | White-label; analytics feedback loop |
| **6** | L2 auto-publish for weather tips category |

See `/docs/system-roadmap.md`.

---

*Document owner: Chief Systems Architect / Marketing Engineering*  
*Last updated: June 2026*  
*Companion: `/automation/social-media-automation.md`, `/product/approval-workflow.md`*
