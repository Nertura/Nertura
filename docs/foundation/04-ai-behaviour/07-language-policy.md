# 07 — Language Policy

---

## Purpose

Define Nertura's bilingual operation: **Turkish (`tr`) and English (`en`) only**, strict conversation language lock, and **no mixed-language replies** in a single answer.

---

## Principles

1. **Two languages** — `ConversationLanguage = 'tr' | 'en'`. No third locale in doctor pipeline.
2. **Lock for the session** — Once resolved, every LLM call uses `buildStrictLanguageBlock`.
3. **Explicit switch only** — Language changes when the user explicitly requests it, not from crop/disease names.
4. **Translate internally** — KB excerpts may be EN while user speaks TR; response must still be pure TR.
5. **No mixed messages** — A single answer must not combine TR and EN sentences or headers.

---

## Architecture

### Language resolution chain

`resolveInitialConversationLanguage` in `conversation-language.ts` — **first match wins**:

| Priority | Source | Function |
|----------|--------|----------|
| 1 | User profile locale | `normalizeLocaleToLanguage(profileLanguage)` |
| 2 | Stored conversation language | `conversationLanguage` on session |
| 3 | HTTP Accept-Language | `parseAcceptLanguage(header)` |
| 4 | Detected message language | `detectMessageLanguage(message)` via `analyzeQuestion` |
| 5 | Default | `'en'` |

**Initial resolution only** — after lock, message detection does not override.

### Locale normalization

```typescript
normalizeLocaleToLanguage('tr-TR') → 'tr'
normalizeLocaleToLanguage('en-US') → 'en'
normalizeLocaleToLanguage('de-DE') → null  // unsupported
```

### Accept-Language parsing

- Splits comma-separated tags with `q=` weights
- Sorts by weight descending
- Returns first supported `tr` or `en`

### GeoIP hint (`countryToLanguage`)

- **TR country code → `tr`**
- Other countries → `null` (does not infer English from geo — avoids wrong assumptions for TR speakers abroad)

### Explicit language switch

`detectExplicitLanguageSwitch(message)` patterns:

**English request:**

- "answer in English", "respond in English", "English please"
- "ingilizce cevap", "ingilizce yaz"

**Turkish request:**

- "answer in Turkish", "Turkish please"
- "türkçe cevap", "turkce yaz"

If both detected → `null` (ambiguous, no switch).

### Strict language block (injected into every Gemini call)

`buildStrictLanguageBlock(language)`:

**Turkish lock:**

```
Conversation language: Turkish.
Respond ONLY in Turkish.
Never switch language unless the user explicitly requests another language.
Knowledge Bank excerpts may be in English — translate internally before responding.
Do not infer language from crop names, disease names, or image content.
```

**English lock:** symmetric rules.

Used in `askGeminiAgricultureDoctor` via `gemini.ts`.

### KB language gate

`hasKbContentInLanguage(hit, language)`:

- **TR:** requires `summary_tr` or `name_tr`
- **EN:** requires `summary_en` or `name_en`

Direct KB answers blocked if localized content missing — forces synthesis path where Gemini translates under language lock.

### Answer formatting localization

All user-facing strings branch on `language === 'tr'`:

- Section headers in `formatNerturaAnswerText`
- Risk labels `RISK_TR` / `RISK_EN`
- Evidence card titles and summaries in `buildEvidenceCards`
- Clarification copy in `buildClarificationAnswer`
- Disclaimer is bilingual fixed string (see Chapter 09)

### Entity language vs conversation language

`extractEntities` may detect language hints in the question. **Conversation language** is the session lock; entity language is informational only for memory events.

---

## Decision Rationale

### Why lock instead of per-message detection?

Farmers mix languages casually ("domates early blight ne yapmalıyım"). Per-message detection causes jarring TR→EN switches mid-conversation.

### Why not infer EN from non-TR countries?

Default English for all non-TR geoIP would harm Turkish diaspora and bilingual farmers in Turkey using EN UI. Explicit profile and Accept-Language are safer signals.

### Why translate KB internally?

KB ingestion is EN-heavy early on. Blocking TR users until all articles are translated would stall product. Lock + translate preserves UX while KB localization catches up.

### Why bilingual disclaimer string?

Legal visibility in both languages in a single constant ensures disclaimer always appears regardless of which language section headers use.

---

## Examples

### Example — Profile TR, English crop names

**Profile:** `tr`  
**Message:** "Tomato leaves have yellow spots"

```
resolveInitialConversationLanguage → 'tr' (profile wins)
buildStrictLanguageBlock('tr') injected
→ Answer: Turkish sections only
→ "Domates yapraklarında …" not "Tomato leaves…"
```

### Example — Explicit switch

**Locked:** `tr`  
**Message:** "Please answer in English"

```
detectExplicitLanguageSwitch → 'en'
→ Session updates conversationLanguage to 'en'
→ Subsequent answers: English only
```

### Example — KB direct blocked for language

**Language:** `tr`  
**Hit:** score 0.85 but `summary_tr` empty

```
hasKbContentInLanguage → false
canUseKbDirect → false
→ Gemini synthesis with TR lock translates context
```

---

## Best Practices

- Persist `conversationLanguage` on `ai_conversations` after first resolution.
- Re-run `detectExplicitLanguageSwitch` on every user message before doctor call.
- Pass `language` explicitly to `runIntelligenceEngine` — do not rely on detection inside engine alone.
- Localize UI chrome (buttons, placeholders) to match conversation lock.
- Store `language` on `ai_memory_events` for analytics.

## Bad Practices

- Detecting language from crop names ("tomato" → EN).
- Returning bilingual answers "for convenience."
- Using GeoIP alone to set English for all non-TR IPs.
- Showing EN KB article body without translation in TR sessions.
- Allowing Gemini to respond in Arabic/French because the farmer typed one word.

---

## Future Considerations

- **Additional locales** — Requires new `ConversationLanguage` union, section headers, evidence strings, and QA matrix — not a runtime string swap.
- **RTL support** — Separate from language policy; UI layout concern.
- **KB translation pipeline** — Increase TR direct-path rate; reduce synthesis cost.
- **Voice locale** — STT locale separate from conversation lock with explicit user control.

---

## Source References

- `packages/ai/src/conversation-language.ts` — resolution, lock, switch detection, KB language check
- `packages/ai/src/gemini.ts` — `buildStrictLanguageBlock` injection
- `packages/ai/src/answer-formatter.ts` — localized section formatting
- `packages/ai/src/evidence-cards.ts` — localized card copy
- `packages/ai/src/intelligence-engine.ts` — `language` on memory events
