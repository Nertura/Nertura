# Nertura — Voice Cloning System

> Brand voice architecture for AI-generated speech across social video, blog audio, email voice notes, and WhatsApp — ElevenLabs, OpenAI, Google TTS, and governed Nertura voice identities.

---

## Purpose

Nertura produces hundreds of audio assets per month through the Media Factory. The **Voice Cloning System** ensures every voiceover is **on-brand, multilingual, legally compliant, and approval-gated** — while supporting white-label customer voices for Business+ programs.

---

## System Position

```
Content Pipeline (script)
        │
        ▼
┌───────────────────┐
│ Voice Cloning     │
│ System            │
│ · Voice registry  │
│ · Provider router │
│ · SSML enrichment │
│ · Quality check   │
└─────────┬─────────┘
          │
    ┌─────┴─────┬─────────┬─────────┐
    ▼           ▼         ▼         ▼
 ElevenLabs  OpenAI    Google    Future
 (clone)     TTS       Neural2   Nertura Voice
          │
          ▼
   Media asset store → Video compose → Distribution Engine
```

**Companion:** `/automation/media-factory.md`, `/automation/content-pipeline.md`, `/ai/brain-architecture.md`.

---

## Voice Identity Registry

### Nertura brand voices (Launch)

| Voice ID | Name | Provider | Languages | Persona |
|----------|------|----------|-------------|---------|
| `nertura-agronomist-en` | Nertura Agronomist | ElevenLabs clone | EN | Warm, authoritative, educational |
| `nertura-agronomist-tr` | Nertura Agronom | ElevenLabs clone | TR | Trusted local expert |
| `nertura-field-en` | Field Guide | OpenAI TTS (nova) | EN | Casual, farmer-friendly |
| `nertura-neutral-es` | Guía Agrícola | Google Neural2 | ES, PT | Neutral professional |

### White-label voices [Business+]

| Requirement | Process |
|-------------|---------|
| Customer provides | 3–10 min clean audio sample OR licensed voice actor |
| Legal | Voice ownership agreement + clone consent form |
| Creation | ElevenLabs Professional Voice Clone |
| Isolation | Org-scoped; never used for Nertura brand |
| Approval | Customer admin approves test clip before production |

---

## Provider Router

| Criterion | ElevenLabs | OpenAI TTS | Google Neural2 |
|-----------|------------|------------|------------------|
| **Brand clone** | ✓ Best | ✗ | ✗ |
| **Emotional range** | High | Medium | Medium |
| **Latency** | Medium | Low | Low |
| **Languages** | 29+ | 50+ | 40+ |
| **Cost** | Higher | Lower | Lower |
| **Clone quality** | Industry leading | N/A | Custom models [Enterprise] |

### Routing logic

```
IF voice_id in ElevenLabs_registry AND language supported:
    → ElevenLabs
ELIF language in openai_tts_optimal AND speed_priority:
    → OpenAI TTS (tts-1-hd)
ELIF regional_language OR google_only_locale:
    → Google Cloud Neural2
ELSE:
    → ElevenLabs fallback voice OR OpenAI default
```

Future: **Nertura Voice Model** — fine-tuned TTS on agronomist corpus [Phase 5+].

---

## Script → Voiceover Pipeline

### Stage 1 — Script preparation

| Input | Source |
|-------|--------|
| Raw script | AI Content Director / Brain |
| Scene markers | Media Factory storyboard |
| Pronunciation lexicon | Crop names, chemical brands (phonetic) |
| Duration target | Platform spec (Reel 30s, Short 45s) |

Brain enriches script with SSML-like markers (provider-specific conversion):

```
[PAUSE 0.5s] Your corn leaves don't lie. [EMPHasis] Nitrogen stress
shows as yellowing from the tip down. [PAUSE 0.3s] Scout within 48 hours.
```

### Stage 2 — Credit gate

| Metric | Credit type |
|--------|-------------|
| Voice generation | VOICE — 1 credit per 30 seconds (rounded up) |
| Clone refresh | Enterprise billing |

### Stage 3 — Synthesis

| Parameter | Value |
|-----------|-------|
| Stability | 0.65 (ElevenLabs) — balance expressiveness |
| Similarity boost | 0.80 for clones |
| Speed | 1.0; 0.95 for dense technical content |
| Output format | MP3 192kbps + WAV archive |

### Stage 4 — Quality assurance (automated)

| Check | Threshold |
|-------|-------------|
| Duration vs target | ±10% |
| Silence gaps | No >2s unintentional |
| Artifact detection | ML artifact scorer >0.9 |
| Pronunciation spot-check | Top 20 ag terms dictionary match |
| Loudness | -16 LUFS ±2 (platform standard) |

Failed QA → regenerate once with adjusted SSML → human review queue.

### Stage 5 — Approval (Launch mode)

| Asset | Gate |
|-------|------|
| Brand social video | Founder hears audio in approval preview |
| White-label | Customer admin approves sample |
| WhatsApp voice note [future] | Admin approve template |

### Stage 6 — Storage & lineage

```
VoiceAsset
    ├── script_id
    ├── voice_id
    ├── provider + model_version
    ├── audio_url (encrypted object storage)
    ├── duration_seconds
    ├── credits_consumed
    └── approval_request_id
```

---

## Use Cases by Channel

| Channel | Voice style | Max duration | Mode |
|---------|---------------|--------------|------|
| **TikTok / Reels** | Energetic agronomist | 30–60s | Approval-first → auto L1 |
| **YouTube Shorts** | Slightly slower, clear | 45–60s | Approval-first |
| **Blog embed** | Neutral narrator | 3–5 min | Editor approve |
| **Email** | No voice at launch | — | — |
| **WhatsApp voice note** | Short, personal | ≤60s | Template + approve [Phase 4] |
| **Internal training** | Professional | Variable | Auto internal |

---

## Multilingual Strategy

| Priority market | Primary voice | Fallback |
|-----------------|---------------|----------|
| Turkey | `nertura-agronomist-tr` | Google TR |
| Brazil | PT clone [Phase 4] | Google PT |
| LATAM | ES neutral | ElevenLabs ES |
| Global EN | `nertura-agronomist-en` | OpenAI |

Translation workflow: Brain translates script → native speaker QA sample (1 per 20) → synthesize.

---

## Legal & Ethical Governance

| Requirement | Implementation |
|-------------|----------------|
| Clone consent | Signed release for every cloned voice |
| Celebrity / politician | Blocklist — no impersonation |
| Deception | AI disclosure in video description/caption |
| Deepfake policy | Agricultural education only; no fake testimonials |
| KVKK/GDPR | Voice samples = personal data; deletion on request |
| Child voices | Prohibited |

Voice assets covered in `/docs/data-ownership-policy.md`.

---

## Security

| Control | Detail |
|---------|--------|
| API keys | Vault; org-scoped for white-label |
| Clone access | Org admin only |
| Download | Signed URLs; watermark optional |
| Clone export | Prohibited from platform |

---

## Operating Modes

### Approval-first (Launch)

All public-facing voiceovers attached to Media Factory jobs require human listen + approve before video compose and publish.

### Full-auto (Future L1+)

| Content class | Auto voice allowed when |
|---------------|-------------------------|
| Daily weather tip | Template approved + 50 prior approvals |
| Crop fact series | Pre-approved SSML template |
| White-label | Customer enables L1 for their voice |

Anomaly detection: word error rate spike → pause auto + alert.

---

## Metrics

| Metric | Target |
|--------|--------|
| QA pass rate (first gen) | >85% |
| Regeneration rate | <15% |
| Approval turnaround | <24h launch |
| Cost per 30s voiceover | <$0.15 blended |
| Listener satisfaction (survey) | >4.2/5 |

---

## Roadmap

| Phase | Capability |
|-------|------------|
| **4** | ElevenLabs brand clones EN/TR; OpenAI/Google fallback |
| **4b** | PT/ES clones; blog audio |
| **5** | White-label self-serve; WhatsApp voice templates |
| **6** | Nertura proprietary TTS; emotion control by scene type |

---

*Document owner: Chief Growth & Intelligence Architect*  
*Last updated: June 2026*  
*Status: Final platform foundation*
