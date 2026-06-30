# 01 — Definition of Done

## Purpose

Unified Definition of Done for Nertura Core — extends Book 03 Ch. 12.

---

## Done Means

A change is **done** when all applicable items below are satisfied.

### Foundation

- [ ] Relevant Core + Foundation chapters identified
- [ ] Compliance statement written before implementation
- [ ] Gate question answered (yes/no + rationale)

### Code Quality

- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes (touched apps)
- [ ] No unrelated scope creep
- [ ] Matches existing patterns in touched packages

### Localization & Writing

- [ ] `pnpm check:i18n` passes
- [ ] No forbidden words (Writing System Ch. 03)
- [ ] Farmer copy from centralized modules

### Design System

- [ ] `pnpm check:css-imports` passes
- [ ] No one-off CSS in apps
- [ ] Uses `@nertura/ui` components/tokens

### AI (if touched)

- [ ] Routes through `runIntelligenceEngine`
- [ ] Turkish output lock for TR queries
- [ ] `pnpm test:doctor-language` passes (if doctor path)

### Domain Tests (if touched)

| Area | Test |
|------|------|
| Doctor dashboard | `pnpm test:dashboard-doctor` |
| Projects / cases | `pnpm test:projects-engine` |
| UI interactions | `pnpm test:dashboard-interactions` |
| Tier nav | `pnpm test:tier-navigation` |
| Legacy chat guard | `pnpm test:no-legacy-chat` |

### CSS Smoke (if styles touched)

Dev servers required:

```bash
pnpm --filter @nertura/marketing dev:fresh   # :3000
pnpm --filter @nertura/dashboard dev:fresh  # :3001
pnpm --filter @nertura/admin dev:fresh      # :3002
pnpm test:marketing-css && pnpm test:dashboard-css && pnpm test:admin-css
```

### Review

- [ ] 12-dimension scorecard completed (see Review System)
- [ ] No P0 merge blocks (see Product Review System)

### Documentation

- [ ] Foundation updated if behaviour changed materially
- [ ] Decision Archive ADR if architectural decision made

---

## Sprint Report (Required)

Every sprint ends with 14-item report per [`AGENTS.md`](../../../AGENTS.md).

---

## Not Done

- "Works on my machine" without tests
- English leaks marked "fix later"
- Hardcoded strings "will i18n next sprint"
- CSS duplicated in app globals
- Feature without gate question yes
