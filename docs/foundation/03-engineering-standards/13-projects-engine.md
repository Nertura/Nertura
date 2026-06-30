# Book 03 — Projects Engine (v1)

> Architecture evolution layer · June 2026  
> Extends `field_cases` — does not replace AI Doctor, conversations, or memory.

## Gate question

Does this help the farmer's problem continue after the first diagnosis?

Yes — every diagnosis can become a **living case** (farmer UI: **Vaka Takibi**) without changing the Doctor experience.

---

## Philosophy

```
Question → Diagnosis → Case → Timeline → Memory → Recommendations → Recovery → Knowledge
```

Complexity lives in architecture, not in the Doctor UI.

---

## Internal vs external naming

| Internal (code/DB) | Farmer-facing (UI) |
|--------------------|--------------------|
| Project / Projects Engine | **Vaka Takibi** |
| `field_cases` row | Vaka |
| `projects` table (legacy memory modules) | Unchanged — not the case engine |

We **reuse `field_cases`** as the case entity. We do **not** duplicate conversations, analyses, photos, or `ai_memory_events`.

---

## Data model

### Core (existing)

- `field_cases` — case header (status, diagnosis summary, field/farm/conversation links)
- `ai_conversations` / `ai_messages` — dialogue
- `ai_analyses` — structured diagnoses
- `analysis_images` — photos per analysis
- `ai_memory_events` — intelligence memory
- `analysis_memory_links` — farm/field context per analysis
- `diagnosis_follow_ups` / `diagnosis_outcomes` — outcome engine

### Extensions (v1 migration)

- `field_cases.progress` — `monitoring | improving | stable | critical | recovered | closed`
- `field_cases.last_analysis_id`, `confidence`, `risk_level`, `crop_label`
- `ai_analyses.field_case_id` — back-link analysis to case
- `case_timeline_events` — append-only timeline + notification hooks
- `case_tasks` — AI action items (schema only in v1)

---

## Relationships

```
Farm → Field → field_cases (Case)
                    ├── conversation_id → ai_conversations
                    ├── last_analysis_id → ai_analyses
                    │       └── analysis_images
                    ├── case_timeline_events
                    ├── case_tasks
                    └── ai_analyses.field_case_id (many analyses per case)

ai_memory_events ← analysis_id / conversation_id (unchanged)
analysis_memory_links ← diagnosis_id + field_id + farm_id
```

---

## Case lifecycle

| `field_cases.status` | Meaning (legacy) |
|----------------------|------------------|
| open | New / active issue |
| monitoring | Under follow-up |
| resolved | Closed from farmer POV |

| `field_cases.progress` | Meaning (v1) |
|------------------------|----------------|
| monitoring | Default after diagnosis |
| improving | Farmer/AI reports improvement |
| stable | Symptoms stable |
| critical | High risk |
| recovered | Outcome positive |
| closed | Archived |

No fake percentages — progress is categorical.

---

## Timeline event types

`case_created`, `photo_uploaded`, `diagnosis_created`, `treatment_generated`, `reminder_scheduled`, `follow_up_analysis`, `progress_updated`, `feedback_received`, `recovered`, `completed`, `note_added`

Timeline is append-only. Future notification workers read `notify_at` + `notification_channels`.

---

## Memory integration

After Doctor save with `caseId`:

1. `ai_analyses.field_case_id` set
2. `analysis_memory_links` row (existing table)
3. Timeline events (diagnosis, photo, treatment)
4. `ai_memory_events` unchanged — already written by intelligence engine

No duplicated diagnosis text in new tables.

---

## History evolution

- **Today:** `/history` lists `ai_conversations` (unchanged)
- **Future:** Same route, grouped by `field_cases` via `loadCaseGroupedConversations()`
- Nav prep: `navigation-cases.ts` — label becomes **Vaka Takibi** when product enables it

---

## Code layout

```
apps/dashboard/src/lib/projects-engine/
  case-overview.ts      — aggregated case view
  timeline-service.ts — events + notification hooks
  diagnosis-bridge.ts — post-Doctor sync (extends caseId flow)
  notification-hooks.ts — dispatcher interfaces (no-op v1)
  types.ts              — farmer labels

apps/dashboard/src/app/api/field-cases/[id]/overview/route.ts
supabase/migrations/20250710000000_projects_engine_v1.sql
packages/types/src/projects-engine.ts
```

---

## Backward compatibility

- Doctor API request/response unchanged
- `/history` unchanged
- `/doctor` unchanged
- Cases without migration applied: bridge logs failures non-fatally (same pattern as usage debit)
- `field_cases` without timeline rows: `buildCaseTimeline()` falls back to analyses

---

## Future sprints

1. Auto-create case on first field-linked diagnosis
2. AI-generated `case_tasks`
3. Case overview UI (not Doctor redesign)
4. Notification dispatcher (email/push/calendar)
5. History UI grouped by case
6. Photo compare across timeline

---

*Foundation v1.0 · Complies with Constitution Art. III · Book 01 depth ladder*
