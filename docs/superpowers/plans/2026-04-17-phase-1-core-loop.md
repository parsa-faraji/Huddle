# Phase 1 — Core Loop Works (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After this plan, a user can sign up, browse real Firestore-backed study spots, filter them by criteria, open a spot, rate it, join it, and see their activity in Insights — on any screen size, covered by a Playwright smoke test.

**Architecture:** Keep React 19 + Vite + Tailwind 4 + Firebase. Introduce Vitest for pure-function unit tests, Playwright for e2e, Firebase Emulator Suite for hermetic e2e. Replace hardcoded local data with Firestore subscriptions already exposed via `AppContext`. Drop the fixed `w-96` phone frame in favor of a responsive container.

**Tech Stack:** React 19, React Router 7, Firebase SDK 10, firebase-admin (seed script only), Vitest, Playwright, Firebase Emulator Suite, TailwindCSS 4.

**Spec:** `docs/superpowers/specs/2026-04-17-huddle-production-ready-design.md` (Phase 1 section).

---

## File Structure

### New files
- `scripts/seedData.ts` — pure export of the Berkeley spot seed array + helper to validate shape.
- `scripts/seedData.test.ts` — Vitest tests for `seedData.ts`.
- `scripts/seed.ts` — firebase-admin-powered runner; writes `seedData` to Firestore idempotently.
- `scripts/README.md` — seed usage docs (live + emulator).
- `src/utils/filterSpots.ts` — pure filter function.
- `src/utils/filterSpots.test.ts` — Vitest.
- `src/utils/hours.ts` — `isOpenNow(spot, now)` + `openHoursLabel(spot, day)`.
- `src/utils/hours.test.ts` — Vitest.
- `src/components/LoadingState.jsx` — skeleton/spinner block.
- `src/components/EmptyState.jsx` — "nothing here yet" block with optional CTA.
- `src/components/FilterBar.jsx` — filter UI bound to URL search params.
- `src/components/navigation/TopBar.jsx` — desktop equivalent of `BottomNav`.
- `firebase.json` — add emulator config (extend existing file).
- `vitest.config.ts` — Vitest config.
- `playwright.config.ts` — Playwright config.
- `e2e/smoke.spec.ts` — Playwright smoke test.
- `e2e/helpers/auth.ts` — helper to sign up / sign in through the UI.
- `e2e/helpers/emulator.ts` — helpers to reset + seed emulator between tests.
- `.github/workflows/ci.yml` — extend/replace for typecheck + lint + unit + e2e.

### Modified files
- `src/pages/study-spots/StudySpotDiscovery.jsx` — use `useApp().spots`, add `FilterBar`, loading/empty states, responsive shell.
- `src/pages/study-spots/StudySpotInfo.jsx` — use `useApp().spots`, loading state, responsive shell.
- `src/pages/study-spots/StudySessionLog.jsx` — use `useApp().spots`, loading state, responsive shell.
- `src/pages/study-groups/StudyGroupDiscovery.jsx` — loading/empty states, responsive shell.
- `src/pages/study-groups/StudyGroupInfo.jsx` — loading state, responsive shell.
- `src/pages/study-groups/StudyGroupCreate.jsx` — responsive shell.
- `src/pages/Insights.jsx` — loading/empty states, responsive shell.
- `src/pages/auth/Login.jsx` — responsive container.
- `src/pages/auth/Signup.jsx` — responsive container.
- `src/layouts/AppLayout.jsx` — responsive: `BottomNav` on mobile, `TopBar` on desktop.
- `src/layouts/AuthLayout.jsx` — unchanged logic; verified responsive.
- `src/components/modals/JoinModal.jsx` — responsive width + focus.
- `src/components/modals/RateModal.jsx` — responsive.
- `src/components/modals/CreateModal.jsx` — responsive.
- `src/components/navigation/BottomNav.jsx` — hide on `md:` breakpoint and up.
- `src/components/cards/StudySpotCard.jsx` — drop `max-w-xs`; let parent size it.
- `src/components/cards/StudySpotCardL.jsx` — same.
- `src/components/cards/StudyGroupCard.jsx` / `StudyGroupCardL.jsx` — same.
- `package.json` — add devDeps + scripts.
- `.gitignore` — add `playwright-report/`, `test-results/`, `coverage/`.

### Deleted files
- `src/data/studySpots.js` — after all call sites migrated.
- `src/data/studySessions.js` — after verifying zero imports.

---

## Task 1: Install dev dependencies and add scripts

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Install runtime + dev deps**

```bash
npm install --save-dev vitest @vitest/ui firebase-tools firebase-admin \
  @playwright/test tsx cross-env
npx playwright install --with-deps chromium
```

- [ ] **Step 2: Edit `package.json` scripts section**

Replace the `"scripts"` block with:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview --port 4173 --strictPort",
  "typecheck": "tsc --noEmit",
  "lint": "eslint .",
  "test:unit": "vitest run",
  "test:unit:watch": "vitest",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "emulator": "firebase emulators:start --only auth,firestore",
  "emulator:export": "firebase emulators:export ./seed-export",
  "seed": "tsx scripts/seed.ts",
  "seed:emulator": "cross-env FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 tsx scripts/seed.ts"
}
```

- [ ] **Step 3: Append to `.gitignore`**

Add to end of `.gitignore`:

```
# Test artifacts
playwright-report/
test-results/
coverage/

# Firebase emulator
.firebase/
firebase-debug.log
firestore-debug.log
seed-export/
```

- [ ] **Step 4: Verify install**

Run: `npm run typecheck`
Expected: no errors.

Run: `npx vitest --version && npx playwright --version && npx firebase --version`
Expected: versions print without error.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: add vitest, playwright, firebase emulator tooling"
```

---

## Task 2: Configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `src/utils/.gitkeep` (ensures directory exists)
- Create: `scripts/.gitkeep`

- [ ] **Step 1: Write `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.{ts,tsx,js,jsx}', 'scripts/**/*.test.{ts,tsx,js,jsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],
  },
});
```

- [ ] **Step 2: Create placeholder directories**

```bash
mkdir -p src/utils scripts
touch src/utils/.gitkeep scripts/.gitkeep
```

- [ ] **Step 3: Verify Vitest runs (no tests yet)**

Run: `npm run test:unit`
Expected: "No test files found" (exit code 0 or 1, either is fine for now).

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts src/utils/.gitkeep scripts/.gitkeep
git commit -m "chore: add vitest config with node environment"
```

---

## Task 3: Configure Firebase Emulator

**Files:**
- Modify: `firebase.json`

- [ ] **Step 1: Overwrite `firebase.json`**

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "ui": { "enabled": true, "port": 4000 },
    "singleProjectMode": true
  }
}
```

- [ ] **Step 2: Verify emulator starts**

Run in one terminal: `npm run emulator`
Expected: "All emulators ready! It is now safe to connect your app."

Leave it running for the next tasks; stop with Ctrl-C when done. (Plan steps that need the emulator will say so explicitly.)

- [ ] **Step 3: Commit**

```bash
git add firebase.json
git commit -m "chore: configure firebase emulator suite for auth + firestore"
```

---

## Task 4: Seed data module (TDD)

**Files:**
- Create: `scripts/seedData.ts`
- Create: `scripts/seedData.test.ts`

- [ ] **Step 1: Write the failing test**

`scripts/seedData.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { seedSpots, SeedSpot } from './seedData';

describe('seedSpots', () => {
  it('contains at least 10 spots', () => {
    expect(seedSpots.length).toBeGreaterThanOrEqual(10);
  });

  it('every spot has a stable string id', () => {
    for (const s of seedSpots) {
      expect(typeof s.id).toBe('string');
      expect(s.id.length).toBeGreaterThan(0);
      expect(s.id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('every spot has lat/lng near Berkeley', () => {
    for (const s of seedSpots) {
      expect(s.lat).toBeGreaterThan(37.85);
      expect(s.lat).toBeLessThan(37.89);
      expect(s.lng).toBeGreaterThan(-122.28);
      expect(s.lng).toBeLessThan(-122.24);
    }
  });

  it('every spot has openHours with at least one weekday', () => {
    const weekdays: Array<keyof SeedSpot['openHours']> = [
      'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun',
    ];
    for (const s of seedSpots) {
      const defined = weekdays.filter((d) => s.openHours[d] !== undefined);
      expect(defined.length).toBeGreaterThan(0);
    }
  });

  it('every noiseLevel is Silent | Medium | Loud', () => {
    for (const s of seedSpots) {
      expect(['Silent', 'Medium', 'Loud']).toContain(s.noiseLevel);
    }
  });

  it('spot ids are unique', () => {
    const ids = seedSpots.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module './seedData'`.

- [ ] **Step 3: Write `scripts/seedData.ts`**

```typescript
export type DaySchedule = { open: string; close: string } | { closed: true };

export interface SeedSpot {
  id: string;
  name: string;
  location: string;
  description: string;
  distance: number;
  lat: number;
  lng: number;
  noiseLevel: 'Silent' | 'Medium' | 'Loud';
  outlets: boolean;
  lighting: 'Bright' | 'Medium' | 'Dim';
  crowded: 'Low' | 'Medium' | 'High';
  roomType: string;
  image: string;
  openHours: {
    mon?: DaySchedule;
    tue?: DaySchedule;
    wed?: DaySchedule;
    thu?: DaySchedule;
    fri?: DaySchedule;
    sat?: DaySchedule;
    sun?: DaySchedule;
  };
}

const weekdays9to9: SeedSpot['openHours'] = {
  mon: { open: '09:00', close: '21:00' },
  tue: { open: '09:00', close: '21:00' },
  wed: { open: '09:00', close: '21:00' },
  thu: { open: '09:00', close: '21:00' },
  fri: { open: '09:00', close: '18:00' },
  sat: { open: '10:00', close: '17:00' },
  sun: { closed: true },
};

const cafeHours: SeedSpot['openHours'] = {
  mon: { open: '07:00', close: '20:00' },
  tue: { open: '07:00', close: '20:00' },
  wed: { open: '07:00', close: '20:00' },
  thu: { open: '07:00', close: '20:00' },
  fri: { open: '07:00', close: '20:00' },
  sat: { open: '08:00', close: '20:00' },
  sun: { open: '08:00', close: '18:00' },
};

const late: SeedSpot['openHours'] = {
  mon: { open: '08:00', close: '23:00' },
  tue: { open: '08:00', close: '23:00' },
  wed: { open: '08:00', close: '23:00' },
  thu: { open: '08:00', close: '23:00' },
  fri: { open: '08:00', close: '22:00' },
  sat: { open: '10:00', close: '22:00' },
  sun: { open: '10:00', close: '22:00' },
};

export const seedSpots: SeedSpot[] = [
  {
    id: 'doe-library',
    name: 'Doe Library',
    location: 'On campus',
    description: 'Convenient, beautiful library with quiet reading rooms.',
    distance: 0.3,
    lat: 37.8724,
    lng: -122.2596,
    noiseLevel: 'Silent',
    outlets: true,
    lighting: 'Bright',
    crowded: 'Medium',
    roomType: 'Library',
    image: '/cat.webp',
    openHours: weekdays9to9,
  },
  {
    id: 'moffitt-library',
    name: 'Moffitt Library',
    location: 'On campus',
    description: 'Undergraduate library with group study floors and 24/5 access.',
    distance: 0.2,
    lat: 37.8725,
    lng: -122.2605,
    noiseLevel: 'Medium',
    outlets: true,
    lighting: 'Bright',
    crowded: 'High',
    roomType: 'Library',
    image: '/cat.webp',
    openHours: late,
  },
  {
    id: 'main-stacks',
    name: 'Main Stacks',
    location: 'On campus',
    description: 'Underground stacks — deeply quiet, rows of desks.',
    distance: 0.3,
    lat: 37.8722,
    lng: -122.2596,
    noiseLevel: 'Silent',
    outlets: true,
    lighting: 'Dim',
    crowded: 'Low',
    roomType: 'Library',
    image: '/cat.webp',
    openHours: weekdays9to9,
  },
  {
    id: 'mlk-student-union',
    name: 'MLK Student Union',
    location: 'On campus',
    description: 'Collaborative lounges, food nearby.',
    distance: 0.5,
    lat: 37.8690,
    lng: -122.2596,
    noiseLevel: 'Medium',
    outlets: true,
    lighting: 'Medium',
    crowded: 'High',
    roomType: 'Student Center',
    image: '/anothercat.jpg',
    openHours: late,
  },
  {
    id: 'cafe-strada',
    name: 'Cafe Strada',
    location: 'Off campus',
    description: 'Great outdoor patio, strong coffee.',
    distance: 0.4,
    lat: 37.8697,
    lng: -122.2546,
    noiseLevel: 'Loud',
    outlets: false,
    lighting: 'Dim',
    crowded: 'Medium',
    roomType: 'Cafe',
    image: '/yetanothercat.jpg',
    openHours: cafeHours,
  },
  {
    id: 'free-speech-cafe',
    name: 'Free Speech Movement Cafe',
    location: 'On campus',
    description: 'Tucked into Moffitt, good for caffeinated grinding.',
    distance: 0.25,
    lat: 37.8725,
    lng: -122.2608,
    noiseLevel: 'Medium',
    outlets: true,
    lighting: 'Bright',
    crowded: 'High',
    roomType: 'Cafe',
    image: '/cat.webp',
    openHours: {
      mon: { open: '08:00', close: '20:00' },
      tue: { open: '08:00', close: '20:00' },
      wed: { open: '08:00', close: '20:00' },
      thu: { open: '08:00', close: '20:00' },
      fri: { open: '08:00', close: '18:00' },
      sat: { closed: true },
      sun: { closed: true },
    },
  },
  {
    id: 'soda-hall',
    name: 'Soda Hall Lounge',
    location: 'On campus',
    description: 'CS building lounge — plenty of whiteboards.',
    distance: 0.6,
    lat: 37.8754,
    lng: -122.2589,
    noiseLevel: 'Medium',
    outlets: true,
    lighting: 'Bright',
    crowded: 'Medium',
    roomType: 'Academic',
    image: '/cat.webp',
    openHours: late,
  },
  {
    id: 'engineering-library',
    name: 'Kresge Engineering Library',
    location: 'On campus',
    description: 'Quiet engineering library with big tables.',
    distance: 0.5,
    lat: 37.8731,
    lng: -122.2589,
    noiseLevel: 'Silent',
    outlets: true,
    lighting: 'Bright',
    crowded: 'Low',
    roomType: 'Library',
    image: '/cat.webp',
    openHours: weekdays9to9,
  },
  {
    id: 'wurster-hall',
    name: 'Wurster Hall Courtyard',
    location: 'On campus',
    description: 'Open-air design studio vibes; great in spring.',
    distance: 0.6,
    lat: 37.8706,
    lng: -122.2548,
    noiseLevel: 'Medium',
    outlets: false,
    lighting: 'Bright',
    crowded: 'Low',
    roomType: 'Outdoor',
    image: '/anothercat.jpg',
    openHours: weekdays9to9,
  },
  {
    id: 'yalis-cafe',
    name: "Yali's Cafe",
    location: 'Off campus',
    description: 'Big windows, plenty of outlets, strong wifi.',
    distance: 0.35,
    lat: 37.8730,
    lng: -122.2682,
    noiseLevel: 'Medium',
    outlets: true,
    lighting: 'Bright',
    crowded: 'Medium',
    roomType: 'Cafe',
    image: '/yetanothercat.jpg',
    openHours: cafeHours,
  },
  {
    id: 'north-gate-hall',
    name: 'North Gate Hall',
    location: 'On campus',
    description: 'Quiet journalism building nooks.',
    distance: 0.4,
    lat: 37.8758,
    lng: -122.2601,
    noiseLevel: 'Silent',
    outlets: true,
    lighting: 'Bright',
    crowded: 'Low',
    roomType: 'Academic',
    image: '/cat.webp',
    openHours: weekdays9to9,
  },
];
```

- [ ] **Step 4: Run tests**

Run: `npm run test:unit`
Expected: PASS — all seed data tests green.

- [ ] **Step 5: Commit**

```bash
git add scripts/seedData.ts scripts/seedData.test.ts
git commit -m "feat(seed): add 11 Berkeley study spots with coordinates and structured hours"
```

---

## Task 5: Seed runner

**Files:**
- Create: `scripts/seed.ts`
- Create: `scripts/README.md`

- [ ] **Step 1: Write `scripts/seed.ts`**

```typescript
import { cert, getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'node:fs';
import { seedSpots } from './seedData';

const EMULATOR = !!process.env.FIRESTORE_EMULATOR_HOST;
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT
  ?? process.env.GCLOUD_PROJECT
  ?? process.env.FIREBASE_PROJECT_ID
  ?? 'huddle-5ae58';

function init() {
  if (getApps().length > 0) return;
  if (EMULATOR) {
    console.log(`[seed] Using Firestore emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`);
    initializeApp({ projectId: PROJECT_ID });
    return;
  }
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath && existsSync(keyPath)) {
    console.log(`[seed] Using service account at ${keyPath}`);
    const svc = JSON.parse(readFileSync(keyPath, 'utf8'));
    initializeApp({ credential: cert(svc), projectId: PROJECT_ID });
    return;
  }
  console.log('[seed] Using application default credentials');
  initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
}

async function run() {
  init();
  const db = getFirestore();
  let created = 0;
  let skipped = 0;
  for (const spot of seedSpots) {
    const ref = db.collection('spots').doc(spot.id);
    const snap = await ref.get();
    if (snap.exists) {
      skipped++;
      continue;
    }
    const { id: _id, ...rest } = spot;
    await ref.set({
      ...rest,
      ratingSum: 0,
      ratingCount: 0,
      createdAt: new Date(),
    });
    created++;
  }
  console.log(`[seed] Done. Created: ${created}, Skipped (already existed): ${skipped}`);
}

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Write `scripts/README.md`**

````markdown
# Scripts

## `seed` — Populate Firestore with study spots

Seeds 11 Berkeley study spots. Idempotent: spots with existing IDs are skipped.

### Against Firebase Emulator (recommended for dev/test)

```bash
# Terminal 1: start the emulator
npm run emulator

# Terminal 2: seed it
npm run seed:emulator
```

### Against live Firestore

You need a Firebase service account JSON with Firestore write access.

```bash
export FIREBASE_SERVICE_ACCOUNT_PATH=/absolute/path/to/serviceAccountKey.json
npm run seed
```

Alternatively, set `GOOGLE_APPLICATION_CREDENTIALS` (standard Google SDK env var).

### Output

```
[seed] Using Firestore emulator at 127.0.0.1:8080
[seed] Done. Created: 11, Skipped (already existed): 0
```

Running twice:

```
[seed] Done. Created: 0, Skipped (already existed): 11
```
````

- [ ] **Step 3: Run seed against emulator**

In terminal 1: `npm run emulator` (keep running).
In terminal 2: `npm run seed:emulator`

Expected output:
```
[seed] Using Firestore emulator at 127.0.0.1:8080
[seed] Done. Created: 11, Skipped (already existed): 0
```

Re-run `npm run seed:emulator`:
```
[seed] Done. Created: 0, Skipped (already existed): 11
```

Open `http://localhost:4000/firestore` and confirm 11 docs in `spots`.

- [ ] **Step 4: Stop the emulator** (Ctrl-C in terminal 1).

- [ ] **Step 5: Commit**

```bash
git add scripts/seed.ts scripts/README.md
git commit -m "feat(seed): add idempotent Firestore seed runner with emulator support"
```

---

## Task 6: `filterSpots` utility (TDD)

**Files:**
- Create: `src/utils/filterSpots.ts`
- Create: `src/utils/filterSpots.test.ts`

- [ ] **Step 1: Write the failing test**

`src/utils/filterSpots.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { filterSpots, SpotFilters } from './filterSpots';

const spots = [
  { id: 'a', name: 'Doe', noiseLevel: 'Silent', outlets: true,  lighting: 'Bright', crowded: 'Low' },
  { id: 'b', name: 'MLK', noiseLevel: 'Medium', outlets: true,  lighting: 'Medium', crowded: 'High' },
  { id: 'c', name: 'Strada', noiseLevel: 'Loud', outlets: false, lighting: 'Dim',    crowded: 'Medium' },
];

describe('filterSpots', () => {
  it('returns all when no filters set', () => {
    expect(filterSpots(spots as never, {} as SpotFilters).length).toBe(3);
  });

  it('filters by name (case-insensitive)', () => {
    expect(filterSpots(spots as never, { q: 'doe' } as SpotFilters).map((s) => s.id)).toEqual(['a']);
    expect(filterSpots(spots as never, { q: 'DOE' } as SpotFilters).map((s) => s.id)).toEqual(['a']);
  });

  it('filters by noise level', () => {
    expect(filterSpots(spots as never, { noise: 'silent' } as SpotFilters).map((s) => s.id)).toEqual(['a']);
    expect(filterSpots(spots as never, { noise: 'loud' } as SpotFilters).map((s) => s.id)).toEqual(['c']);
  });

  it('filters by outlets=true/false', () => {
    expect(filterSpots(spots as never, { outlets: 'true' } as SpotFilters).map((s) => s.id)).toEqual(['a', 'b']);
    expect(filterSpots(spots as never, { outlets: 'false' } as SpotFilters).map((s) => s.id)).toEqual(['c']);
  });

  it('filters by lighting', () => {
    expect(filterSpots(spots as never, { lighting: 'dim' } as SpotFilters).map((s) => s.id)).toEqual(['c']);
  });

  it('filters by crowded', () => {
    expect(filterSpots(spots as never, { crowded: 'low' } as SpotFilters).map((s) => s.id)).toEqual(['a']);
  });

  it('combines filters with AND semantics', () => {
    expect(
      filterSpots(spots as never, { noise: 'medium', outlets: 'true' } as SpotFilters).map((s) => s.id),
    ).toEqual(['b']);
  });

  it('treats empty string filter values as "any"', () => {
    expect(
      filterSpots(spots as never, { noise: '', outlets: '' } as SpotFilters).length,
    ).toBe(3);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module './filterSpots'`.

- [ ] **Step 3: Write `src/utils/filterSpots.ts`**

```typescript
export interface SpotFilters {
  q?: string;
  noise?: string;      // 'silent' | 'medium' | 'loud' | '' | undefined
  outlets?: string;    // 'true' | 'false' | '' | undefined
  lighting?: string;   // 'bright' | 'medium' | 'dim' | '' | undefined
  crowded?: string;    // 'low' | 'medium' | 'high' | '' | undefined
  open?: string;       // 'now' | '' | undefined — handled separately in Discovery via isOpenNow
}

interface FilterableSpot {
  id: string;
  name: string;
  noiseLevel?: string;
  outlets?: boolean;
  lighting?: string;
  crowded?: string;
}

function eqLower(a: string | undefined, b: string | undefined): boolean {
  return (a ?? '').toLowerCase() === (b ?? '').toLowerCase();
}

export function filterSpots<T extends FilterableSpot>(spots: T[], filters: SpotFilters): T[] {
  const q = (filters.q ?? '').trim().toLowerCase();
  return spots.filter((s) => {
    if (q && !s.name.toLowerCase().includes(q)) return false;
    if (filters.noise) {
      if (!eqLower(s.noiseLevel, filters.noise)) return false;
    }
    if (filters.outlets === 'true' && s.outlets !== true) return false;
    if (filters.outlets === 'false' && s.outlets !== false) return false;
    if (filters.lighting) {
      if (!eqLower(s.lighting, filters.lighting)) return false;
    }
    if (filters.crowded) {
      if (!eqLower(s.crowded, filters.crowded)) return false;
    }
    return true;
  });
}
```

- [ ] **Step 4: Run tests**

Run: `npm run test:unit`
Expected: PASS — all filterSpots tests green.

- [ ] **Step 5: Commit**

```bash
git add src/utils/filterSpots.ts src/utils/filterSpots.test.ts
git commit -m "feat(utils): add filterSpots with tests"
```

---

## Task 7: `hours` utility (TDD)

**Files:**
- Create: `src/utils/hours.ts`
- Create: `src/utils/hours.test.ts`

- [ ] **Step 1: Write the failing test**

`src/utils/hours.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { isOpenNow, weekdayKey } from './hours';

const allDay = { open: '00:00', close: '23:59' };
const nineToFive = { open: '09:00', close: '17:00' };
const closed = { closed: true as const };

describe('weekdayKey', () => {
  it('maps Sunday (getDay=0) to "sun"', () => {
    const sun = new Date('2026-04-12T12:00:00');
    expect(weekdayKey(sun)).toBe('sun');
  });
  it('maps Monday to "mon"', () => {
    const mon = new Date('2026-04-13T12:00:00');
    expect(weekdayKey(mon)).toBe('mon');
  });
  it('maps Saturday to "sat"', () => {
    const sat = new Date('2026-04-18T12:00:00');
    expect(weekdayKey(sat)).toBe('sat');
  });
});

describe('isOpenNow', () => {
  it('returns false if no openHours', () => {
    expect(isOpenNow({}, new Date('2026-04-13T12:00:00'))).toBe(false);
  });

  it('returns false for a closed day', () => {
    expect(
      isOpenNow({ openHours: { mon: closed } }, new Date('2026-04-13T12:00:00')),
    ).toBe(false);
  });

  it('returns true within open window', () => {
    expect(
      isOpenNow({ openHours: { mon: nineToFive } }, new Date('2026-04-13T10:00:00')),
    ).toBe(true);
  });

  it('returns false before open', () => {
    expect(
      isOpenNow({ openHours: { mon: nineToFive } }, new Date('2026-04-13T08:00:00')),
    ).toBe(false);
  });

  it('returns false after close', () => {
    expect(
      isOpenNow({ openHours: { mon: nineToFive } }, new Date('2026-04-13T18:00:00')),
    ).toBe(false);
  });

  it('handles a day with no schedule defined', () => {
    expect(
      isOpenNow({ openHours: { mon: allDay } }, new Date('2026-04-14T12:00:00')),
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module './hours'`.

- [ ] **Step 3: Write `src/utils/hours.ts`**

```typescript
export type DaySchedule = { open: string; close: string } | { closed: true };

export type WeekdayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export interface HasHours {
  openHours?: Partial<Record<WeekdayKey, DaySchedule>>;
}

const ORDER: WeekdayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function weekdayKey(d: Date): WeekdayKey {
  return ORDER[d.getDay()];
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function isOpenNow(spot: HasHours, now: Date = new Date()): boolean {
  const sched = spot.openHours?.[weekdayKey(now)];
  if (!sched) return false;
  if ('closed' in sched) return false;
  const nowM = now.getHours() * 60 + now.getMinutes();
  return nowM >= toMinutes(sched.open) && nowM <= toMinutes(sched.close);
}
```

- [ ] **Step 4: Run tests**

Run: `npm run test:unit`
Expected: PASS — all hours tests green.

- [ ] **Step 5: Commit**

```bash
git add src/utils/hours.ts src/utils/hours.test.ts
git commit -m "feat(utils): add isOpenNow + weekdayKey with tests"
```

---

## Task 8: Fix stale-data bug in `StudySpotDiscovery`

**Files:**
- Modify: `src/pages/study-spots/StudySpotDiscovery.jsx`

- [ ] **Step 1: Replace file contents**

```jsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StudySpotCard from "../../components/cards/StudySpotCard";
import { useApp } from "../../context/AppContext";
import { filterSpots } from "../../utils/filterSpots";
import { isOpenNow } from "../../utils/hours";

export default function StudySpotDiscovery() {
  const navigate = useNavigate();
  const { spots } = useApp();
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");

  const filters = {
    q: search,
    noise: params.get("noise") || "",
    outlets: params.get("outlets") || "",
    lighting: params.get("lighting") || "",
    crowded: params.get("crowded") || "",
  };
  const openNowOnly = params.get("open") === "now";

  let visible = filterSpots(spots, filters);
  if (openNowOnly) visible = visible.filter((s) => isOpenNow(s));

  return (
    <div className="flex justify-center min-h-screen bg-white">
      <div className="w-full max-w-md md:max-w-4xl flex flex-col items-center px-4 md:px-8 pt-20 pb-24
                      bg-[radial-gradient(ellipse_at_50%_0%,_#FFB000_0%,_#FFDC90_40%,_#FFFFFF_70%)]">
        <h1 className="absolute left-6 top-6 text-5xl font-['Marcellus_SC'] text-black">Huddle</h1>

        <h2 className="text-center text-black font-medium text-lg mt-10" style={{ fontFamily: "'Jost', sans-serif" }}>
          Find a study spot!
        </h2>

        <div className="w-full max-w-md mt-6 flex justify-center">
          <input
            type="text"
            placeholder="Search study spots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ fontFamily: "'Jost', sans-serif" }}
            data-testid="spot-search"
          />
        </div>

        <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.length === 0 ? (
            <p
              className="text-black text-center py-12 col-span-full"
              style={{ fontFamily: "'Jost', sans-serif" }}
              data-testid="empty-spots"
            >
              No spots match your search.
            </p>
          ) : (
            visible.map((spot) => (
              <StudySpotCard
                key={spot.id}
                spot={spot}
                onViewClick={() => navigate(`/study-spots/${spot.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add src/pages/study-spots/StudySpotDiscovery.jsx
git commit -m "fix(spots): read Discovery spots from Firestore via AppContext"
```

---

## Task 9: Fix stale-data bug in `StudySpotInfo`

**Files:**
- Modify: `src/pages/study-spots/StudySpotInfo.jsx`

- [ ] **Step 1: Replace file contents**

```jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudySpotCardL from "../../components/cards/StudySpotCardL";
import JoinModal from "../../components/modals/JoinModal";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import { useApp } from "../../context/AppContext";

export default function StudySpotInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { spots, joinSpot } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (spots.length === 0) return <LoadingState label="Loading spot..." />;

  const spot = spots.find((s) => s.id === id);
  if (!spot) {
    return (
      <EmptyState
        title="Study Spot not found."
        actionLabel="Back to spots"
        onAction={() => navigate("/study-spots")}
      />
    );
  }

  const handleConfirmJoin = async () => {
    if (joinSpot) await joinSpot(spot);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex justify-center min-h-screen bg-white">
        <div className="w-full max-w-md md:max-w-3xl flex flex-col items-center px-4 md:px-8 pt-20 pb-24
                        bg-[radial-gradient(ellipse_at_50%_0%,_#FFB000_0%,_#FFDC90_40%,_#FFFFFF_70%)]">
          <h1 className="absolute left-6 top-6 text-5xl font-['Marcellus_SC'] text-black">Huddle</h1>

          <div className="mt-10 flex flex-col items-center w-full max-w-sm gap-4">
            <StudySpotCardL
              data={spot}
              buttonText="Join"
              onJoin={() => setIsModalOpen(true)}
            />
            <button
              type="button"
              onClick={() => navigate(`/study-spots/log/${spot.id}`)}
              className="w-full bg-sky-950 text-white font-bold text-sm rounded-3xl py-3 cursor-pointer hover:bg-sky-900 transition"
              style={{ fontFamily: "'Jost', sans-serif" }}
              data-testid="rate-spot-cta"
            >
              Rate this spot
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <JoinModal
          group={spot}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmJoin}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: pass. (Note: `LoadingState` and `EmptyState` are placeholders until Task 11. For now, Vite will emit a missing-module error. Skip build; commit and fix in Task 11.)

Alternative — temporarily stub the imports:

Create `src/components/LoadingState.jsx` with:
```jsx
export default function LoadingState({ label = "Loading..." }) {
  return <p className="p-8 text-center">{label}</p>;
}
```

Create `src/components/EmptyState.jsx` with:
```jsx
export default function EmptyState({ title, actionLabel, onAction }) {
  return (
    <div className="p-8 text-center">
      <p>{title}</p>
      {actionLabel && <button onClick={onAction} className="mt-4 underline">{actionLabel}</button>}
    </div>
  );
}
```

(Task 11 replaces these with styled versions.)

Run: `npm run typecheck && npm run build`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/pages/study-spots/StudySpotInfo.jsx src/components/LoadingState.jsx src/components/EmptyState.jsx
git commit -m "fix(spots): read SpotInfo from Firestore; stub loading/empty states"
```

---

## Task 10: Fix stale-data bug in `StudySessionLog`

**Files:**
- Modify: `src/pages/study-spots/StudySessionLog.jsx`

- [ ] **Step 1: Replace the first five lines**

Find:
```jsx
import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { studySpots } from "../../data/studySpots";
import RateModal from "../../components/modals/RateModal";
```

Replace with:
```jsx
import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import RateModal from "../../components/modals/RateModal";
```

- [ ] **Step 2: Replace the `spot` lookup**

Find:
```jsx
  const { addSession } = useApp(); 
  const { id } = useParams(); // match the route param /study-spots/log/:id
  const navigate = useNavigate();
  const spot = studySpots.find(s => s.id === parseInt(id));
```

Replace with:
```jsx
  const { addSession, spots } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const spot = spots.find((s) => s.id === id);
```

- [ ] **Step 3: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/pages/study-spots/StudySessionLog.jsx
git commit -m "fix(spots): read SessionLog spot from Firestore; drop parseInt"
```

---

## Task 11: Styled loading + empty state components

**Files:**
- Modify: `src/components/LoadingState.jsx`
- Modify: `src/components/EmptyState.jsx`

- [ ] **Step 1: Replace `src/components/LoadingState.jsx`**

```jsx
export default function LoadingState({ label = "Loading..." }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-white"
      style={{ fontFamily: "'Jost', sans-serif" }}
      data-testid="loading"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-amber-300 border-t-transparent animate-spin" />
        <p className="text-black text-sm">{label}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `src/components/EmptyState.jsx`**

```jsx
export default function EmptyState({ title, subtitle, actionLabel, onAction }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-16 px-4"
      style={{ fontFamily: "'Jost', sans-serif" }}
      data-testid="empty-state"
    >
      <p className="text-black text-base font-medium">{title}</p>
      {subtitle && <p className="text-gray-600 text-sm mt-2 max-w-sm">{subtitle}</p>}
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-6 px-6 py-2 rounded-full bg-sky-950 text-white font-bold text-sm cursor-pointer hover:bg-sky-900"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/LoadingState.jsx src/components/EmptyState.jsx
git commit -m "feat(ui): styled LoadingState and EmptyState components"
```

---

## Task 12: Delete unused local data

**Files:**
- Delete: `src/data/studySpots.js`
- Delete: `src/data/studySessions.js` (if unreferenced)

- [ ] **Step 1: Verify no imports remain**

Run (expect zero matches):
```bash
grep -rn "data/studySpots" src/ scripts/ e2e/ 2>/dev/null || true
grep -rn "data/studySessions" src/ scripts/ e2e/ 2>/dev/null || true
grep -rn "data/studyGroups" src/ scripts/ e2e/ 2>/dev/null || true
```

If any match is found, stop and report — we need to migrate that callsite first. `studyGroups.js` is also dead code (groups come from Firestore); delete too if no matches.

- [ ] **Step 2: Delete the files**

```bash
rm src/data/studySpots.js src/data/studySessions.js src/data/studyGroups.js
rmdir src/data 2>/dev/null || true
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add -A src/data
git commit -m "chore: remove hardcoded local data files now that Firestore is the source"
```

---

## Task 13: FilterBar component

**Files:**
- Create: `src/components/FilterBar.jsx`

- [ ] **Step 1: Write `src/components/FilterBar.jsx`**

```jsx
import { useSearchParams } from "react-router-dom";

const OPTIONS = [
  { key: "noise",    label: "Noise",    values: ["", "silent", "medium", "loud"],   display: ["Any", "Silent", "Medium", "Loud"] },
  { key: "outlets",  label: "Outlets",  values: ["", "true", "false"],              display: ["Any", "Yes", "No"] },
  { key: "lighting", label: "Lighting", values: ["", "bright", "medium", "dim"],    display: ["Any", "Bright", "Medium", "Dim"] },
  { key: "crowded",  label: "Crowded",  values: ["", "low", "medium", "high"],      display: ["Any", "Low", "Medium", "High"] },
];

export default function FilterBar() {
  const [params, setParams] = useSearchParams();

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === "" || value == null) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const toggleOpenNow = () => {
    const next = new URLSearchParams(params);
    if (next.get("open") === "now") next.delete("open");
    else next.set("open", "now");
    setParams(next, { replace: true });
  };

  const openNow = params.get("open") === "now";

  return (
    <div
      className="w-full bg-white/70 backdrop-blur rounded-2xl p-3 shadow-sm flex flex-wrap gap-3 items-end"
      style={{ fontFamily: "'Jost', sans-serif" }}
      data-testid="filter-bar"
    >
      {OPTIONS.map((opt) => (
        <label key={opt.key} className="flex flex-col text-xs text-black">
          <span className="mb-1 font-semibold">{opt.label}</span>
          <select
            value={params.get(opt.key) ?? ""}
            onChange={(e) => setParam(opt.key, e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm"
            data-testid={`filter-${opt.key}`}
          >
            {opt.values.map((v, i) => (
              <option key={v || "any"} value={v}>
                {opt.display[i]}
              </option>
            ))}
          </select>
        </label>
      ))}

      <button
        type="button"
        onClick={toggleOpenNow}
        className={`ml-auto text-xs font-bold rounded-full px-4 py-2 transition ${
          openNow ? "bg-sky-950 text-white" : "bg-white text-black border border-gray-300"
        }`}
        data-testid="filter-open-now"
      >
        Open now
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Wire into Discovery**

Edit `src/pages/study-spots/StudySpotDiscovery.jsx` — add import near other imports:

```jsx
import FilterBar from "../../components/FilterBar";
```

Find:
```jsx
        <div className="w-full max-w-md mt-6 flex justify-center">
          <input
            type="text"
            placeholder="Search study spots..."
```

Replace the surrounding search+grid area with:

```jsx
        <div className="w-full max-w-md mt-6 flex justify-center">
          <input
            type="text"
            placeholder="Search study spots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ fontFamily: "'Jost', sans-serif" }}
            data-testid="spot-search"
          />
        </div>

        <div className="w-full max-w-2xl mt-4">
          <FilterBar />
        </div>

        <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
```

(Only the `<FilterBar />` wrapper is new; the grid line already existed.)

- [ ] **Step 3: Build + manual check**

Run: `npm run build`
Expected: pass.

Run (in separate terminals):
- `npm run emulator`
- `npm run seed:emulator`
- `npm run dev`

Open `http://localhost:5173/`, sign up, go to `/study-spots`. You should see 11 seeded spots. Change the Noise filter — list shrinks. URL updates to `?noise=silent`. Reload — filter persists. Toggle "Open now" — list shrinks.

Stop dev + emulator when done.

- [ ] **Step 4: Commit**

```bash
git add src/components/FilterBar.jsx src/pages/study-spots/StudySpotDiscovery.jsx
git commit -m "feat(discovery): URL-backed criteria filter bar"
```

---

## Task 14: Loading + empty states in Discovery, Insights, Groups

**Files:**
- Modify: `src/pages/study-spots/StudySpotDiscovery.jsx`
- Modify: `src/pages/study-groups/StudyGroupDiscovery.jsx`
- Modify: `src/pages/study-groups/StudyGroupInfo.jsx`
- Modify: `src/pages/Insights.jsx`

Goal: every page that depends on Firestore data shows `LoadingState` while `spots` / `groups` / `userDoc` haven't loaded, and `EmptyState` when the list is empty after loading.

- [ ] **Step 1: Extend `AppContext` to expose loading flags**

Edit `src/context/AppContext.jsx`.

Find:
```jsx
  const [spots, setSpots] = useState([]);
  const [groups, setGroups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [userDoc, setUserDoc] = useState(null);

  useEffect(() => subscribeSpots(setSpots), []);
  useEffect(() => subscribeGroups(setGroups), []);
```

Replace with:
```jsx
  const [spots, setSpots] = useState([]);
  const [spotsLoaded, setSpotsLoaded] = useState(false);
  const [groups, setGroups] = useState([]);
  const [groupsLoaded, setGroupsLoaded] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [userDoc, setUserDoc] = useState(null);

  useEffect(() =>
    subscribeSpots((xs) => { setSpots(xs); setSpotsLoaded(true); }), []);
  useEffect(() =>
    subscribeGroups((xs) => { setGroups(xs); setGroupsLoaded(true); }), []);
```

In the provider value object, add `spotsLoaded` and `groupsLoaded`:

```jsx
    <AppContext.Provider
      value={{
        spots,
        spotsLoaded,
        groups,
        groupsLoaded,
        sessions,
        joinedGroups,
        joinedSpots,
        joinGroup,
        leaveGroup,
        joinSpot,
        leaveSpot,
        addGroup,
        addSession,
      }}
    >
```

- [ ] **Step 2: Discovery uses `spotsLoaded`**

Edit `src/pages/study-spots/StudySpotDiscovery.jsx`.

Find:
```jsx
  const { spots } = useApp();
```

Replace with:
```jsx
  const { spots, spotsLoaded } = useApp();
```

Above the `return`, add:
```jsx
  if (!spotsLoaded) return <LoadingState label="Loading spots..." />;
```

Add import at top:
```jsx
import LoadingState from "../../components/LoadingState";
```

- [ ] **Step 3: Study Group Discovery loading + empty state**

Edit `src/pages/study-groups/StudyGroupDiscovery.jsx`.

Add imports at top (alongside existing imports):
```jsx
import LoadingState from "../../components/LoadingState";
```

Change:
```jsx
  const { groups } = useApp();
```
to:
```jsx
  const { groups, groupsLoaded } = useApp();
```

Add right above the `return`:
```jsx
  if (!groupsLoaded) return <LoadingState label="Loading groups..." />;
```

- [ ] **Step 4: Group Info loading + ID fix**

Replace `src/pages/study-groups/StudyGroupInfo.jsx` entirely:

```jsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudyGroupCardL from "../../components/cards/StudyGroupCardL";
import JoinModal from "../../components/modals/JoinModal";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import { useApp } from "../../context/AppContext";

export default function StudyGroupInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { groups, groupsLoaded, joinGroup } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!groupsLoaded) return <LoadingState label="Loading group..." />;

  const group = groups.find((g) => g.id === id);
  if (!group) {
    return (
      <EmptyState
        title="Group not found."
        actionLabel="Back to groups"
        onAction={() => navigate("/study-groups")}
      />
    );
  }

  const handleConfirmJoin = async () => {
    await joinGroup(group);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex justify-center min-h-screen bg-white">
        <div className="w-full max-w-md md:max-w-3xl flex flex-col items-center px-4 md:px-8 pt-20 pb-24
                        bg-[radial-gradient(ellipse_at_50%_0%,_#FFB000_0%,_#FFDC90_40%,_#FFFFFF_70%)]">
          <h1 className="absolute left-6 top-6 text-5xl font-['Marcellus_SC'] text-black">Huddle</h1>

          <div className="mt-10 flex flex-col items-center w-full max-w-sm gap-4">
            <StudyGroupCardL
              data={group}
              buttonText="Join"
              onJoin={() => setIsModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <JoinModal
        group={group}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmJoin}
      />
    </>
  );
}
```

Key change: `groups.find((g) => g.id === id)` (string) replaces `groups.find((g) => g.id === parseInt(id))` (int). This was the ID-normalization bug in §1.2 applied to groups.

- [ ] **Step 5: Insights empty-state polish**

Edit `src/pages/Insights.jsx`.

Above the return, compute:
```jsx
  const hasAny = joinedGroups.length + joinedSpots.length + sessions.length > 0;
```

Under the three existing sections, and before the Sign Out block, add:
```jsx
  {!hasAny && (
    <p
      className="mt-10 text-[#5C4033] text-sm text-center max-w-sm"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      Nothing here yet. Rate a spot or join a group to see your activity.
    </p>
  )}
```

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add src/context/AppContext.jsx src/pages/study-spots/StudySpotDiscovery.jsx \
  src/pages/study-groups/StudyGroupDiscovery.jsx src/pages/study-groups/StudyGroupInfo.jsx \
  src/pages/Insights.jsx
git commit -m "feat(app): loading + empty states across Discovery, Groups, Insights"
```

---

## Task 15: Responsive AppLayout with TopBar

**Files:**
- Create: `src/components/navigation/TopBar.jsx`
- Modify: `src/components/navigation/BottomNav.jsx`
- Modify: `src/layouts/AppLayout.jsx`

- [ ] **Step 1: Write `src/components/navigation/TopBar.jsx`**

```jsx
import { NavLink } from "react-router-dom";

const items = [
  { to: "/study-spots",  label: "Spots" },
  { to: "/study-groups", label: "Groups" },
  { to: "/insights",     label: "Insights" },
];

export default function TopBar() {
  return (
    <header
      className="hidden md:flex sticky top-0 z-40 w-full bg-white/80 backdrop-blur border-b border-gray-200 px-6 py-3 items-center gap-6"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      <span className="text-2xl font-['Marcellus_SC'] text-black">Huddle</span>
      <nav className="flex gap-5 text-sm font-semibold">
        {items.map((i) => (
          <NavLink
            key={i.to}
            to={i.to}
            className={({ isActive }) =>
              isActive ? "text-sky-950 underline underline-offset-4" : "text-gray-700 hover:text-sky-950"
            }
          >
            {i.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Hide `BottomNav` on `md:` and up**

Edit `src/components/navigation/BottomNav.jsx`. Change the outer `<nav>` opener:

Find:
```jsx
    <nav className="fixed bottom-4 left-0 w-full flex justify-center z-50">
```

Replace with:
```jsx
    <nav className="md:hidden fixed bottom-4 left-0 w-full flex justify-center z-50">
```

- [ ] **Step 3: Update `AppLayout`**

Replace `src/layouts/AppLayout.jsx`:

```jsx
import { Outlet } from "react-router-dom";
import BottomNav from "../components/navigation/BottomNav";
import TopBar from "../components/navigation/TopBar";

export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="pb-24 md:pb-8">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 4: Build + visual check**

Run: `npm run build && npm run dev`

Open in two windows:
- Mobile-sized (`<768px`): BottomNav visible, TopBar hidden.
- Desktop (`≥1024px`): TopBar visible, BottomNav hidden.

Stop dev.

- [ ] **Step 5: Commit**

```bash
git add src/components/navigation/TopBar.jsx src/components/navigation/BottomNav.jsx src/layouts/AppLayout.jsx
git commit -m "feat(nav): responsive top bar on desktop, bottom nav on mobile"
```

---

## Task 16: Remove fixed-width frame on remaining pages

**Files:**
- Modify: `src/pages/study-groups/StudyGroupDiscovery.jsx`
- Modify: `src/pages/study-groups/StudyGroupInfo.jsx`
- Modify: `src/pages/study-groups/StudyGroupCreate.jsx`
- Modify: `src/pages/study-spots/StudySessionLog.jsx`
- Modify: `src/pages/Insights.jsx`
- Modify: `src/pages/auth/Login.jsx`
- Modify: `src/pages/auth/Signup.jsx`

Goal: replace every `w-96 h-screen` fixed phone frame with a responsive container. The new shell pattern:

```jsx
<div className="flex justify-center min-h-screen bg-white">
  <div className="w-full max-w-md md:max-w-3xl flex flex-col items-center px-4 md:px-8 pt-20 pb-24
                  bg-[radial-gradient(ellipse_at_50%_0%,_#FFB000_0%,_#FFDC90_40%,_#FFFFFF_70%)]">
    {/* page content */}
  </div>
</div>
```

For each file: open, find the outermost two `<div>`s that start with `flex justify-center items-center min-h-screen bg-white` and the inner `w-96 h-screen relative bg-[radial-gradient(...)]`, and replace them with the shell above. Keep all inner content (headers, cards, buttons) identical.

- [ ] **Step 1: Apply to Study Group Discovery**

Open `src/pages/study-groups/StudyGroupDiscovery.jsx`. Replace the outer shell as described. Keep content identical.

- [ ] **Step 2: Study Group Info already updated in Task 14 Step 4**

Skip — the responsive shell is already applied as part of the Task 14 rewrite. Verify by `grep -n 'w-96 h-screen' src/pages/study-groups/StudyGroupInfo.jsx` returning nothing.

- [ ] **Step 3: Apply to Study Group Create**

Open `src/pages/study-groups/StudyGroupCreate.jsx`. Same replacement.

- [ ] **Step 4: Apply to Study Session Log**

Open `src/pages/study-spots/StudySessionLog.jsx`. Same replacement. The form inside already uses `w-80` — keep as-is (it's a valid max width for the form card).

- [ ] **Step 5: Apply to Insights**

Open `src/pages/Insights.jsx`. Same replacement.

- [ ] **Step 6: Apply to Login**

Open `src/pages/auth/Login.jsx`. The login page uses absolute positioning (`absolute top-[250px]` etc.), which will break on desktop. Rewrite the structure:

```jsx
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-white"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      <div className="w-full max-w-sm min-h-screen md:min-h-0 md:h-auto md:rounded-3xl md:my-12 md:shadow-2xl relative
                      bg-[radial-gradient(ellipse_at_50%_50%,_#FFB000_0%,_#FFDC90_81%,_#FFECC1_100%)]">
        <h1 className="pt-10 px-6 text-5xl font-['Marcellus_SC'] text-black">Huddle</h1>

        <div className="mt-20 w-full flex flex-col items-center">
          <h2 className="text-3xl font-bold text-black">Sign in</h2>
          <p className="text-xs text-black mt-2">
            New user?{" "}
            <span
              className="font-bold cursor-pointer hover:underline"
              onClick={() => navigate("/signup")}
            >
              Create an account
            </span>
          </p>
        </div>

        <div className="mt-8 px-6 pb-12 flex flex-col gap-4">
          <label className="text-xs font-bold text-black">Email / Username</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Type your email"
            className="px-4 py-3 rounded-full border-none text-sm outline-none"
            style={{ backgroundColor: "#FDD878", color: "#B07A00" }}
            data-testid="login-email"
          />

          <label className="text-xs font-bold text-black">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Type password"
            className="px-4 py-3 rounded-full border-none text-sm outline-none"
            style={{ backgroundColor: "#FDD878", color: "#B07A00" }}
            data-testid="login-password"
          />

          <p
            onClick={handleForgot}
            className="text-right text-xs font-bold text-black cursor-pointer hover:underline"
          >
            Forgot Password
          </p>

          {error && (
            <p className="text-xs font-semibold text-red-700 bg-red-100 rounded px-3 py-2" data-testid="login-error">{error}</p>
          )}
          {info && (
            <p className="text-xs font-semibold text-green-800 bg-green-100 rounded px-3 py-2">{info}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={busy}
            className="mt-4 py-3 rounded-full font-bold text-sm transition-transform disabled:opacity-60"
            style={{ backgroundColor: "#1C1008", color: "#F9C84A", cursor: busy ? "wait" : "pointer" }}
            data-testid="login-submit"
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
```

Keep the existing `useState`, handlers, and imports unchanged.

- [ ] **Step 7: Rewrite Signup layout**

Replace the entire `return (...)` block in `src/pages/auth/Signup.jsx` (keep all hooks and handlers above it unchanged). The replacement:

```jsx
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-white"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      <div className="w-full max-w-sm min-h-screen md:min-h-0 md:h-auto md:rounded-3xl md:my-12 md:shadow-2xl relative
                      bg-[radial-gradient(ellipse_at_50%_50%,_#FFB000_0%,_#FFDC90_81%,_#FFECC1_100%)]">
        <h1 className="pt-10 px-6 text-5xl font-['Marcellus_SC'] text-black">Huddle</h1>

        <div className="mt-12 w-full flex flex-col items-center">
          <h2 className="text-3xl font-bold text-black">Sign up</h2>
          <p className="text-xs text-black mt-2">
            Already have an account?{" "}
            <span
              className="font-bold cursor-pointer hover:underline"
              onClick={() => navigate("/")}
            >
              Sign in
            </span>
          </p>
        </div>

        <div className="mt-6 px-6 pb-12 flex flex-col gap-4">
          {[
            { label: "First Name and Last Name", name: "name",     placeholder: "Type full name",     type: "text",     testid: "signup-name" },
            { label: "Email",                     name: "email",    placeholder: "name@berkeley.edu",  type: "email",    testid: "signup-email" },
            { label: "Password",                  name: "password", placeholder: "Type password",      type: "password", testid: "signup-password" },
            { label: "Confirm Password",          name: "confirm",  placeholder: "Type password again",type: "password", testid: "signup-confirm" },
          ].map((field) => (
            <div key={field.name} className="flex flex-col">
              <label className="text-xs font-bold text-black mb-1">{field.label}</label>
              <input
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="px-4 py-3 text-sm rounded-full outline-none border-none"
                style={{ backgroundColor: "#FDD878", color: "#B07A00" }}
                data-testid={field.testid}
              />
            </div>
          ))}

          {error && (
            <p className="text-xs font-semibold text-red-700 bg-red-100 rounded px-3 py-2" data-testid="signup-error">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={busy}
            className="mt-4 py-3 rounded-full font-bold text-sm hover:scale-95 transition-transform disabled:opacity-60"
            style={{ backgroundColor: "#1C1008", color: "#F9C84A", cursor: busy ? "wait" : "pointer" }}
            data-testid="signup-submit"
          >
            {busy ? "Creating..." : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
```

- [ ] **Step 8: Build + visual check**

Run: `npm run build && npm run dev`

Cycle through all pages at mobile (375px) and desktop (1440px) widths. Nothing should be cut off; nothing should be pinned to the left edge.

- [ ] **Step 9: Commit**

```bash
git add src/pages/
git commit -m "feat(layout): make all pages responsive; drop fixed w-96 phone frame"
```

---

## Task 17: Responsive modals

**Files:**
- Create: `src/components/modals/useModalA11y.js`
- Modify: `src/components/modals/JoinModal.jsx`
- Modify: `src/components/modals/RateModal.jsx`
- Modify: `src/components/modals/CreateModal.jsx`

- [ ] **Step 1: Write `useModalA11y.js` hook**

Create `src/components/modals/useModalA11y.js`:

```jsx
import { useEffect } from "react";

export function useModalA11y(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);
}
```

- [ ] **Step 2: Update `JoinModal.jsx`**

Find:
```jsx
import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { getUserEmails } from "../../services/users";
import { downloadICS } from "../../services/calendar";

export default function JoinModal({ group, isOpen, onClose }) {
  const { leaveGroup, leaveSpot } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !group) return null;
```

Replace with:
```jsx
import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { getUserEmails } from "../../services/users";
import { downloadICS } from "../../services/calendar";
import { useModalA11y } from "./useModalA11y";

export default function JoinModal({ group, isOpen, onClose }) {
  const { leaveGroup, leaveSpot } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useModalA11y(isOpen, onClose);
  if (!isOpen || !group) return null;
```

Then find the outer return (starts `<div className="fixed inset-0 z-50...">`):

```jsx
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal content */}
      <div className="relative bg-white rounded-3xl shadow-lg p-6 max-w-md w-80 flex flex-col gap-4 z-10">
```

Replace with:
```jsx
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Joined ${group.name ?? group.course ?? "group"}`}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm md:max-w-md flex flex-col gap-4 z-10" data-testid="join-modal">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-gray-100 cursor-pointer flex items-center justify-center text-gray-600"
        >
          ×
        </button>
```

(Everything else inside the modal panel is unchanged.)

- [ ] **Step 3: Update `RateModal.jsx`**

Replace the whole file with:
```jsx
import { useModalA11y } from "./useModalA11y";

export default function RateModal({ studySpot, isOpen, onClose }) {
  useModalA11y(isOpen, onClose);
  if (!isOpen || !studySpot) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Rated ${studySpot.name}`}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm md:max-w-md flex flex-col gap-4 z-10" data-testid="rate-modal">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-gray-100 cursor-pointer flex items-center justify-center text-gray-600"
        >
          ×
        </button>

        <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Jost', sans-serif" }}>
          Thank you for rating {studySpot.name}!
        </h2>

        <p className="text-sm text-gray-700" style={{ fontFamily: "'Jost', sans-serif" }}>
          Your feedback is valuable and helps others discover great study spots. Ratings are aggregated to highlight the best spots in the community.
        </p>

        <button
          onClick={onClose}
          className="py-2 rounded-full bg-blue-200 hover:bg-blue-300 text-gray-800 font-semibold cursor-pointer"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update `CreateModal.jsx`**

Replace the whole file with:
```jsx
import { useModalA11y } from "./useModalA11y";

export default function CreateModal({ group, isOpen, onClose }) {
  useModalA11y(isOpen, onClose);
  if (!isOpen || !group) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Created ${group.name}`}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm md:max-w-md flex flex-col gap-4 z-10" data-testid="create-modal">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-gray-100 cursor-pointer flex items-center justify-center text-gray-600"
        >
          ×
        </button>

        <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Jost', sans-serif" }}>
          {group.name} has been created!
        </h2>

        <p className="text-sm text-gray-700" style={{ fontFamily: "'Jost', sans-serif" }}>
          Your study group for <strong>{group.course}</strong> has been successfully created.
        </p>

        <p className="text-sm text-gray-700" style={{ fontFamily: "'Jost', sans-serif" }}>
          Meeting Time: {group.meetingTime || "TBD"} <br />
          Location: {group.location || "TBD"}
        </p>

        <button
          onClick={onClose}
          className="py-2 rounded-full bg-blue-200 hover:bg-blue-300 text-gray-800 font-semibold cursor-pointer"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/modals/
git commit -m "feat(ui): responsive modals with Escape/backdrop close + a11y attributes"
```

---

## Task 18: Playwright config + emulator helpers

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/helpers/emulator.ts`
- Create: `e2e/helpers/auth.ts`
- Modify: `.env.example` (document test env)

- [ ] **Step 1: Write `playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium-mobile', use: { ...devices['iPhone 13'] } },
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'npm run build && npm run preview',
      url: `http://localhost:${PORT}`,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

- [ ] **Step 2: Write `e2e/helpers/emulator.ts`**

```typescript
import { spawn, ChildProcess, execSync } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

const AUTH_HOST = '127.0.0.1:9099';
const FS_HOST = '127.0.0.1:8080';

let proc: ChildProcess | null = null;

export async function startEmulator(): Promise<void> {
  if (proc) return;
  proc = spawn('npx', ['firebase', 'emulators:start', '--only', 'auth,firestore'], {
    stdio: 'pipe',
    env: { ...process.env },
  });
  // Wait until both ports accept TCP connections.
  await waitForPort(9099);
  await waitForPort(8080);
}

export async function stopEmulator(): Promise<void> {
  if (!proc) return;
  proc.kill('SIGINT');
  proc = null;
  await wait(500);
}

export async function resetEmulator(): Promise<void> {
  await fetch(`http://${AUTH_HOST}/emulator/v1/projects/huddle-5ae58/accounts`, { method: 'DELETE' });
  await fetch(`http://${FS_HOST}/emulator/v1/projects/huddle-5ae58/databases/(default)/documents`, { method: 'DELETE' });
}

export function seedEmulator(): void {
  execSync('npm run seed:emulator', { stdio: 'inherit' });
}

async function waitForPort(port: number, timeoutMs = 30_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}`);
      if (r.status < 500) return;
    } catch {}
    await wait(500);
  }
  throw new Error(`Emulator port ${port} did not open within ${timeoutMs}ms`);
}
```

- [ ] **Step 3: Write `e2e/helpers/auth.ts`**

```typescript
import { Page, expect } from '@playwright/test';

export async function signUp(page: Page, name: string, email: string, password: string): Promise<void> {
  await page.goto('/signup');
  await page.getByTestId('signup-name').fill(name);
  await page.getByTestId('signup-email').fill(email);
  await page.getByTestId('signup-password').fill(password);
  await page.getByTestId('signup-submit').click();
  await expect(page).toHaveURL(/\/study-spots/);
}

export async function signIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL(/\/study-spots/);
}

export function uniqueEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@huddle.test`;
}
```

- [ ] **Step 4: Bridge the Firebase client to the emulator**

The production Firebase SDK in `src/services/firebase.ts` needs to optionally connect to the emulators when running tests. Edit the file to:

```typescript
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app: FirebaseApp = initializeApp(config);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}
```

Add to `.env.example`:
```
# Set to "true" in local/test environments to bridge Firebase SDK to the emulator.
VITE_USE_FIREBASE_EMULATOR=false
```

Add to `.env.local`:
```
VITE_USE_FIREBASE_EMULATOR=false
```

(Keep `false` for normal dev so the live Firestore continues to work.)

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts e2e/ src/services/firebase.ts .env.example .env.local
git commit -m "feat(e2e): playwright config + emulator helpers + client emulator bridge"
```

---

## Task 19: Playwright smoke spec

**Files:**
- Create: `e2e/smoke.spec.ts`
- Create: `e2e/global-setup.ts`
- Modify: `playwright.config.ts` (wire global-setup, env for webServer)

- [ ] **Step 1: Write `e2e/global-setup.ts`**

```typescript
import { startEmulator, resetEmulator, seedEmulator, stopEmulator } from './helpers/emulator';

async function globalSetup() {
  await startEmulator();
  await resetEmulator();
  seedEmulator();
}

export default globalSetup;

export async function globalTeardown() {
  await stopEmulator();
}
```

- [ ] **Step 2: Update `playwright.config.ts`**

Replace the file with:

```typescript
import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-setup.ts',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium-mobile',  use: { ...devices['iPhone 13'] } },
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'npm run build && npm run preview',
      url: `http://localhost:${PORT}`,
      timeout: 180_000,
      reuseExistingServer: !process.env.CI,
      env: { VITE_USE_FIREBASE_EMULATOR: 'true' },
    },
  ],
});
```

- [ ] **Step 3: Write `e2e/smoke.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';
import { signUp, uniqueEmail } from './helpers/auth';
import { resetEmulator, seedEmulator } from './helpers/emulator';

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  await resetEmulator();
  seedEmulator();
});

test('user can sign up, browse, filter, rate, and see activity in insights', async ({ page }) => {
  const email = uniqueEmail();

  // 1. Sign up.
  await signUp(page, 'Smoke User', email, 'supersecret123');

  // 2. Spots list is populated by seed.
  await expect(page.getByTestId('filter-bar')).toBeVisible();
  const cardsBefore = page.locator('[data-testid="spot-card"], .bg-white.rounded-3xl.shadow-md');
  await expect.poll(async () => await cardsBefore.count(), { timeout: 15_000 }).toBeGreaterThanOrEqual(5);

  // 3. Apply a filter — Noise = Silent. List shrinks.
  const totalCount = await cardsBefore.count();
  await page.getByTestId('filter-noise').selectOption('silent');
  await expect.poll(async () => cardsBefore.count()).toBeLessThan(totalCount);

  // 4. Clear the filter.
  await page.getByTestId('filter-noise').selectOption('');
  await expect.poll(async () => cardsBefore.count()).toBe(totalCount);

  // 5. Open Doe Library.
  await page.goto('/study-spots/doe-library');
  await expect(page.getByText('Doe Library')).toBeVisible();

  // 6. Rate it.
  await page.getByTestId('rate-spot-cta').click();
  await expect(page).toHaveURL(/\/study-spots\/log\/doe-library/);

  // Click each rating 1-5 block (Task body gives exact buttons — using text for robustness)
  // Rate "productivity" = 5
  await page.getByRole('button', { name: '5' }).first().click();
  // For this smoke test we'll submit with whatever defaults are set.
  // Navigate to page 2.
  await page.getByRole('button', { name: 'Next' }).click();
  // Overall rating 5
  await page.getByRole('button', { name: '5' }).first().click();
  await page.getByRole('button', { name: 'Submit' }).click();

  // Rating modal opens; close and return to insights.
  await page.waitForTimeout(500);

  // 7. Go to Insights; check the spot appears.
  await page.goto('/insights');
  await expect(page.getByText('Doe Library')).toBeVisible({ timeout: 10_000 });

  // 8. Sign out — back at Login.
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page).toHaveURL('/');
});
```

- [ ] **Step 4: Add `data-testid` to `StudySpotCard`**

Edit `src/components/cards/StudySpotCard.jsx`. Find the outermost card div:

```jsx
      <div className="bg-white rounded-3xl shadow-md p-4 max-w-xs w-full flex flex-col gap-3">
```

Replace with:

```jsx
      <div className="bg-white rounded-3xl shadow-md p-4 w-full flex flex-col gap-3" data-testid="spot-card">
```

(Also drop `max-w-xs` so the grid cell controls width.)

- [ ] **Step 5: Run the e2e test**

Run: `npm run test:e2e`
Expected: PASS for both `chromium-mobile` and `chromium-desktop`. First run takes 60–90s (downloads, installs, starts emulator, seeds, builds, runs).

If a step fails, diagnose — likely causes:
- Missing `data-testid` on a page: grep the spec for testids and ensure each exists in the relevant page.
- Rating modal title — adjust the text selector in step 7 if the copy differs.
- Emulator port already bound: run `lsof -i:8080 -i:9099` and kill.

- [ ] **Step 6: Commit**

```bash
git add e2e/smoke.spec.ts e2e/global-setup.ts playwright.config.ts src/components/cards/StudySpotCard.jsx
git commit -m "test(e2e): smoke test — signup, browse, filter, rate, insights, sign out"
```

---

## Task 20: CI wiring

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Read the existing CI workflow**

Run: `cat .github/workflows/ci.yml`

Replace with:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    env:
      VITE_FIREBASE_API_KEY: test
      VITE_FIREBASE_AUTH_DOMAIN: test
      VITE_FIREBASE_PROJECT_ID: huddle-5ae58
      VITE_FIREBASE_STORAGE_BUCKET: test
      VITE_FIREBASE_MESSAGING_SENDER_ID: test
      VITE_FIREBASE_APP_ID: test
      VITE_USE_FIREBASE_EMULATOR: "true"
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17
      - name: Install deps
        run: npm ci
      - name: Install Firebase tools
        run: npm i -g firebase-tools
      - name: Typecheck
        run: npm run typecheck
      - name: Lint
        run: npm run lint
      - name: Unit tests
        run: npm run test:unit
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      - name: E2E tests
        run: npm run test:e2e
      - name: Upload Playwright artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: |
            playwright-report
            test-results
          retention-days: 7
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: typecheck, lint, unit tests, and e2e smoke with emulator"
```

---

## Task 21: Final verification and tag

- [ ] **Step 1: Full local verification sequence**

Run each command in order; all must pass:

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run test:e2e
```

- [ ] **Step 2: Manual demo**

Start dev + emulator + seed in three terminals, navigate through:
- Sign up
- Discovery: shows 11 spots
- Filter by Noise=Silent: list shrinks
- Open a spot
- Rate it
- See it in Insights
- Sign out

Confirm mobile viewport (~375px) and desktop viewport (~1440px) both look right.

- [ ] **Step 3: Tag**

```bash
git tag phase-1-complete
git log --oneline phase-1-complete~20..phase-1-complete
```

- [ ] **Step 4: Announce**

Print this summary:

> Phase 1 complete. Commits since start of Phase 1 listed above. Ready to write Phase 2 plan (map view, user preferences, group recommendations). Review the changes, then approve to proceed.

Wait for user approval before invoking writing-plans again for Phase 2.

---

## Self-review checklist (for the plan author)

After executing Task 21, before handing off:

- [ ] All 21 task steps' expected outputs matched.
- [ ] `npm run test:unit` lists: seedData (6), filterSpots (8), hours (9) — total 23 passes.
- [ ] `npm run test:e2e` lists 2 passes (one per project).
- [ ] `git ls-files src/data/` returns nothing.
- [ ] `grep -rn "w-96 h-screen" src/` returns nothing.
- [ ] `grep -rn "studySpots\b" src/` returns only type references in services, no data imports.
- [ ] Bundle size in `npm run build` output still under 700KB raw / 220KB gzip (pre-splitting baseline; Phase 3 will split).
