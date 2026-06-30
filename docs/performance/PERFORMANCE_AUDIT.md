# Performance Audit — June 2025

> Foundation: Book 03 Ch. 10

## Build sizes (production)

| App | First Load JS (shared) | Notes |
|-----|------------------------|-------|
| Marketing | ~102 kB | Static legal + home |
| Dashboard | ~102 kB | Doctor ~146 kB route |
| Admin | ~102 kB | Growth AI modules client-heavy |

## Findings

### ✅ Good

- Turbo monorepo caching; typecheck ~67ms cached
- Legal pages SSG via `[slug]` + `generateStaticParams`
- Dashboard P0: `min-h-0` prevents layout overflow repaints
- Overlay portals reduce stacking context thrashing

### 🟡 Polish

- `@nertura/ui` dropdown portals add body nodes — acceptable
- Admin growth pages reload on content generate (`window.location.reload`)
- Map page (`/farms/[id]/map`) largest dashboard route (~143 kB)

### 🔴 Watch

- Do not run `pnpm build` while `pnpm dev` writes same `.next` (cache corruption)
- Marketing `/intake` moved to `next.config` redirect — no page collect step

## Recommendations (P1)

1. Replace content-studio full reload with SWR/refetch
2. Lazy-load map bundle on farms map route only
3. Add `loading.tsx` skeletons on `/cases`, `/doctor` slow networks
4. Monitor Supabase query N+1 on case list loader

## Commands

```bash
pnpm typecheck
pnpm build
pnpm test:dashboard-interactions
pnpm test:projects-engine
```
