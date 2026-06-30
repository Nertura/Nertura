# Nertura Growth Engine — Architecture Status

> Foundation: Book 05 · Approval-first growth · No auto-send · No auto-publish  
> Last updated: 2025-06-26

## Three engines

| Engine | Admin home | Status |
|--------|------------|--------|
| Mail Outreach | `/growth-ai/outreach`, `/growth-ai/lead-discovery` | **Live (draft + approval)** |
| Social Content | `/growth-ai/content-studio` | **Live (draft + approval UI)** |
| Knowledge Growth | `/knowledge-ingestion`, `/intelligence/knowledge-gaps` | **Live (review queue)** |

## Mail Outreach Engine

**Data:** `leads`, `email_log`, `growth_campaigns`, `growth_suppression_list`, `growth_audit_log`

**Flow:** Discover (SerpAPI/DDG) → AI draft (Claude) → Founder approve → Send (Resend only, approved)

**Compliance:** `do_not_contact`, unsubscribe tokens, suppression list, audit log

**Not yet:** Multi-provider failover, campaign bulk send runner, open/click webhooks

## Social Media Content Engine

**Data:** `media_content_queue` (`draft` → `approved` → `scheduled` → `published`)

**Flow:** Topic → Intelligence Engine → queue → **Onayla/Reddet** in Content Studio → manual publish

**Channels:** TikTok, YouTube Shorts, Instagram Reels, LinkedIn, X, Facebook (script/caption formats)

**Not yet:** Auto-publish, platform APIs, image/video generation, calendar scheduler execution

## Knowledge Growth Engine

**Data:** `knowledge_ingestion_items`, `knowledge_review_queue`, `knowledge_articles`

**Flow:** Source run → review queue → expert approve → KB publish

**Gaps UI:** `/intelligence/knowledge-gaps` (read-only from `ai_analyses` heuristics)

**Not yet:** Gap → one-click ingestion ticket, zero-hit query table

## Non-negotiables (Foundation)

- Founder approval before any outbound email or public content
- Rate limits enforced in `growth_settings`
- All actions logged in `growth_audit_log`
- No scraping of private emails; public institutional contacts only
