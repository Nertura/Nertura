# Nertura — Social Media Automation

> Multi-platform publishing layer for AI-generated and approved content. Instagram, TikTok, YouTube Shorts, Facebook, and LinkedIn — with approval-first governance and a path to autonomous publishing.

---

## Purpose

Social Media Automation connects the AI Media Engine's approved assets to platform APIs for scheduled publishing, engagement monitoring, and performance feedback — without bypassing human approval at launch.

---

## Supported Platforms

| Platform | Content types | API approach | Phase |
|----------|---------------|--------------|-------|
| **Instagram** | Reels, Feed, Carousel, Stories | Meta Graph API | 4 |
| **TikTok** | Video posts | TikTok Content Posting API | 4 |
| **YouTube Shorts** | Shorts (≤60s vertical) | YouTube Data API v3 | 4 |
| **Facebook** | Page posts, Reels | Meta Graph API | 4b |
| **LinkedIn** | Page posts, articles | LinkedIn Marketing API | 4b |

---

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  AI Media Engine │────►│ Approval Queue   │────►│ Publish Scheduler│
│  (draft assets)  │     │ (founder sign-off)│     │ (cron + queue)   │
└──────────────────┘     └──────────────────┘     └────────┬─────────┘
                                                            │
                    ┌───────────────────────────────────────┼───────────┐
                    ▼           ▼           ▼               ▼           ▼
               Instagram    TikTok    YouTube          Facebook   LinkedIn
                    │           │           │               │           │
                    └───────────┴───────────┴───────────────┴───────────┘
                                            │
                                    ┌───────▼────────┐
                                    │ Analytics      │
                                    │ Ingestion      │
                                    └────────────────┘
```

---

## Account Connection

### OAuth flow (`/app/settings/integrations/social`)

| Step | Action |
|------|--------|
| 1 | User clicks "Connect Instagram" |
| 2 | OAuth redirect to Meta / TikTok / Google / LinkedIn |
| 3 | Grant permissions: publish, read insights |
| 4 | Store encrypted refresh token in `SocialAccount` |
| 5 | Verify test post to sandbox (optional) |

### SocialAccount entity

| Column | Description |
|--------|-------------|
| `organization_id` | Owner (Nertura brand = org_id 1) |
| `platform` | ENUM |
| `account_name` | Display |
| `external_account_id` | Platform ID |
| `token_encrypted` | Refresh token |
| `token_expires_at` | |
| `scopes` | TEXT[] |
| `status` | active, expired, revoked |
| `auto_publish_level` | L0–L4 per approval doc |

---

## Publishing Workflow

```
SocialPost (approval_status = approved)
    AND scheduled_at <= NOW()
    AND social_account.status = active
        → PublishJob queued
        → Platform adapter uploads media
        → Platform returns external_post_id
        → SocialPost.published_at = NOW()
        → ApprovalRequest.status = published
        → Analytics polling scheduled (+1h, +24h, +7d)
```

### Platform adapters

Each adapter implements:

```
publish(post: SocialPost, account: SocialAccount) → PublishResult
getAnalytics(external_post_id) → AnalyticsSnapshot
refreshToken(account) → Token
validateMedia(spec) → ValidationResult
```

---

## Media Specifications

| Platform | Video | Image | Max duration |
|----------|-------|-------|--------------|
| Instagram Reel | 9:16, MP4, H.264 | — | 90s |
| Instagram Carousel | — | 1:1 or 4:5, JPG | 10 slides |
| TikTok | 9:16, MP4 | — | 10 min (Shorts: 60s) |
| YouTube Shorts | 9:16, MP4 | — | 60s |
| Facebook Reel | 9:16, MP4 | — | 90s |
| LinkedIn | 16:9 or 1:1 | 1200×627 | 10 min |

Media Engine export profile matches target platform batch.

---

## Scheduling Rules

| Rule | Behavior |
|------|----------|
| No duplicate cross-post within 1h | Stagger same asset across platforms |
| Timezone | Account default or per-post override |
| Blackout dates | Configurable (e.g., market holidays) |
| Rate limits | Respect platform API quotas; queue backoff |
| Failed publish | 3 retries; alert admin; hold slot |

---

## Approval-First (Launch — L0)

| Rule | Enforcement |
|------|-------------|
| No API publish without `approved` status | Hard gate in PublishJob |
| Founder notification | Push on every pending social item |
| Emergency unpublish | Manual via platform + mark failed in Nertura |

---

## Auto-Publish Path (Future — L1+)

| Level | Social behavior |
|-------|-----------------|
| **L0** | 100% manual approval (launch) |
| **L1** | Pre-approved templates (e.g., "Daily weather tip") auto-publish |
| **L2** | Category-based: educational auto; promotional manual |
| **L3** | AI publishes all; 10% random human audit sample |
| **L4** | Full autonomous; anomaly alerts only |

Graduation criteria: `/product/approval-workflow.md`.

---

## Engagement Monitoring [Phase 4b]

| Signal | Action |
|--------|--------|
| Comment with question | Route to CRM or AI draft reply (approval) |
| Negative sentiment spike | Pause auto-publish; alert |
| Viral post (>10× median) | Boost topic cluster in Media Engine |
| DM with "help" keyword | WhatsApp handoff CTA [Phase 5] |

---

## Analytics Ingestion

### SocialPostAnalytics

| Column | Description |
|--------|-------------|
| `social_post_id` | FK |
| `snapshot_at` | Poll timestamp |
| `views` | |
| `reach` | |
| `likes` | |
| `comments` | |
| `shares` | |
| `saves` | |
| `click_through` | UTM derived |
| `engagement_rate` | Computed |

Polled at +1h, +24h, +7d post-publish. Fed to AI Media Engine topic research.

---

## UTM & Attribution

All link-in-bio and caption links:

```
https://nertura.com/register?utm_source=instagram&utm_medium=reel&utm_campaign={post_id}
```

Connects social → registration → credit purchase in analytics warehouse.

---

## Compliance

| Requirement | Implementation |
|-------------|----------------|
| #ad / sponsored disclosure | Template flag on promotional posts |
| Platform ToS | No automated engagement bots at launch |
| Music licensing | Royalty-free library only; document track ID |
| AI disclosure | "Created with AI assistance" in LinkedIn; optional IG |
| Regional restrictions | Geo-block config per platform |

---

## White-Label Publishing

Business+ orgs connect own social accounts; Media Engine uses org brand kit; approval chain is org admin — Nertura platform not in loop.

---

## Error Catalog

| Error | User-facing | Retry |
|-------|-------------|-------|
| Token expired | "Reconnect Instagram" | After reconnect |
| Media spec rejected | Show platform error + fix guide | Manual fix |
| Rate limited | Silent queue delay | Auto |
| Content policy | Reject with reason; approval → revision | No auto retry |

---

*Document owner: Chief Systems Architect / Marketing Engineering*  
*Last updated: June 2026*  
*Companion: `/automation/ai-media-engine.md`, `/product/approval-workflow.md`*
