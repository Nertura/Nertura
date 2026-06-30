# Chapter 10 — First 30 Seconds

## Purpose

Define the **activation moment** — what happens from landing to first value — and why every optimization effort starts here.

---

## Principles

1. **Value before account** — guest Doctor proves Nertura works
2. **Zero tutorial** — interface teaches by affordance
3. **Mobile-first latency** — perceived speed matters as much as actual speed
4. **One primary action visible** — no choice paralysis
5. **Trust signal in first answer** — specific, not generic

---

## Timeline: Guest User (Marketing)

| Second | Experience | Success metric |
|--------|------------|----------------|
| 0–3 | Page loads, composer visible, calm hero | LCP < 2.5s mobile |
| 3–10 | User types question OR taps upload | Intent captured |
| 10–25 | Loading indicator, non-alarming | No error flash |
| 25–30 | Short useful answer appears | User reads first section |

**Goal:** User thinks *"This understands agriculture"* before thinking *"This is AI."*

---

## Timeline: Registered User (Dashboard)

| Second | Experience | Success metric |
|--------|------------|----------------|
| 0–5 | Auth complete, dashboard or Doctor loads | No redirect loop |
| 5–15 | Sees fields/cases OR Doctor composer | Context recognizable |
| 15–30 | Asks question with field context OR continues case | Memory visible in answer |

**Goal:** User thinks *"It remembers my farm."*

---

## Activation Definition

| Stage | Event | Tracking |
|-------|-------|----------|
| **A0** | Land on homepage | Page view |
| **A1** | First Doctor message sent | Guest or auth |
| **A2** | First useful answer received | No bounce 30s after |
| **A3** | Account created | Signup conversion |
| **A4** | First field saved | Intake → map complete |
| **A5** | First field case opened | Patient file created |
| **A6** | D7 return | Retention |

**North Star path:** A1 → A3 → A4 → A5 (see Book 05)

---

## Decision Rationale

Google's homepage won the first 30 seconds with **one box**. ChatGPT repeated it. Nertura must not regress to **feature marketing pages** that delay the first question.

30 seconds is the **attention budget** for a farmer standing in a field with one hand free.

---

## Examples

### Good first 30 seconds

- Marketing: centered input, placeholder "Ask about your crops...", upload icon visible
- First answer: "Most likely water stress — here's what to check in the next 24 hours..."

### Bad first 30 seconds

- Full-screen cookie banner + newsletter popup + feature carousel before input
- First answer: 800-word essay starting with "As an AI language model..."

---

## Best Practices

- Optimize **time-to-first-token** on Doctor API
- Preload composer JS on marketing homepage
- Show skeleton UI, not blank white screen

## Bad Practices

- Mandatory signup modal on landing
- Autoplay video hero
- Requiring crop selection before any question

---

## Future Considerations

- **Pre-filled examples** by region ("Buğdayda sararma...")
- **WhatsApp deep link** — first 30 seconds in chat app
- **Offline queue** — question saved, answer synced when connected

---

## Cross-References

- [Home Page Philosophy](11-home-page-philosophy.md)
- [Book 05 — Activation](../05-growth-business/03-growth-loops-and-activation.md)
- Code: `apps/marketing/src/components/home-doctor-form.tsx`
