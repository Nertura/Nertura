# Nertura Pre-Commit Checklist

> Run before every commit, PR, or agent handoff.  
> Companion: [`CONSTITUTION.md`](CONSTITUTION.md) · [`03-engineering-standards/12-code-review-and-dod.md`](03-engineering-standards/12-code-review-and-dod.md)

Copy this checklist into PR descriptions or agent completion reports. Mark each item **yes / no / n/a** with a one-line note when not yes.

---

## Product & Foundation

- [ ] **Does this solve the farmer's problem faster?** ([Book 01 Ch. 12](01-product-bible/12-feature-gate-criteria.md))
- [ ] **Does it follow the Product Bible?** (depth ladder, neutral advisor, Doctor-first — [Book 01](01-product-bible/))
- [ ] **Does it follow the Design System?** (tokens, layout, states — [Book 02](02-design-system/))
- [ ] **Is AI Doctor still conversation-first?** (composer primary; no dashboard overload — [Book 02 Ch. 07](02-design-system/07-doctor-ui.md))
- [ ] **Did we avoid new unnecessary features?** (stabilization: fix/polish only unless gate passes)

---

## UX & localization

- [ ] **Is language consistent?** (no mixed TR/EN in one flow — [Book 04 Ch. 07](04-ai-behaviour/07-language-policy.md))
- [ ] **Are all user-facing strings localized or prepared for i18n?** (copy maps / locale prop — not hardcoded English in TR flows)
- [ ] **Is mobile / tablet / desktop usable?** (mobile first — [Book 02 Ch. 05](02-design-system/05-responsive-behavior.md))
- [ ] **Are technical errors hidden from users?** (friendly copy; server logs only — [Book 02 Ch. 11](02-design-system/11-states-loading-empty-error.md))

---

## Data & honesty

- [ ] **Did we avoid placeholders / fake data?** (no lorem demo data presented as real; stub UI labeled honestly)

---

## Quality gates

- [ ] **`pnpm typecheck` passed**
- [ ] **`pnpm build` passed** (or app-scoped build for touched packages)
- [ ] **Relevant tests passed** (RLS verify if migrations; smoke tests if documented for area)
- [ ] **`pnpm dev:fresh` verified if CSS or `.next` changed** (stale cache breaks Tailwind — [Book 03 Ch. 10](03-engineering-standards/10-performance-and-scalability.md))

---

## Foundation compliance block (required for non-trivial work)

```
Foundation: docs/foundation/[book]/[chapter].md
Compliance: [1–3 sentences]
Gate question: [yes/no + rationale]
Checklist: [link or paste completed items above]
```

---

## Quick commands

```bash
pnpm typecheck
pnpm lint
pnpm build                    # or: pnpm --filter @nertura/dashboard build
pnpm supabase:verify:rls      # if migrations / policies changed
pnpm --filter @nertura/dashboard dev:fresh   # if CSS / layout / .next issues suspected
```

---

*Foundation v1.0 · Use with Constitution Article III — identify, comply, implement, verify.*
