# Nertura — WhatsApp Integration

> WhatsApp Business API architecture for AI-powered crop diagnosis, operational reminders, CRM messaging, and conversational assistant access — credit-metered and consent-gated.

---

## Purpose

WhatsApp is the **primary field channel** for farmers in emerging markets. Nertura meets users where they already communicate — with the same AI Brain, learning loop, and operational context as web and mobile.

---

## Architecture Overview

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Farmer     │────►│  Meta WhatsApp   │────►│ Nertura WA      │
│  WhatsApp   │◄────│  Business API    │◄────│ Webhook Service │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                      │
                              ┌────────────────────────┼────────────────┐
                              ▼                        ▼                ▼
                        User mapping            AI Brain           CRM / Tasks
                        Opt-in consent          Credit gate        Notifications
```

---

## WhatsApp Business API Setup

| Component | Provider | Notes |
|-----------|----------|-------|
| **BSP** | Meta Cloud API (direct) or Twilio/MessageBird | Direct preferred at scale |
| **Phone number** | Dedicated Nertura business line per region | TR, BR, IN numbers Phase 3+ |
| **WABA** | WhatsApp Business Account verified | Meta business verification |
| **Webhook** | HTTPS POST to `api.nertura.com/webhooks/whatsapp` | Signature validation |
| **Message templates** | Pre-approved by Meta for outbound | Reminders, alerts |

---

## User Opt-In (Mandatory)

WhatsApp AI requires **explicit double opt-in** before any AI processing:

### Opt-in flow

```
1. User sends "START" or clicks wa.me link from Nertura app/email
2. Nertura sends template: "Reply YES to receive AI crop advice on WhatsApp.
   Msg & data rates may apply. Reply STOP anytime."
3. User replies YES
4. System records ConsentRecord (channel: whatsapp, purpose: ai_assistant)
5. Link phone number to Nertura user account (OTP verify if not logged in)
6. Welcome message + credit balance summary
```

### Opt-out

| Keyword | Action |
|---------|--------|
| STOP, CANCEL, UNSUBSCRIBE | Revoke consent; no further outbound except transactional required by law |
| START | Re-initiate opt-in |

Opt-out synced to CRM and consent registry within 60 seconds.

---

## Inbound Message Handling

```
Webhook received
    → Validate Meta signature
    → Resolve phone → User (or prompt registration)
    → Check opt-in status
    → Classify message type:
        · text question     → Brain (TEXT + WA credits)
        · image             → Vision diagnosis (VISION + WA credits)
        · audio [V2]        → Transcribe → Brain
        · button reply      → Structured action
    → Credit gate
    → Brain inference (full context from linked farms)
    → Store interaction (channel: whatsapp)
    → Send reply (within 24h session window)
    → Log WhatsAppMessage
```

---

## Photo Diagnosis via WhatsApp

### Flow

```
Farmer sends photo
    → "Analyzing your photo... 🌿"
    → Brain vision task (same as mobile/web)
    → Store photo in object storage (linked to interaction)
    → Reply:
       "🌽 Possible: Northern Leaf Blight (87% confidence)
        Severity: Medium
        
        Recommendation: Apply fungicide within 48 hours.
        
        Reply CONFIRM if correct, or tell me what you see.
        
        📊 2 Vision credits used · 38 remaining"
    → CONFIRM → Learning System feedback.positive
    → Wrong description → feedback.correction
```

Optional: link to field if GPS in EXIF (with consent) or ask "Which field? Reply 1, 2, 3"

---

## Outbound Use Cases

| Use case | Template type | Credits | Approval |
|----------|---------------|---------|----------|
| Frost alert | Utility template | 0.5 WA | Auto (pre-approved template) |
| Task reminder | Utility | 0.5 WA | Auto |
| Irrigation due | Utility | 0.5 WA | Auto |
| CRM follow-up | Marketing | 1 WA | Admin approval if >1 recipient |
| Cooperative broadcast | Marketing | 1 WA × N | Approval workflow |
| AI proactive insight | Session message | 1 WA | User preference toggle |

Templates submitted to Meta in English, Turkish, Portuguese, Spanish at launch.

---

## AI Assistant through WhatsApp

Full Brain capabilities in conversational form:

| Capability | WA behavior |
|------------|-------------|
| Q&A | Text replies, max 1024 chars; link to app for long reports |
| Diagnosis | Image in → analysis out |
| Task create | "Remind me to spray Field 2 Friday" → confirm → task created |
| Weather | "Weather tomorrow?" → formatted forecast |
| Market prices | Business tier; brief summary + app link |

Session window: Meta 24-hour rule — free-form replies only within session; outside requires template.

---

## CRM Integration

| CRM event | WhatsApp action |
|-----------|-----------------|
| Deal stage → Negotiation | Auto-draft message; admin approve send |
| Member inactive 14d | Template: "We miss you — need help with your crop plan?" |
| Order confirmed | Template with order summary |
| Interaction logged (call) | Optional follow-up WA template |

All CRM-initiated messages respect opt-in and appear in `CRMInteraction` with channel `whatsapp`.

---

## Automated Follow-Ups

```
Trigger: diagnosis sent, no feedback in 48h
    → Template: "Did our diagnosis for your corn photo help? Reply YES or NO"
    → YES → feedback.positive
    → NO → "What did you find?" → free text → feedback.correction

Trigger: task due tomorrow, incomplete
    → Template reminder with task name

Trigger: credit balance < 5 VISION
    → Template: "You have 3 photo analyses left. Top up: [link]"
```

Configurable per org; farmer can disable non-critical follow-ups in settings.

---

## Data Model

### WhatsAppMessage

| Column | Description |
|--------|-------------|
| `id` | UUID |
| `organization_id` | |
| `user_id` | |
| `phone_e164` | |
| `direction` | inbound, outbound |
| `message_type` | text, image, template, interactive |
| `content` | TEXT or media URL reference |
| `external_wa_id` | Meta message ID |
| `interaction_id` | FK to AI interaction if AI-handled |
| `template_name` | If template |
| `credits_consumed` | |
| `status` | sent, delivered, read, failed |
| `created_at` | |

Retention: 24 months default; configurable per compliance.

---

## Security

| Control | Implementation |
|---------|----------------|
| Webhook signature | HMAC-SHA256 validation |
| Phone verification | OTP link to account |
| Media download | Scan for malware; strip EXIF unless user opts in GPS |
| PII in logs | Phone masked in admin UI (last 4 digits) |
| Rate limit | 20 inbound messages/min/user anti-abuse |

---

## Credit Metering

See `/product/credit-system.md`:

| Event | Credits |
|-------|---------|
| AI reply in session | 1 WA |
| Photo diagnosis | 2 VISION + 1 WA |
| Outbound template | 0.5 WA |
| Broadcast per recipient | 1 WA |

Insufficient credits: friendly message with top-up deep link (wa.me cannot pay — link to mobile web checkout).

---

## Regional Rollout

| Region | Phase | Number | Languages |
|--------|-------|--------|-----------|
| Turkey | 3 | +90 | TR, EN |
| Brazil | 3b | +55 | PT |
| India | 4 | +91 | EN, HI |
| LATAM | 4 | +52, +57 | ES |

---

## Metrics

| Metric | Target |
|--------|--------|
| Opt-in rate (from app install) | >40% |
| WA DAU / mobile MAU | >50% |
| Diagnosis via WA | >30% of vision credits |
| Response latency | <15s p95 |
| Opt-out rate | <2%/month |

---

*Document owner: Chief Systems Architect / Platform*  
*Last updated: June 2026*  
*Companion: `/ai/nertura-ai-brain.md`, `/docs/data-privacy-kvkk-gdpr.md`*
