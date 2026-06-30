# Nertura — Mobile App Screens

> Complete mobile UX specification for iOS, Android, and PWA. Field-first, offline-capable, thumb-zone optimized — the farmer's primary Nertura interface.

---

## Mobile Product Principles

| Principle | Implementation |
|-----------|----------------|
| **Field-first** | Camera, tasks, and alerts before admin features |
| **Offline-native** | Core flows work without connectivity; sync when back |
| **One-hand operation** | Primary actions in bottom 40% of screen |
| **Glanceable** | Critical info readable in <3 seconds |
| **Low bandwidth** | Text-first; images lazy-loaded; compressed uploads |
| **Not a shrunk web app** | Native patterns: bottom tabs, sheets, swipe gestures |

---

## App Shell

### Global Layout

```
┌─────────────────────────┐
│ Status bar              │
├─────────────────────────┤
│ Header (optional)       │  ← 56px
├─────────────────────────┤
│                         │
│                         │
│   Scrollable content    │  ← flex
│                         │
│                         │
├─────────────────────────┤
│ Bottom tab bar          │  ← 56px + safe area
└─────────────────────────┘
          [ FAB ]           ← floats above tab bar
```

### Offline Banner

```
┌─────────────────────────┐
│ ⚠ Offline · 3 pending sync│  ← amber, tap → sync screen
└─────────────────────────┘
```

Appears below status bar when disconnected. Dismisses on reconnect.

---

## Navigation Map (Mobile)

| Tab | Route | Role default |
|-----|-------|--------------|
| Home | `/m/home` | All |
| Farms | `/m/farms` | Farmer, manager |
| Crops | `/m/crops` | Farmer, operator |
| Alerts | `/m/alerts` | All |
| More | `/m/more` | All |

Role overrides documented in `/ui/navigation-structure.md`.

---

## Screen 1: Home (`/m/home`)

Role-aware dashboard. See `/product/farmer-dashboard.md` for farmer variant.

### Universal Elements

| Element | Spec |
|---------|------|
| Header | Greeting + notification bell |
| Context | Farm name subtitle (if single) or switcher |
| Critical alert | Full-width banner if severity ≥ high |
| KPI carousel | Horizontal scroll, snap, 2 cards visible |
| Primary list | Tasks or role-specific widget |
| Quick actions | 2×2 grid, 72px touch targets |

---

## Screen 2: Quick Capture (`/m/capture`)

**Primary FAB action** — highest-priority mobile flow.

### Step 1 — Camera

```
┌─────────────────────────┐
│ ✕                 Flash │
├─────────────────────────┤
│                         │
│                         │
│      [ Viewfinder ]     │
│                         │
│                         │
├─────────────────────────┤
│ Field: Field 7 ▾        │
│ Crop: Corn 2026 ▾       │
├─────────────────────────┤
│      ( ◉ Capture )      │  ← 72px shutter button
│  Gallery    Notes       │
└─────────────────────────┘
```

Auto-detects field from GPS if inside boundary; manual override via dropdown.

### Step 2 — AI Scan

```
┌─────────────────────────┐
│ ← Capture               │
├─────────────────────────┤
│ [Photo]                 │
│ ████████░░ Scanning...  │
├─────────────────────────┤
│ Or save without AI →    │
└─────────────────────────┘
```

Offline: "Scan offline" if crop supported; else "Save — scan when online."

### Step 3 — Result

See `/wireframes/ai-assistant-screens.md` — Disease Detection Inline.

Mobile additions:
- Swipe up for treatment details
- Haptic on diagnosis complete
- **Create task** prominent if severity ≥ medium

---

## Screen 3: Farms List (`/m/farms`)

```
┌─────────────────────────┐
│ Farms              🔔   │
├─────────────────────────┤
│ 🔍 Search fields...     │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ [Mini map thumb]    │ │
│ │ Green Valley Farm   │ │
│ │ 8 fields · 45 ha    │ │
│ │ 2 need attention    │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ LIST VIEW               │
│ Field 2  ⚠ moisture     │
│ Field 7  ✓ on track     │
│ Field 5  ⚠ task due     │
└─────────────────────────┘
```

Toggle map/list in header. Single-farm users skip list → field list directly.

---

## Screen 4: Field Detail (`/m/farms/:farmId/fields/:fieldId`)

```
┌─────────────────────────┐
│ ← Fields    Field 7  ⋮  │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │  [Field map/sat]    │ │
│ └─────────────────────┘ │
│ 12.4 ha · Corn 2026 · W8│
├─────────────────────────┤
│ [Season][Tasks][Scout]  │  ← scroll tabs
├─────────────────────────┤
│ GROWTH STAGE            │
│ ████████░░ Vegetative   │
│                         │
│ ACTIVE TASKS            │
│ ☐ Scout for rust — Today│
│ ☐ Side-dress N — 3 days │
│                         │
│ LAST OBSERVATION        │
│ Photo · 2 days ago · OK │
│ [ View ] [ + New ]      │
├─────────────────────────┤
│ SOIL MOISTURE (IoT)     │
│ ██████░░░░ 62% · OK     │
└─────────────────────────┘
         [ 📷 Capture ]
```

Pull-to-refresh. ⋮ menu: Edit boundary (GPS walk), View soil, Share.

---

## Screen 5: GPS Field Walk (`/m/farms/.../fields/new`)

```
┌─────────────────────────┐
│ Walk field boundary     │
├─────────────────────────┤
│                         │
│    [ Map with path ]    │
│    live GPS trace       │
│                         │
├─────────────────────────┤
│ 842 m walked · ~2.1 ha  │
│ GPS accuracy: ±3m       │
├─────────────────────────┤
│ [ Pause ]  [ Complete ] │
└─────────────────────────┘
```

Complete → polygon preview → name field → save. Works fully offline.

---

## Screen 6: Crops / Tasks (`/m/crops`)

```
┌─────────────────────────┐
│ Crops & tasks      🔔   │
│ Season: 2026 Spring ▾   │
├─────────────────────────┤
│ [ Today ] [ Week ] [ All]│
├─────────────────────────┤
│ TODAY · 3 tasks         │
│ ┌─────────────────────┐ │
│ │ ☐ Spray Field 2     │ │
│ │   Fungicide · High  │ │
│ │   Due 5 PM          │ │
│ │   [ Complete ]      │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ☐ Scout Field 7     │ │
│ │   [ Start ] → opens │ │
│ │   capture flow      │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ OVERDUE · 1             │
│ ☐ Irrigate Field 5      │
└─────────────────────────┘
```

**Complete** inline for simple tasks. Complex tasks → detail screen.

---

## Screen 7: Task Detail (`/m/crops/tasks/:taskId`)

```
┌─────────────────────────┐
│ ← Tasks                 │
├─────────────────────────┤
│ Spray Field 2           │
│ Fungicide application   │
│                         │
│ Field 2 · Corn 2026     │
│ Due: Today, 5 PM        │
│ Priority: High          │
│ Assigned: Maria Santos  │
├─────────────────────────┤
│ INSTRUCTIONS            │
│ Apply Azoxystrobin at   │
│ 0.5 L/ha. Wind <15km/h. │
├─────────────────────────┤
│ CHECKLIST               │
│ ☑ Product prepared      │
│ ☐ Weather checked       │
│ ☐ Equipment calibrated  │
├─────────────────────────┤
│ NOTES                   │
│ ________________________│
│ [ Add photo ]           │
├─────────────────────────┤
│ [ Mark complete ]       │
└─────────────────────────┘
```

Completion prompts optional input logging → inventory deduct.

---

## Screen 8: Alerts (`/m/alerts`)

```
┌─────────────────────────┐
│ Alerts                  │
├─────────────────────────┤
│ [ All ] [ Weather ] [Tasks]│
├─────────────────────────┤
│ CRITICAL                │
│ ┌─────────────────────┐ │
│ │ 🥶 Frost risk Thu   │ │
│ │ Field 2, 3 · 80%    │ │
│ │ 2 hours ago         │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ TODAY                   │
│ ┌─────────────────────┐ │
│ │ 💧 Moisture low F5  │ │
│ │ Field 5 · 5h ago    │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ EARLIER                 │
│ ...                     │
└─────────────────────────┘
```

Swipe right to mark read. Tap → alert detail with recommended actions.

---

## Screen 9: Alert Detail

```
┌─────────────────────────┐
│ ← Alerts                │
├─────────────────────────┤
│ FROST RISK              │
│ Critical · 80% prob.    │
├─────────────────────────┤
│ Expected: Thu 19 Jun    │
│ 02:00–06:00 local       │
│ Affected: Field 2, 3    │
├─────────────────────────┤
│ RECOMMENDED ACTIONS     │
│ ☐ Delay irrigation      │
│ ☐ Check frost protection│
│ ☐ Document for insurance│
├─────────────────────────┤
│ [ Create tasks (3) ]    │
│ [ Ask AI for details ]  │
│ [ Dismiss ]             │
└─────────────────────────┘
```

---

## Screen 10: Weather (`/m/more/weather` or `/m/weather`)

```
┌─────────────────────────┐
│ ← More     Weather      │
│ Green Valley Farm ▾     │
├─────────────────────────┤
│      28°C               │
│   Partly cloudy         │
│ 💧 0mm  💨 12 km/h      │
├─────────────────────────┤
│ HOURLY                  │
│ ← [14][15][16][17] →    │
├─────────────────────────┤
│ 7-DAY                   │
│ M  T  W  T  F  S  S     │
│ 28 26 24 22 21 23 25    │
│  ⚠ frost Thu            │
├─────────────────────────┤
│ SPRAY WINDOW            │
│ ● Good now · until 2pm  │
└─────────────────────────┘
```

---

## Screen 11: More Menu (`/m/more`)

```
┌─────────────────────────┐
│ More                    │
├─────────────────────────┤
│ 🌧 Weather              │
│ 💧 Irrigation           │
│ 📦 Inventory            │
│ 🏪 Marketplace          │
│ 👥 CRM                  │
│ ✦ AI Assistant          │
│ 📊 Reports              │
│ ─────────────────       │
│ ⚙ Settings              │
│ 🔄 Sync · 3 pending     │
├─────────────────────────┤
│ Maria Santos            │
│ Valle Verde · Owner     │
└─────────────────────────┘
```

---

## Screen 12: Offline Sync (`/m/sync`)

```
┌─────────────────────────┐
│ ← More     Sync status  │
├─────────────────────────┤
│ ● Online                │
│ Last sync: 2 min ago    │
├─────────────────────────┤
│ PENDING (3)             │
│ ↑ Observation · Field 7 │
│ ↑ Task complete · F2    │
│ ↑ Photo upload · 2.1 MB │
├─────────────────────────┤
│ [ Sync now ]            │
├─────────────────────────┤
│ SYNC HISTORY            │
│ Today 14:32 · ✓ 5 items │
│ Today 09:15 · ✓ 2 items │
└─────────────────────────┘
```

Failed items: red badge, retry button, error reason.

---

## Screen 13: Barcode Scanner (`/m/inventory/scan`)

```
┌─────────────────────────┐
│ Scan product            │
├─────────────────────────┤
│                         │
│   [ Camera + overlay ]  │
│   Align barcode         │
│                         │
├─────────────────────────┤
│ Or enter SKU manually   │
└─────────────────────────┘
```

On match → stock movement flow (receive / consume).

---

## Screen 14: Marketplace Mobile

### Browse

Single-column listing cards. Filter icon → bottom sheet.

### Listing Detail

Photo carousel; sticky footer: **Make offer**.

### Offers

Card list; status chip; tap → negotiation thread (chat UI).

---

## Screen 15: AI Assistant Mobile

Full-screen chat. See `/wireframes/ai-assistant-screens.md` Screen 9.

Voice button enlarged. Suggested prompts as horizontal chips.

---

## Screen 16: Settings (`/m/more/settings`)

```
┌─────────────────────────┐
│ Settings                │
├─────────────────────────┤
│ Profile                 │
│ Language         Esp ▾  │
│ Units            Metric │
│ Notifications    →      │
│ Offline storage  128 MB │
│ ─────────────────       │
│ Help & support          │
│ Sign out                │
└─────────────────────────┘
```

---

## Screen 17: Login / Biometric

```
┌─────────────────────────┐
│                         │
│      🌱 Nertura         │
│                         │
│ Email                   │
│ [________________]      │
│ Password                │
│ [________________]      │
│                         │
│ [ Sign in ]             │
│                         │
│ Use Face ID next time ☑ │
│ Forgot password?        │
└─────────────────────────┘
```

Post-login: biometric prompt for return visits.

---

## Gestures & Interactions

| Gesture | Action |
|---------|--------|
| Pull down | Refresh current screen |
| Swipe right on alert | Mark read |
| Swipe right on task | Quick complete (with undo toast) |
| Long press field | Quick capture for that field |
| Pinch map | Standard map zoom |
| Back swipe (iOS) | Navigate back |

---

## Touch Targets

| Element | Minimum size |
|---------|--------------|
| Primary button | 48×48px |
| Tab bar item | 48px height |
| FAB | 56×56px |
| List row | 56px height |
| Checkbox | 44×44px tap area |

---

## Offline Capability Matrix

| Flow | Offline support |
|------|-----------------|
| View cached dashboard | ✓ |
| View cached fields/tasks | ✓ |
| Quick capture (photo) | ✓ (sync later) |
| Disease detection | ✓ top crops only |
| Complete task | ✓ (queued) |
| GPS field walk | ✓ |
| Weather | Cached last fetch |
| Marketplace browse | Cached listings |
| AI chat | ✗ |
| Create listing | ✗ (draft locally V2) |

---

## Push Notification Deep Links

| Notification type | Opens |
|-------------------|-------|
| Frost alert | `/m/alerts/:id` |
| Task overdue | `/m/crops/tasks/:id` |
| Marketplace offer | `/m/marketplace/offers/:id` |
| Low stock | `/m/inventory/products/:id` |
| Sync failed | `/m/sync` |

---

## Platform-Specific Notes

### iOS

- Safe area insets for notch/Dynamic Island
- Haptic feedback on task complete, AI result
- Live Activities for active irrigation [V2]
- Widget: today's tasks, weather [V2]

### Android

- Material You dynamic color optional (brand override default)
- Back button behavior: stack-aware
- Foreground service for GPS field walk

### PWA

- Install prompt after 3 sessions
- Service worker caches app shell + last dashboard
- Camera API for capture flow

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Cold start | <3s on 4G |
| Screen transition | <200ms |
| Offline capture save | <500ms |
| Photo upload (background) | Non-blocking |
| App size (native) | <40 MB initial |

---

## Accessibility (Mobile)

| Requirement | Implementation |
|-------------|----------------|
| Dynamic type | Support up to 200% scale |
| VoiceOver / TalkBack | All tabs and FAB labeled |
| Reduced motion | Disable parallax and scan animation |
| Color contrast | WCAG AA minimum |

---

## Screen Index

| # | Screen | Route |
|---|--------|-------|
| 1 | Home | `/m/home` |
| 2 | Quick Capture | `/m/capture` |
| 3 | Farms list | `/m/farms` |
| 4 | Field detail | `/m/farms/.../fields/:id` |
| 5 | GPS field walk | `/m/farms/.../fields/new` |
| 6 | Crops / tasks | `/m/crops` |
| 7 | Task detail | `/m/crops/tasks/:id` |
| 8 | Alerts list | `/m/alerts` |
| 9 | Alert detail | `/m/alerts/:id` |
| 10 | Weather | `/m/weather` |
| 11 | More menu | `/m/more` |
| 12 | Sync status | `/m/sync` |
| 13 | Barcode scan | `/m/inventory/scan` |
| 14 | Marketplace | `/m/marketplace/*` |
| 15 | AI Assistant | `/m/more/ai` |
| 16 | Settings | `/m/more/settings` |
| 17 | Login | `/login` |

---

*Document owner: Product Design*  
*Last updated: June 2026*  
*Navigation: `/ui/navigation-structure.md` · Sitemap: `/wireframes/platform-sitemap.md`*
