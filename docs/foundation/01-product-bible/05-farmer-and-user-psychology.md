# Chapter 05 — Farmer & User Psychology

## Purpose

Document **how growers think, decide, and trust technology** so product and design choices respect human reality — not Silicon Valley defaults.

---

## Principles

1. **Farmers are experts in their land** — AI assists, never condescends
2. **Mobile is the primary device** — often outdoors, bright sun, one hand
3. **Trust is local** — neighbor recommendation beats feature list
4. **Risk aversion is rational** — wrong advice costs a season's income
5. **Literacy varies** — UI must work without reading long instructions

---

## Farmer Psychology

### Decision context

| Factor | Implication for Nertura |
|--------|-------------------------|
| **Seasonal urgency** | Answers must be fast; loading states must feel short |
| **Weather dependency** | "Check after rain" is valid advice — regional awareness matters |
| **Trial and observation** | Follow-up questions and case tracking match how farmers verify |
| **Skepticism of tech** | Show evidence, not buzzwords; avoid "AI magic" language |
| **Community sharing** | WhatsApp-forwardable answers are growth loops |

### Emotional states

```
ANXIETY ──────► "My crop is dying, help now"
                → Short answer first, calm tone, clear next steps

CAUTION ──────► "Should I spray this?"
                → Confidence levels, safety disclaimers, dosages deferred to experts

PRIDE ────────► "Look at my field"
                → Field cards, saved boundaries, case history

FATIGUE ──────► "I don't have time for apps"
                → Minimal taps, no dashboard overload
```

---

## User Segments

| Segment | Entry behavior | Depth need |
|---------|----------------|------------|
| **Home gardener** | Photo of tomato leaf | Simple Q&A, no field required |
| **Smallholder** | Turkish NL intake sentence | Field + case, mobile map |
| **Commercial operator** | Team account, multiple fields | Cases, history, reports (premium) |
| **Agronomist / advisor** | Uses Nertura with clients | Evidence cards, export (future) |
| **Guest** | Google search → homepage | 3 free questions → signup CTA |

Design **defaults to smallholder mobile** — if it works for them, it works for everyone.

---

## Trust Formation

Trust builds in this order:

1. **First answer useful** — even if incomplete
2. **Language matches** — Turkish conversation stays Turkish
3. **Photo understood** — vision shows specific observations, not generic text
4. **Memory demonstrated** — "Last week you mentioned irrigation..."
5. **Evidence shown** — when stakes are high (treatment, chemicals)
6. **Outcome confirmed** — follow-up: did it work?

Breaking trust at any step requires **three good experiences** to recover.

---

## Decision Rationale

We use **short-first answers** because farmers scan, they don't read essays. Expandable detail respects experts who want depth.

We use **friendly errors** (`friendlyAiError`, info cards for geolocation) because technical messages signal "this is not for me."

We avoid **red alarm banners** for permission denials because farmers interpret red as "you broke something" — not "here's an alternative path."

---

## Examples

### Good UX for farmer psychology

- Geolocation denied → info card: "Use the search box or enable location in browser settings"
- Large field area drawn → amber confirmation: "This area looks very large — are you sure?"
- Doctor answer starts with: "Most likely: nitrogen deficiency. Here's what to check..."

### Bad UX

- "Location permission denied." (English, red, no alternative)
- 2,000-word answer before the diagnosis
- Forcing account creation before any answer

---

## Best Practices

- Test with **real farmers**, not only team members
- Measure **comprehension**, not click-through
- Write copy at **grade 6–8 reading level** in each language
- Use **farmer vocabulary** (tarla, dönüm, sararma) not GIS jargon in primary UI

## Bad Practices

- Assuming farmers understand GeoJSON, tokens, or API errors
- Dark patterns to force signup before value
- Mixing English and Turkish in the same conversation

---

## Future Considerations

- **Literacy modes** — larger text, voice readout
- **Agronomist co-pilot mode** — professional vocabulary tier
- **Community verification** — regional expert badges (careful with liability)

---

## Cross-References

- [First 30 Seconds](10-first-30-seconds.md)
- [Book 02 — Accessibility](../02-design-system/12-accessibility-and-motion.md)
- [Book 04 — Language Policy](../04-ai-behaviour/07-language-policy.md)
