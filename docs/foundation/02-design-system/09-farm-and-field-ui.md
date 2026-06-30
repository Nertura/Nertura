# Chapter 09 — Farm & Field UI

> Field cards, farm selector, and field context patterns.

---

## Purpose

This chapter documents **farm and field selection UI** — how farmers identify which parcel the AI and map operations refer to. Covers `FarmMapClient` field cards, `FieldContextSelector`, and related dashboard surfaces.

---

## Principles

1. **Field identity is always visible** — Name, crop, area on every field card.
2. **Selection state is obvious** — Primary border + ring on selected field in map panel.
3. **Context persists** — Selected field ID stored in `localStorage` for Doctor sessions.
4. **Empty fields invite action** — Dashed border empty state, not blank space.
5. **Units localized** — m², dönüm, ha via `formatAreaTriple` and field formatters.

---

## Architecture

### Field cards (map panel)

**File:** `apps/dashboard/src/components/farm/farm-map-client.tsx`

Each field renders as a `<button type="button">` list item:

| Element | Content |
|---------|---------|
| Title | `f.name` — `font-medium leading-tight` |
| Metadata grid | 2-column `dl` at `text-[11px]` |
| Crop | `copy.fieldCard.crop` label |
| Area | m² + ha from `formatFieldArea()`, or "no boundary" copy |

**Selected styles:**

```
border-primary bg-primary/5 ring-1 ring-primary/25
```

**Unselected hover:**

```
border-border hover:border-primary/40 hover:bg-muted/40
```

**Actions when selected (idle phase):**

- Redraw boundary (`Button outline sm`) — if `canWrite` and polygon exists
- Details link → `/fields/${id}`

### Farm header card

Same `Card` block shows:

- `CardTitle` — farm name (`text-base` compact)
- Location row with `MapPin` icon
- Field count string from localized copy

### FieldContextSelector (Doctor)

**File:** `apps/dashboard/src/components/doctor/field-context-selector.tsx`

| Feature | Implementation |
|---------|----------------|
| Storage key | `nertura_selected_field_id` |
| Control | Native `<select>` styled like Input |
| Default option | "All farm (no specific field)" |
| Label format | `name — farmName — area · crops` |
| Layout | `flex-col sm:flex-row` with `Label` + MapPin |

Exports: `getStoredFieldId()`, `setStoredFieldId()`, `FieldOption` type.

**Integration in DoctorChatApp:**

- URL param `fieldId` overrides storage on load
- Greeting alert when field saved or monitored
- `PremiumReportsPanel` when field selected and chat active

### Farms list page

**File:** `apps/dashboard/src/app/(dashboard)/farms/page.tsx`

Farm-level navigation entry (list/cards) — uses `@nertura/ui` Card/Button patterns; map route linked per farm.

### Field patient files connection

Field cases (`FieldCasesPanel`) filter by `selectedFieldId` — checkbox "Only selected field" auto-enables when field context set in Doctor.

---

## Decision Rationale

| Decision | Rationale |
|----------|-----------|
| Button cards vs div+click | Keyboard accessible, clear focus target |
| Native select for field context | Fast to ship, accessible; compact metadata in option text |
| localStorage persistence | Farmer returns to same field without re-selecting |
| Separate map selection vs Doctor context | Map uses React state; Doctor uses storage — synced via URL params when navigating from intake |
| Area in m² primary | Turkish farmers often think in dönüm; overlay shows all three |

---

## Examples

### Field option label

```tsx
function formatFieldLabel(f: FieldOption): string {
  const parts = [f.name];
  if (f.farmName) parts.push(f.farmName);
  const meta: string[] = [];
  if (f.areaHectares != null) meta.push(`${f.areaHectares} ha`);
  if (f.crops?.length) meta.push(f.crops.join(', '));
  if (meta.length) parts.push(meta.join(' · '));
  return parts.join(' — ');
}
```

### No fields empty state

```tsx
<p className="rounded-md border border-dashed px-3 py-2.5 text-xs text-muted-foreground">
  {copy.noFieldsYet}
</p>
```

### Field greeting after save

```tsx
<Alert className="mb-4 border-emerald-500/25 bg-emerald-500/5">
  <AlertDescription>Tarlan kaydedildi. Bu alanı artık sürekli takip edebilirim — <strong>{fieldName}</strong></AlertDescription>
</Alert>
```

---

## Best Practices

- Sync field selection to URL when deep-linking from intake (`fieldId`, `caseId`, `q` params)
- Show crop and area even when boundary missing — use "no boundary" copy, not empty cell
- Use `CROP_OPTIONS` from onboarding types in map create confirm phase
- Respect `canWrite` before showing draw/edit actions
- Link field details to `/fields/[id]` for extended field view

---

## Bad Practices

- Requiring field selection before first Doctor question (optional context)
- Identical styling for selected field in list vs selected on map when they represent different state machines
- Storing field context only in React state (lost on refresh)
- Showing raw UUIDs in field labels
- Farm selector with hundreds of fields without search (future scale issue)

---

## Future Considerations

- Searchable combobox replacing native select for large farms
- Farm-level switcher in Doctor header (multi-farm orgs)
- Field thumbnail from map snapshot on card
- Unified field selection context provider across map + doctor

---

## Related Chapters

- [08 — Map UI](08-map-ui.md)
- [07 — Doctor UI](07-doctor-ui.md)
- [10 — History UI](10-history-ui.md)
