# Sprint: Field Case Experience + Auto-Geocode + Content Intelligence

**Date:** June 2026

## Implemented

- **Field cases sidebar** — Open / Monitoring / Resolved tabs, filter by selected field, desktop sidebar + mobile drawer on AI Doctor
- **GET /api/field-cases** — list cases with optional `fieldId` and `status` filters
- **Auto-geocode on intake** — map flies to confirmed location when entering locate phase from intake prefill; auto-confirms first geocode result
- **Farms empty state** — primary CTA to `/intake?q=…` with Turkish example
- **Content Engine upgrade** — `runContentIntelligence` in `@nertura/ai` uses Knowledge Bank + Gemini synthesis with citations and evidence cards; still draft/review only
- **Marketing `dev:fresh`** — added to `apps/marketing/package.json`

## Manual test

1. `/farms` (empty org) → "Describe a field problem"
2. `/intake?q=…` → confirm → map auto-flies to location
3. `/doctor` → left sidebar field cases; mobile "Field cases" button
4. Admin `/content-engine` → generate topic → verify citations in script metadata

## Next sprint

- Case status update UI (resolve / monitor)
- Premium PDF reports + Stripe
- Intelligence Engine in weekly outreach drafts
