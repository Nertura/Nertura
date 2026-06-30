# Chapter 09 — Testing & Quality Gates

## Purpose

Define **minimum quality gates** before merge and deploy — TypeScript, ESLint, database verification, and RLS tests — without pretending a full E2E suite exists where it does not.

---

## Principles

1. **Typecheck and lint are mandatory** — `pnpm typecheck` and `pnpm lint` must pass
2. **RLS is tested** — `pnpm supabase:verify:rls` after policy or migration changes
3. **Test behavior that protects farmers** — tenant isolation beats snapshot tests of buttons
4. **Scripted smoke tests for integrations** — Gemini, geo, CSS when touching those areas
5. **Honest coverage** — document what is not automated yet

---

## Architecture

### CI-quality commands (local = CI)

| Command | Scope | When required |
|---------|-------|---------------|
| `pnpm typecheck` | All packages + apps via Turbo | Every PR |
| `pnpm lint` | ESLint per package | Every PR |
| `pnpm format:check` | Prettier | Recommended every PR |
| `pnpm build` | Full production build | Before release / weekly |
| `pnpm supabase:verify:rls` | SQL script vs local DB | Migration/policy PRs |
| `pnpm supabase:verify` | Migrations + auth scripts | Database PRs |

### Turborepo task graph

From `turbo.json`:

- `build` — `dependsOn: ["^build"]`, outputs `.next/**`, `dist/**`
- `lint` — `dependsOn: ["^lint"]`
- `typecheck` — `dependsOn: ["^typecheck"]`
- `dev` — uncached, persistent

Root does not run tests via `pnpm test` today — integration scripts are explicit:

| Script | Purpose |
|--------|---------|
| `pnpm test:gemini` | Gemini API connectivity |
| `pnpm test:knowledge-ingestion` | Ingestion pipeline smoke |
| `pnpm test:geo-intelligence` | Geo package smoke |
| `pnpm test:dashboard-css` | Dashboard CSS regression |
| `pnpm --filter @nertura/dashboard test:css` | Same CSS test scoped |

### RLS verification

`supabase/scripts/verify-rls.sql`:

1. Creates temp results table
2. Impersonates seed users via `set_config('request.jwt.claim.sub', ...)`
3. Asserts viewer select allowed, viewer insert denied, cross-org isolation
4. Prints pass/fail summary

**Workflow:**

```bash
pnpm supabase:reset        # migrations + seed
pnpm supabase:verify:rls
```

Exit non-zero on failure — wire into CI when Supabase available in pipeline.

### Migration verification

`supabase/scripts/verify-migrations.sql` — sanity checks schema expectations.

`supabase/scripts/verify-auth.sql` — auth configuration checks.

Combined: `pnpm supabase:verify`

### TypeScript as test

Strict compiler catches:

- Missing `await` on Supabase calls
- Wrong shape for `DoctorDiagnosis`
- Invalid env access patterns

### Manual QA checklist (release)

- Guest doctor: 3 questions → signup CTA
- Login → onboarding → doctor with farm context
- Field boundary draw → save → area displayed
- Credit debit → ledger row
- Admin: non-admin blocked

---

## Decision Rationale

**RLS SQL tests over mocked Supabase** — policies are Postgres-specific; integration test catches real `using` / `with check` mistakes.

**Turbo parallel typecheck** — fast feedback across six packages and three apps.

**Targeted tsx scripts** — cheaper than full Playwright until team invests in E2E.

---

## Examples

### Pre-PR local gate

```bash
pnpm typecheck && pnpm lint && pnpm format:check
```

### Database PR gate

```bash
pnpm supabase:reset && pnpm supabase:verify:rls && pnpm supabase:verify
```

### CSS regression after map/shell changes

```bash
pnpm test:dashboard-css
```

---

## Best Practices

- Add RLS test case when adding a new tenant table
- Update seed fixtures if test users/orgs change
- Run `pnpm build` before release candidate tag
- Run geo/Gemini smoke when touching providers
- Document manual steps in PR description when automation missing

---

## Bad Practices

- Merging migration PR without `verify:rls`
- Disabling ESLint rules file-wide instead of fixing
- `@ts-expect-error` to merge broken typecheck
- Relying on manual QA only for credit/Stripe flows
- Flaky Gemini tests blocking CI without mock mode

---

## Future Considerations

- **GitHub Actions** workflow: typecheck + lint + supabase db reset + verify:rls
- **Playwright** — guest doctor, onboarding, field save happy paths
- **Vitest** unit tests for `@nertura/ai` intent classifier, boundary validation
- **Policy diff review** — require second reviewer for RLS migrations
- **Visual regression** — Storybook + Chromatic for `@nertura/ui`

---

## Cross-References

- [Chapter 05 — Supabase & Database](05-supabase-and-database.md)
- [Chapter 11 — Migration Policy](11-migration-policy.md)
- [Chapter 12 — Code Review & DoD](12-code-review-and-dod.md)
