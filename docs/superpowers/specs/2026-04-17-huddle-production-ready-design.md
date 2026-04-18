# Huddle → Production-Ready App — Design Spec

**Date:** 2026-04-17
**Status:** Draft for user review
**Scope:** Take the current Huddle codebase from "scaffold + partial Firestore wiring" to a production-demoable app that delivers every feature advertised in the README.

## Problem

The README promises: study spot discovery (map + list), multi-metric ratings, group formation, preference-driven recommendations, user profiles, and criteria filters. The current codebase has:

- A working auth system (Firebase Auth).
- Partial Firestore services for spots, groups, ratings, users.
- A React UI that still reads hardcoded `src/data/studySpots.js` on the Discovery, Info, and SessionLog pages — so Firestore data never surfaces, and the rating flow writes against spot IDs that do not exist in the database.
- A phone-only fixed-width layout (`w-96`) that breaks on desktop.
- No map, no filters beyond a name search, no preferences, no recommendations, no tests, no seed data.
- A committed `Backend/serviceAccountKey.json` and unused legacy `Frontend/` and `Backend/` directories.

## Goals

1. Every feature advertised in the README works end-to-end against live Firestore.
2. Layout is responsive: mobile, tablet, desktop all usable.
3. Smoke-test coverage via Playwright for the primary user journeys.
4. Production hygiene: secrets out of git, error handling, code splitting, a11y baseline, CI.

## Non-Goals

- Rewriting the visual design language. The Marcellus-SC + Jost + warm gradient aesthetic stays.
- Native mobile apps.
- Push notifications, messaging, or payment features (not in README).
- Multi-campus support. Seed data is Berkeley-only.
- User-uploaded photos for spots. Existing static `image` field is enough.

---

## Phasing

Three phases, each commit-clean and independently shippable. User approves each phase before the next begins.

```
Phase 1 (Core loop works)
  └─> Phase 2 (README feature completion)
       └─> Phase 3 (Production hardening)
```

Each phase ends with a git tag (`phase-1-complete`, `phase-2-complete`, `phase-3-complete`) so the user can revert or demo from any checkpoint.

---

## Phase 1 — Core Loop Works

**Goal:** After Phase 1 a user can: sign up, sign in, browse real Firestore spots, filter them by criteria, open a spot, rate it, join it, see their activity in Insights — all against live Firestore on any screen size.

### 1.1 Stale-data bug fix

Replace all hardcoded imports of `src/data/studySpots.js` with the Firestore-backed `useApp().spots` already exposed by `AppContext`.

Affected files:
- `src/pages/study-spots/StudySpotDiscovery.jsx`
- `src/pages/study-spots/StudySpotInfo.jsx`
- `src/pages/study-spots/StudySessionLog.jsx`

After fix: delete `src/data/studySpots.js` (and `studySessions.js` if unreferenced — verify first).

### 1.2 ID normalization

Firestore uses string document IDs. The codebase is mixed:
- Local data: `parseInt(id)` and integer IDs (`1, 2, 3`).
- Firestore services: string IDs throughout.

Normalize to **strings everywhere**. Remove all `parseInt(id)` on spot/group IDs. Route params flow through as strings.

### 1.3 Firestore seed script

`scripts/seed.ts` (run via `npm run seed`):

- Idempotent: checks if a spot with a stable ID already exists; skips if yes.
- Uses `firebase-admin` with service account via environment variable (not the committed file).
- Seeds 10–12 Berkeley study spots with: `id` (stable slug, e.g., `doe-library`), `name`, `location`, `lat`, `lng`, `openHours` (see 2.2), `noiseLevel`, `outlets`, `lighting`, `crowded`, `roomType`, `description`, `image`, `ratingSum: 0`, `ratingCount: 0`.
- Instructions for running against live project and Firebase Emulator documented in `scripts/README.md`.

### 1.4 Criteria filters

Discovery page adds a filter bar:

- Noise level: `Silent | Medium | Loud | Any`
- Outlets: `Yes | No | Any`
- Lighting: `Bright | Medium | Dim | Any`
- Crowded: `Low | Medium | High | Any`
- Open now: toggle (uses `openHours` + client clock)

Filters are URL-backed via `useSearchParams` so filtered views are shareable. Default `Any` values are omitted from the URL.

A single `filterSpots(spots, filters)` utility in `src/utils/filterSpots.ts` is shared by the list and (Phase 2) the map.

### 1.5 Responsive layout

Replace the fixed `w-96 h-screen` phone frame.

- **Base container** (`AppLayout`): full viewport on mobile, max-width 640px centered on tablet, max-width 1280px on desktop.
- Discovery, Info, SessionLog, Groups, Insights: use the new container; inner content uses Tailwind responsive utilities.
- Keep the warm radial gradient as a **hero section** on Discovery (top 320px), not a full-screen background.
- `BottomNav` becomes a top bar on desktop (≥1024px) and stays as a bottom bar on mobile.
- Modals (`JoinModal`, `RateModal`, `CreateModal`) are centered and responsive.

### 1.6 Loading + empty states

- Every Firestore subscription has a loading state (skeleton cards or simple "Loading…" until the first snapshot arrives).
- Every list has an empty state with helpful copy ("No spots yet — seed data not loaded" etc.).
- Error state for Firestore errors: toast + inline message.

### 1.7 Playwright smoke test

`e2e/smoke.spec.ts` covers the golden path:

1. Sign up with a fresh test email.
2. See empty Discovery list.
3. After seed runs, reload and see spots.
4. Apply a filter, see list shrink.
5. Click a spot → see detail.
6. Submit a rating → see it in Insights.
7. Sign out → redirected to Login.

Playwright runs against:
- Vite preview server (`npm run build && npm run preview`).
- Firebase Emulator Suite (Auth + Firestore).
- Seed script runs against emulator before each test.

`npm run test:e2e` drives the whole thing locally. CI runs it headless.

### Phase 1 exit criteria

- `npm run build` passes.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run test:e2e` passes on a clean machine.
- Manual: sign-up → browse → filter → rate → insights loop works on mobile viewport (iPhone SE) and desktop viewport (1440×900) in Playwright.
- Tagged `phase-1-complete`.

---

## Phase 2 — README Feature Completion

**Goal:** Fulfil the remaining README bullets: map view, preferences, preference-driven group recommendations.

### 2.1 Map view (Leaflet + OpenStreetMap)

- `react-leaflet` + `leaflet` added as deps.
- Tiles from OpenStreetMap standard tile server (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`); attribution shown per OSM usage policy. Tile usage limit documented in `docs/tiles.md` — production use should self-host or switch to Mapbox.
- `MapView` component placed on Discovery:
  - **Mobile:** list/map toggle button at top of Discovery.
  - **Desktop:** side-by-side, list left (40%), map right (60%).
- Markers use current filter state; clicking a marker opens a popup card with spot name + CTA to `/study-spots/:id`.
- Default center: UC Berkeley campus (`37.8719, -122.2585`), zoom 15.

### 2.2 Spot coordinates + structured hours

`spots/{id}` adds:
```
lat: number
lng: number
openHours: {
  mon?: { open: "HH:mm", close: "HH:mm" } | { closed: true }
  tue?: ... (same shape)
  ...
  sun?: ...
}
```

Seed data in 1.3 already includes these — this section just specifies the shape and the `isOpenNow(spot, now)` utility in `src/utils/hours.ts` that the "open now" filter and spot card "Open / Closed" badge use.

### 2.3 User preferences

Add a `/profile` route (linked from Insights page).

- `preferences` object on `users/{uid}`:
  ```
  noiseLevel: "silent" | "medium" | "loud" | null
  outlets: "required" | "preferred" | "any" | null
  lighting: "bright" | "medium" | "dim" | null
  studyStyle: "solo" | "group" | "either" | null
  timeOfDay: "morning" | "afternoon" | "evening" | "night" | null
  ```
- Profile page lets the user view and edit these fields.
- Firestore rule update: only owner can update `preferences`.

### 2.4 Group recommendations

On `StudyGroupInfo`, add a "Recommended spots for this group" section.

- Algorithm (simple, documented, extensible):
  1. Aggregate preferences across `group.memberIds` (query each user doc, fall back to "any" for users with no preferences).
  2. For each spot, compute a match score: +1 for each dimension where the spot matches the majority preference (e.g., majority wants `silent` and spot is `Silent`). Open-now gets +2 if it matches a majority `timeOfDay`.
  3. Sort spots descending by score; show top 5.
- Ranking runs client-side on subscribed data (no Cloud Function needed).
- Cached in component state; recomputed when group members or filter state change.

### 2.5 Playwright coverage additions

- Map markers render and are clickable.
- Editing preferences persists across reload.
- Group detail shows recommended spots; list changes when a member's preferences change.

### Phase 2 exit criteria

- All Phase 1 criteria still hold.
- Manual demo: create two test users with different preferences, join them to a group, observe the group recommendation list update.
- Tagged `phase-2-complete`.

---

## Phase 3 — Production Hardening

**Goal:** Safety, performance, polish, and CI gating.

### 3.1 Secrets audit

- Verified `Backend/serviceAccountKey.json` is **not** tracked by git (gitignored). No history rewrite needed.
- Verify `.gitignore` still covers `*serviceAccountKey*.json`, `.env*` (except `.env.example`), and `.vercel`.
- Audit `git log -p -- '*serviceAccount*'` and `git log -p -- '*.env'` (excluding `.env.example`) to confirm no secrets were ever committed. If any are found, document the finding and ask the user for rotation + history-rewrite approval before acting.

### 3.2 Legacy directory cleanup

- Verify nothing in `src/` or `api/` references `Frontend/` or `Backend/`.
  - `api/index.js` does reference `../Backend/server` — remove `api/index.js` too since the app doesn't actually use the Express server (Vercel config and `package.json` scripts don't reference it).
- Delete `Frontend/` and `Backend/` directories.
- Update README's "Vercel Node API Setup (Team Runbook)" section — either delete (if we're Firestore-only) or reduce to an accurate description of what currently exists.

### 3.3 Code splitting

- `vite.config.js`: `build.rollupOptions.output.manualChunks` to split vendor (`react`, `react-dom`, `react-router-dom`, `firebase/*`, `leaflet`).
- Route-based lazy loading with `React.lazy()` + `Suspense` for page components in `App.jsx`.
- Target: the JS required for `/` (login page) stays under ~80KB gzip — route-level chunks for `/study-spots`, `/study-groups`, `/insights`, `/profile` load on demand. The Leaflet + `react-leaflet` bundle loads only when Discovery or a page using the map is visited.

### 3.4 Error boundary + toast

- `src/components/ErrorBoundary.jsx` wraps the app. Renders a friendly fallback with "Reload" button.
- `src/components/Toast.jsx` + `src/context/ToastContext.jsx` for non-blocking error/success messages.
- All service-layer throws route through a `useServiceCall` hook that catches and shows a toast.

### 3.5 Accessibility baseline

- All interactive elements are real `<button>` / `<a>` (some current clickable `<div>`s become buttons).
- Focus rings kept visible (no blanket `focus:outline-none`).
- Modals: focus trap + `Escape` to close + `aria-modal` + `role="dialog"`.
- Form inputs have associated labels.
- Color contrast audit on the gold-on-gold text in auth forms — bump to WCAG AA.

### 3.6 CI

`.github/workflows/ci.yml`:
- Jobs: `typecheck`, `lint`, `build`, `test:e2e` (with Firebase Emulator).
- All four must pass for PR merge.
- Secrets for emulator-based tests are not needed; production Firebase creds are not required in CI.

### Phase 3 exit criteria

- `git ls-files | grep -i serviceaccount` returns nothing.
- `Frontend/` and `Backend/` are gone.
- Initial JS bundle under 250KB gzip.
- `npm run test:e2e` passes with new a11y assertions (axe-core via `@axe-core/playwright`).
- All CI jobs green on a test PR.
- Tagged `phase-3-complete`.

---

## Risks & Open Questions

1. **Secret-in-git incident** — verified none exist at time of writing (`serviceAccountKey.json` is gitignored). Phase 3.1 audits history defensively. If we find anything mid-execution, work pauses for user decision before any history rewrite.
2. **Firebase emulator in CI** — the GitHub Actions runner must install the emulator. Adds ~30s to CI time. Acceptable.
3. **OSM tile usage limits** — fine for personal/demo; if this app is launched to a real user base, we'd need Mapbox or self-hosted tiles. Documented; not solved in this spec.
4. **Route lazy-loading + auth redirect timing** — `PublicOnly` and `RequireAuth` run before lazy pages load; need to make sure the Suspense fallback doesn't flicker. Handled in Phase 3.
5. **Preferences schema evolution** — I'm starting with 5 enum fields. If we need weights or free-text later, migrating existing docs is straightforward (fields are all optional, defaulting to null).

## Out of scope (explicitly)

- Push notifications / realtime chat.
- Photo upload for spots.
- Multi-campus support.
- Admin moderation tools.
- Offline mode / PWA install.
- SSR / Next.js migration.
- Analytics instrumentation.

## Success metric

After Phase 3, the following demo script runs end-to-end on mobile and desktop without intervention:

> "Open the app. Sign up. Browse 10 Berkeley study spots on a map. Filter for quiet, has outlets, open now. Open Doe Library. Rate it 5 stars. Join it. Create a study group for CS 61A, set meeting time. Open your profile, set your preferences. Go back to the group — see Doe Library ranked #1 in recommended spots. Download the group's meeting as a calendar invite. Sign out."

If that demo works on a machine I've never touched, backed by tests that run in CI, the project is production-demo ready.
