# Nertura — Social Distribution Engine

> Multi-channel publishing and automation layer for TikTok, Instagram, YouTube Shorts, blog, email, and WhatsApp — approval-first at launch, graduated full-auto for trusted content classes.

---

## Purpose

The **Social Distribution Engine** is the **last mile** of Nertura's growth machine. It receives approved `ContentBundle` packages from the Content Pipeline and executes reliable, measurable, reversible publishing across all channels.

```
Approved ContentBundle
        │
        ▼
┌───────────────────────────────────────┐
│     SOCIAL DISTRIBUTION ENGINE         │
│  Schedule · Publish · Verify · Retry   │
│  Analytics · UTM · Rollback            │
└───────────────────────────────────────┘
        │
   ┌────┴────┬────────┬────────┬────────┬────────┐
   ▼         ▼        ▼        ▼        ▼        ▼
 TikTok  Instagram  YouTube  Blog   Email  WhatsApp
```

**Hard rule (launch):** `publish()` rejects any bundle without `approval_status = approved`.

---

## Engine Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  DISTRIBUTION ENGINE CORE                        │
├─────────────────────────────────────────────────────────────────┤
│  Scheduler        │  Cron + optimal-time algorithm                 │
│  Publisher        │  Channel adapters (6)                          │
│  Verifier         │  Post-publish confirmation                   │
│  Retry            │  Exponential backoff, DLQ                      │
│  Analytics        │  Poll + webhook ingestion                      │
│  Attribution      │  UTM + first-touch signup                      │
│  Rollback         │  Unpublish / delete where API allows           │
│  Mode Controller  │  approval-first vs full-auto per domain        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Channel Adapters

Each adapter implements:

```
validate(bundle) → publish(bundle, account) → verify(external_id) → analytics(external_id)
```

### 1. TikTok automation

| Attribute | Detail |
|-----------|--------|
| **API** | TikTok Content Posting API |
| **Auth** | OAuth 2.0; refresh token encrypted |
| **Formats** | Video 9:16, MP4, H.264 |
| **Caption** | ≤2,200 chars; hashtags inline |
| **Privacy** | Public / followers |
| **Rate limits** | Queue-aware; max posts/day per account |
| **Launch mode** | Manual approval each post |
| **Full-auto** | L1: "Ag tip" template category after trust graduation |

**Publish flow:**

```
bundle.variants.tiktok → upload video → poll processing → publish → store post_id
```

### 2. Instagram automation

| Attribute | Detail |
|-----------|--------|
| **API** | Meta Graph API (Instagram Business) |
| **Products** | Reels, Feed, Carousel |
| **Reels** | Same master video as TikTok (9:16) |
| **Carousel** | Separate image array from bundle |
| **Cross-post** | Optional sync to Facebook Reels |
| **Launch mode** | Approval-first |
| **Full-auto** | L1 Reels; carousels remain L0 longer |

### 3. YouTube Shorts automation

| Attribute | Detail |
|-----------|--------|
| **API** | YouTube Data API v3 `videos.insert` |
| **Category** | #Shorts ≤60s vertical |
| **Metadata** | Title, description, tags, custom thumbnail |
| **Thumbnail** | Required upload separate from video |
| **Playlist** | Auto-add to "Nertura Ag Shorts" |
| **Launch mode** | Approval-first |
| **Full-auto** | L1 after 50 approved Shorts |

### 4. Blog automation

| Attribute | Detail |
|-----------|--------|
| **CMS** | Headless (Markdown → HTML → CDN) |
| **URL** | `nertura.com/blog/{slug}` |
| **SEO** | Sitemap ping, OG tags, JSON-LD Article |
| **RSS** | Feed for email syndication |
| **Launch mode** | Editor approval per post |
| **Full-auto** | L2 evergreen category (e.g., crop guides) |

**Blog adapter extras:**

- Internal link injection to product landing pages
- Canonical URL management
- hreflang for TR/EN/PT/ES versions [Phase 5]

### 5. Email automation

| Attribute | Detail |
|-----------|--------|
| **Provider** | Resend (primary), SendGrid (fallback) |
| **Types** | Newsletter, lifecycle, campaign |
| **Personalization** | Merge tags from CRM |
| **List hygiene** | Unsubscribe honor <48h |
| **Launch mode** | Newsletter: per-issue approval |
| **Full-auto** | Lifecycle/onboarding L2; transactional always auto |

**Segments:**

| Segment | Example send |
|---------|--------------|
| All registered | Weekly newsletter |
| Free tier inactive | Re-engagement |
| New signup | Day 0/1/3/7 drip |
| Cooperative admin | Bulk program report |

### 6. WhatsApp automation

| Attribute | Detail |
|-----------|--------|
| **API** | WhatsApp Business Cloud API |
| **Types** | Template (outbound), session (inbound AI) |
| **Templates** | Pre-approved by Meta |
| **Media** | Image/video header in template |
| **Launch mode** | Campaign approval + template approval |
| **Full-auto** | L2 utility: frost, task reminder, harvest alert |

**Distinction:**

| Flow | Distribution Engine | Brain |
|------|---------------------|-------|
| Outbound template blast | ✓ | Draft only |
| Inbound farmer photo | ✗ | AI diagnosis real-time |

---

## Mode Controller

### Approval-first (Launch — global default)

```python
# Conceptual — not code
if bundle.approval_status != "approved":
    raise PublishBlocked("Approval required")
if org.auto_publish_enabled:
    raise PublishBlocked("Auto disabled at launch")
```

Every publish attempt logged with approver_id.

### Full-auto (Future — per channel × content class)

| Domain key | Example | Enable when |
|------------|---------|-------------|
| `tiktok.ag_tip` | Daily tip reel | L1 trust |
| `instagram.reel.ag_tip` | Same | L1 trust |
| `youtube.shorts.ag_tip` | Same | L1 trust |
| `blog.evergreen` | Crop guide | L2 trust |
| `email.lifecycle` | Onboarding drip | L2 trust |
| `whatsapp.utility.frost` | Frost template | L2 trust |
| `*.sponsor` | Any sponsored | **Never auto** |

Mode Controller checks domain key + trust level before skipping human approval.

### Kill switch

| Level | Action |
|-------|--------|
| Org | Pause all publishing |
| Channel | Pause TikTok only |
| Domain | Pause auto for `tiktok.ag_tip` |
| Global | Nertura incident — stop all auto |

---

## Scheduling

### Optimal time algorithm

| Input | Weight |
|-------|--------|
| Platform best practice | Base |
| Historical engagement | High |
| Region timezone | Required |
| Conflict avoidance | No 2 posts / channel / hour |

Default slots (brand TRT):

| Channel | Slots |
|---------|-------|
| TikTok | 17:00, 19:00 |
| Instagram | 12:00, 18:00 |
| YouTube | 15:00 |
| Blog | Tue/Thu 09:00 |
| Email newsletter | Mon 09:00 |
| WhatsApp utility | Event-driven |

---

## Attribution & UTM

All outbound links:

```
utm_source={channel}
utm_medium={format}
utm_campaign={pipeline_run_id}
utm_content={variant}
```

Signup attribution: first-touch + assisted in analytics warehouse.

---

## Post-publish verification

| Step | Action |
|------|--------|
| 1 | API returns external_id |
| 2 | Poll until live (platform-dependent) |
| 3 | Screenshot/archive URL stored |
| 4 | Status → `published` |
| 5 | Schedule analytics polls +1h, +24h, +7d |

Failure → retry 3× → DLQ → alert on-call + approver.

---

## Analytics ingestion

### DistributionAnalytics

| Metric | Channels |
|--------|----------|
| views, reach | TikTok, IG, YT |
| likes, comments, shares | All social |
| saves | Instagram |
| click-through | Blog, email |
| open/click rate | Email |
| delivered/read | WhatsApp |
| signups | All (UTM) |

Fed back to Content Pipeline intake — self-growing loop.

---

## Rollback & crisis

| Scenario | Action |
|----------|--------|
| Wrong post live | Delete via API if supported; apology template ready |
| Agronomic error discovered | Unpublish + Learning System incident |
| Platform ban risk | Pause channel; review content |
| Auto misfire | Kill switch + revert to L0 |

---

## Account management

### ConnectedAccount entity

| Field | Description |
|-------|-------------|
| `channel` | tiktok, instagram, youtube, blog, email, whatsapp |
| `org_id` | Nertura brand = org 1 |
| `credentials_encrypted` | OAuth tokens |
| `status` | active, expired, revoked |
| `auto_domains` | JSON list of enabled L1/L2 domains |

Connection UI: `/app/settings/integrations/distribution`.

---

## Security & compliance

| Control | Detail |
|---------|--------|
| Token encryption | KMS |
| Publish API | Internal only; RBAC |
| Audit | Every publish: who, what, when, external_id |
| Platform ToS | No engagement bots |
| AI disclosure | #AI or description tag where required |
| Email CAN-SPAM / GDPR | List-Unsubscribe |
| WhatsApp opt-in | Double opt-in enforced |

Policies: `/docs/ai-governance-policy.md`, `/docs/data-ownership-policy.md`.

---

## Enterprise / white-label

Business+ orgs connect own accounts; same engine, tenant-isolated queues; customer approval chain.

---

## Metrics

| Metric | Target |
|--------|--------|
| Publish success rate | >99% |
| Verification latency | <5 min p95 |
| Failed retry recovery | >90% |
| Approval → live time | <10 min |
| Content-attributed CAC | Decreasing QoQ |
| Auto-publish incident rate | 0 at launch |

---

## Phase rollout

| Phase | Channels live |
|-------|---------------|
| **4a** | TikTok + Instagram Reels |
| **4b** | YouTube Shorts + blog |
| **4c** | Email newsletter + WhatsApp utility |
| **5** | Full-auto L1 pilot (weather tips) |
| **6** | L2 lifecycle email + evergreen blog auto |

---

*Document owner: Chief Growth & Intelligence Architect*  
*Last updated: June 2026*  
*Status: Final platform foundation*
