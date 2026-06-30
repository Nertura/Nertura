# 08 — Photo-Only & Follow-Ups

---

## Purpose

Define behaviour when a farmer uploads a **photo without meaningful text**: prompt for intent, offer quick actions, and run the vision-first pipeline only after the farmer states what they want to know.

---

## Principles

1. **Photo alone is not a question** — Image upload without intent triggers a clarification prompt, not an automatic full diagnosis.
2. **Respect the language lock** — Photo-only prompts and quick actions match conversation language.
3. **Placeholder detection** — System-generated upload messages are treated as empty text.
4. **Follow-ups continue context** — Subsequent text messages use conversation history and prior vision when available.
5. **Quick actions are starters** — Suggested taps reduce friction; they are not pre-written diagnoses.

---

## Architecture

### Image-only detection

`isImageOnlySubmission(message, hasImage)` in `conversation-language.ts`:

```typescript
if (!hasImage) return false;
const trimmed = message.trim();
if (!trimmed) return true;  // empty message + image
return IMAGE_ONLY_PLACEHOLDERS.some((re) => re.test(trimmed));
```

**Recognized placeholders** (case-insensitive):

| Pattern | Origin |
|---------|--------|
| `Analyze this plant photo.` | EN client default |
| `Photo uploaded.` | EN client default |
| `Fotoğraf yüklendi.` | TR client default |
| `Foto yuklendi.` | TR ASCII variant |

Any other text (even short) is **not** image-only — e.g. "?" or "help" proceeds to doctor pipeline.

### Photo-only prompt

`getImageOnlyPrompt(language)`:

**TR:**

```
Fotoğraf yüklendi.

Bu fotoğraf hakkında ne öğrenmek istiyorsunuz?
```

**EN:**

```
Photo uploaded.

What would you like to know about this photo?
```

API layer should return this **before** calling `runIntelligenceEngine` when `isImageOnlySubmission` is true — unless product explicitly chooses auto-diagnosis (not current canonical behaviour per this manual).

### Quick action suggestions

`PHOTO_QUICK_ACTIONS` — localized one-tap follow-ups:

**Turkish:**

- Hastalık nedir?
- Neden oldu?
- Nasıl iyileşir?
- Gübre önerisi
- Zararlı kontrolü

**English:**

- What disease is this?
- What caused it?
- How can I treat it?
- Fertilizer advice
- Pest control

UI renders these as chips/buttons after photo-only prompt. When tapped, the label becomes the `question` for the next doctor call with the same image attached.

### Follow-up message flow

```
Turn 1: [photo only] → getImageOnlyPrompt + PHOTO_QUICK_ACTIONS
Turn 2: "Hastalık nedir?" + [same photo] → runIntelligenceEngine
  → conversationHistory includes turn 1 assistant prompt
  → hasConversationHistory evidence card emitted
  → vision runs (if image still attached)
```

### Vision on follow-up

When the farmer sends text with the photo on turn 2:

- `runKnowledgeBankDoctor` receives full question text (quick action or free text)
- Vision runs with question context — improves species/symptom focus
- If turn 1 stored image server-side, API must re-attach `imageBase64` on turn 2

### Intent classification on follow-ups

Quick actions map to intents:

| Quick action | Typical intent |
|--------------|----------------|
| Hastalık nedir? / What disease is this? | `diagnosis` |
| Neden oldu? / What caused it? | `diagnosis` |
| Nasıl iyileşir? / How can I treat it? | `diagnosis` / `crop_care` |
| Gübre önerisi / Fertilizer advice | `fertilizer` |
| Zararlı kontrolü / Pest control | `pest` |

`classifyIntent` runs on the follow-up text — not on the photo-only turn.

### Conversation history in memory

`formatMemoryContextForPrompt` includes last 8 messages. Photo-only exchange provides context:

```
Farmer: [photo]
Nertura: Fotoğraf yüklendi. Bu fotoğraf hakkında ne öğrenmek istiyorsunuz?
Farmer: Hastalık nedir?
```

Evidence card: `conversation_history` — "Previous messages used as context."

---

## Decision Rationale

### Why not auto-diagnose on upload?

Unprompted diagnosis assumes intent ("disease") when the farmer may want pest ID, fertilizer advice, or "is this normal?" Auto-diagnosis also burns vision + LLM tokens on accidental uploads.

### Why system placeholders as empty?

Mobile clients send synthetic messages when the user picks a photo without typing. Treating those as real questions produces nonsense retrieval queries.

### Why quick actions?

Reduces cognitive load for low-literacy users. Fixed phrases are also easier to intent-classify than free text.

### Why ask before vision on photo-only?

Product choice: first turn is UX-only (no API vision cost). Alternative architecture (auto vision on upload) is valid but **not** what this manual describes — document current helper design.

**Note:** If API calls engine on photo-only with placeholder text, vision **will** run because doctor pipeline receives the placeholder as question. API routes **should** intercept photo-only **before** engine call. This is an integration requirement.

---

## Examples

### Example — Canonical photo-only UX

```
POST /diagnose { image, message: "" }
→ Response: getImageOnlyPrompt('tr') + quick actions
→ No runIntelligenceEngine call

POST /diagnose { image, message: "Hastalık nedir?" }
→ runIntelligenceEngine → vision-first → full answer
```

### Example — Farmer types custom follow-up

```
Turn 1: photo + "Photo uploaded."
Turn 2: "These spots appeared after rain last week"
→ Not image-only; full text used for entity extraction + retrieval
```

### Example — Accidental double upload

```
Turn 1: photo only → prompt
Turn 2: photo only again → prompt again (no diagnosis loop)
```

---

## Best Practices

- Intercept photo-only at API route before `runIntelligenceEngine`.
- Keep image attached server-side between turns in same conversation.
- Show quick actions immediately below photo-only prompt.
- Include photo-only assistant message in `conversationHistory` for turn 2.
- Re-use vision results within short TTL if same image hash (future optimization).

## Bad Practices

- Running full diagnosis on empty message + image without farmer intent.
- Discarding the image after turn 1 — forces re-upload friction.
- Quick actions in wrong language vs conversation lock.
- Treating "Photo uploaded." as a semantic search query.
- Auto-selecting "What disease is this?" without user tap.

---

## Future Considerations

- **Optional auto-scan mode** — Power user setting: skip prompt, run vision with generic diagnosis intent.
- **Multi-photo threads** — Before/after comparison across turns.
- **Scheduled follow-ups** — Push at 7/14/30 days (`FOLLOW_UP_DAYS`) asking for outcome photo.
- **WhatsApp inbound** — Photo-only messages common; same prompt via template message.

---

## Source References

- `packages/ai/src/conversation-language.ts` — `isImageOnlySubmission`, `getImageOnlyPrompt`, `PHOTO_QUICK_ACTIONS`, `IMAGE_ONLY_PLACEHOLDERS`
- `packages/ai/src/intelligence-engine.ts` — conversation history in context
- `packages/ai/src/evidence-cards.ts` — `conversation_history` card
- `packages/ai/src/intent-classifier.ts` — intent on follow-up text
- `packages/ai/src/similar-case-ranking.ts` — `FOLLOW_UP_DAYS` for outcome prompts
