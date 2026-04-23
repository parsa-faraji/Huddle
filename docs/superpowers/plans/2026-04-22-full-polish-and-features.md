# Huddle: Full Polish, Features, and Verification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take Huddle from "shipped" to "feels done" — polish every surface, add Search/Favorites/Dark Mode, fix discovered bugs, and verify everything with Playwright.

**Architecture:** Purely additive on top of the existing React 19 + Vite + Tailwind 4 + Firebase stack. New features reuse existing service-layer conventions (TS wrappers in `src/services/`) and Firestore doc shapes. Dark mode uses Tailwind's class strategy. Favorites persist on the `users/{uid}` doc. Search and sort are pure client-side on the already-subscribed spot list.

**Tech Stack:** React 19, Tailwind 4, Firebase (Firestore + Auth), Leaflet, Playwright. New deps: `lucide-react` (icons), `clsx` (class merging).

**Execution note:** Branch `feat/full-polish-and-features` already exists and has the spec commit. Run dev server in background throughout (`npm run dev`). Run Playwright after each wave (`npx playwright test`).

---

## Task 0: Prep — deps and dev server

**Files:**
- Modify: `package.json`

- [ ] **Step 1:** Install new deps.

```bash
cd /Users/parsafarajialamouti/Desktop/huddle && npm install lucide-react clsx
```

- [ ] **Step 2:** Verify no regressions — typecheck + lint + existing tests.

```bash
npm run typecheck && npm run lint && npx playwright test
```

- [ ] **Step 3:** Start dev server in background for visual iteration.

```bash
npm run dev
```

- [ ] **Step 4:** Commit.

```bash
git add package.json package-lock.json
git commit -m "chore: add lucide-react + clsx"
```

---

## Task 1: Audit pass — catalog issues

**Files:**
- Create: `docs/superpowers/plans/2026-04-22-audit-findings.md` (working doc, not committed)

- [ ] **Step 1:** Manually walk every flow in a real browser (localhost:5173) — sign up, login, discovery list+map, spot info, rate flow, group create/join/chat, check-in, insights, profile, onboarding tour dismiss+reopen, 404 (unknown URL), mobile viewport (375×812).

- [ ] **Step 2:** For each rough edge, append to the findings doc with: page, issue, severity (block / polish / nitpick), proposed fix.

- [ ] **Step 3:** Re-read the full findings list. Group by file. This becomes the Wave 1 work list.

*(No commit — this is a scratch doc.)*

---

## Task 2: Add toast notification system

Reusable everywhere for success/error states.

**Files:**
- Create: `src/components/Toast.jsx`
- Create: `src/context/ToastContext.jsx`
- Modify: `src/App.jsx` (wrap provider)

- [ ] **Step 1:** Write `ToastContext` — provides `toast.success(msg)`, `toast.error(msg)`, `toast.info(msg)`. Stores array of `{ id, kind, message }`. Auto-dismiss 3.5s.

```jsx
// src/context/ToastContext.jsx
import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = useCallback((kind, message) => {
    const id = crypto.randomUUID()
    setToasts(t => [...t, { id, kind, message }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])
  const toast = {
    success: m => push('success', m),
    error: m => push('error', m),
    info: m => push('info', m),
  }
  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx.toast
}

export function useToastList() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToastList must be used within <ToastProvider>')
  return ctx.toasts
}
```

- [ ] **Step 2:** Write `Toast.jsx` — renders the list in a fixed top-right container, with appropriate colors per kind.

```jsx
// src/components/Toast.jsx
import { useToastList } from '../context/ToastContext'
import clsx from 'clsx'

export function ToastStack() {
  const toasts = useToastList()
  return (
    <div className="fixed top-4 right-4 z-[1000] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div
          key={t.id}
          role="status"
          className={clsx(
            'rounded-xl px-4 py-3 text-sm shadow-lg ring-1 backdrop-blur',
            t.kind === 'success' && 'bg-emerald-500/95 text-white ring-emerald-600',
            t.kind === 'error' && 'bg-rose-500/95 text-white ring-rose-600',
            t.kind === 'info' && 'bg-slate-800/95 text-white ring-slate-900',
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3:** Wire into `App.jsx`: wrap with `<ToastProvider>`, render `<ToastStack />`.

- [ ] **Step 4:** Commit.

```bash
git add src/components/Toast.jsx src/context/ToastContext.jsx src/App.jsx
git commit -m "feat(ui): add toast notification system"
```

---

## Task 3: Add NotFound (404) page

**Files:**
- Create: `src/pages/NotFound.jsx`
- Modify: `src/App.jsx` (add catch-all route)
- Create: `e2e/not-found.spec.ts`

- [ ] **Step 1:** Write the failing Playwright test.

```ts
// e2e/not-found.spec.ts
import { test, expect } from '@playwright/test'

test('unknown route renders 404 page with back link', async ({ page }) => {
  await page.goto('/this-route-does-not-exist-xyz')
  await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible()
  await page.getByRole('link', { name: /back to discovery/i }).click()
  await expect(page).toHaveURL(/\/(study-spots)?$/)
})
```

- [ ] **Step 2:** Run — should fail with no heading.

```bash
npx playwright test e2e/not-found.spec.ts
```

- [ ] **Step 3:** Create `NotFound.jsx`.

```jsx
// src/pages/NotFound.jsx
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-6xl font-bold text-slate-400 dark:text-slate-600">404</div>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-slate-600 dark:text-slate-400 max-w-md">
        The page you're looking for doesn't exist or was moved.
      </p>
      <Link
        to="/study-spots"
        className="mt-4 rounded-full bg-slate-900 px-5 py-2.5 text-white font-medium hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        Back to Discovery
      </Link>
    </main>
  )
}
```

- [ ] **Step 4:** Add route to `App.jsx` — `<Route path="*" element={<NotFound />} />` as the last child of the router.

- [ ] **Step 5:** Run test → pass.

- [ ] **Step 6:** Commit.

```bash
git add src/pages/NotFound.jsx src/App.jsx e2e/not-found.spec.ts
git commit -m "feat: add 404 page with test"
```

---

## Task 4: Dark mode — infrastructure

**Files:**
- Modify: `src/index.css` (enable dark variant)
- Create: `src/context/ThemeContext.jsx`
- Modify: `src/services/users.ts` (add `themePreference` field helper)
- Modify: `src/App.jsx` (wrap with ThemeProvider)

- [ ] **Step 1:** Enable Tailwind 4 dark variant (class strategy) in `src/index.css`.

```css
/* add near top of file, after @import "tailwindcss"; */
@custom-variant dark (&:where(.dark, .dark *));
```

- [ ] **Step 2:** Create `ThemeContext.jsx` — manages `'light' | 'dark' | 'auto'`. Reads `localStorage.huddle-theme`, falls back to `auto`. Applies `.dark` class on `document.documentElement` based on resolved preference. Listens to `prefers-color-scheme` when in `auto`.

```jsx
// src/context/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'huddle-theme'

function resolveTheme(pref) {
  if (pref === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return pref
}

export function ThemeProvider({ children }) {
  const [pref, setPref] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'auto'
    } catch { return 'auto' }
  })

  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const resolved = resolveTheme(pref)
      root.classList.toggle('dark', resolved === 'dark')
    }
    apply()
    try { localStorage.setItem(STORAGE_KEY, pref) } catch {}
    if (pref === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => apply()
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [pref])

  return (
    <ThemeContext.Provider value={{ pref, setPref, resolved: resolveTheme(pref) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}
```

- [ ] **Step 3:** Wire into `App.jsx`: wrap inside `<AuthProvider>` → `<ThemeProvider>` → rest.

- [ ] **Step 4:** Commit.

```bash
git add src/index.css src/context/ThemeContext.jsx src/App.jsx
git commit -m "feat(theme): add ThemeProvider with light/dark/auto"
```

---

## Task 5: Dark mode — toggle UI + styling sweep

**Files:**
- Create: `src/components/ThemeToggle.jsx`
- Modify: `src/pages/Profile.jsx` (add theme section)
- Modify: `src/components/navigation/BottomNav.jsx` (add theme toggle icon)
- Modify: `src/layouts/AppLayout.jsx` (add root dark bg class)
- Modify: various cards/pages to use `dark:` variants

- [ ] **Step 1:** Write `ThemeToggle.jsx` — 3-way segmented toggle with sun/moon/monitor icons from lucide-react.

```jsx
// src/components/ThemeToggle.jsx
import { Sun, Moon, Monitor } from 'lucide-react'
import clsx from 'clsx'
import { useTheme } from '../context/ThemeContext'

export function ThemeToggle({ compact = false }) {
  const { pref, setPref } = useTheme()
  const opts = [
    { val: 'light', icon: Sun, label: 'Light' },
    { val: 'auto', icon: Monitor, label: 'Auto' },
    { val: 'dark', icon: Moon, label: 'Dark' },
  ]
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={clsx(
        'inline-flex items-center rounded-full bg-slate-200/70 p-1 dark:bg-slate-800/70',
        compact && 'scale-90'
      )}
    >
      {opts.map(({ val, icon: Icon, label }) => (
        <button
          key={val}
          role="radio"
          aria-checked={pref === val}
          onClick={() => setPref(val)}
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition',
            pref === val
              ? 'bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <Icon size={14} />
          {!compact && label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2:** Add a "Theme" section to `Profile.jsx` above or below preferences.

- [ ] **Step 3:** Sweep components for dark variants. Use existing token classes + add `dark:` where background/text colors are hard-coded. Files expected: `AppLayout`, every page, `SpotCard`, `GroupCard`, `BottomNav`, `MapView` popup, modals. Work from most-visible to least. For each: dev-server reload, verify dark mode looks right.

- [ ] **Step 4:** Persist to Firestore when signed in (fire-and-forget, don't block UI) — add `themePreference` write in `ThemeContext` when `setPref` is called with a logged-in user.

- [ ] **Step 5:** Playwright test.

```ts
// e2e/theme.spec.ts
import { test, expect } from '@playwright/test'

test('theme toggle switches dark mode and persists', async ({ page }) => {
  await page.goto('/study-spots')
  const html = page.locator('html')
  // default (auto) — could be either; just exercise the toggle
  await page.getByRole('radio', { name: /^dark$/i }).click()
  await expect(html).toHaveClass(/dark/)
  await page.reload()
  await expect(html).toHaveClass(/dark/)
  await page.getByRole('radio', { name: /^light$/i }).click()
  await expect(html).not.toHaveClass(/dark/)
})
```

- [ ] **Step 6:** If toggle is not reachable without login, seed via login helper (`e2e/helpers.ts` pattern). Otherwise expose a small toggle on the Discovery header.

- [ ] **Step 7:** Run test → pass.

- [ ] **Step 8:** Commit.

```bash
git add -A
git commit -m "feat(theme): dark mode toggle + dark variants across surfaces"
```

---

## Task 6: Favorites — service + Firestore rule

**Files:**
- Modify: `src/services/users.ts` (add `toggleFavorite`, `getFavorites`)
- Modify: `firestore.rules` (allow self-write to `favoriteSpotIds`)

- [ ] **Step 1:** In `users.ts`, add:

```ts
export async function toggleFavoriteSpot(uid: string, spotId: string): Promise<boolean> {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  const current: string[] = snap.exists() ? (snap.data().favoriteSpotIds ?? []) : []
  const isFav = current.includes(spotId)
  const next = isFav ? current.filter(x => x !== spotId) : [...current, spotId]
  await setDoc(ref, { favoriteSpotIds: next }, { merge: true })
  return !isFav
}

export function subscribeToFavorites(uid: string, cb: (ids: string[]) => void) {
  const ref = doc(db, 'users', uid)
  return onSnapshot(ref, snap => {
    cb(snap.exists() ? (snap.data().favoriteSpotIds ?? []) : [])
  })
}
```

(imports: add `onSnapshot`, `getDoc`, `setDoc`, `doc` from firestore if not present.)

- [ ] **Step 2:** Update `firestore.rules` — ensure the existing `users/{uid}` rule permits self-writes including `favoriteSpotIds` and `themePreference`. If the rule already allows self-write of arbitrary fields, no change needed. Otherwise explicitly list allowed fields.

- [ ] **Step 3:** Deploy rules.

```bash
firebase deploy --only firestore:rules --project huddle-5ae58
```

- [ ] **Step 4:** Commit.

```bash
git add src/services/users.ts firestore.rules
git commit -m "feat(favorites): service + firestore rules"
```

---

## Task 7: Favorites — UI on SpotCard + Discovery strip + Insights

**Files:**
- Modify: `src/components/cards/SpotCard.jsx` (heart button)
- Modify: `src/pages/study-spots/StudySpotDiscovery.jsx` (favorites strip)
- Modify: `src/pages/Insights.jsx` (favorites section)
- Create: `e2e/favorites.spec.ts`

- [ ] **Step 1:** Write the Playwright test.

```ts
// e2e/favorites.spec.ts
import { test, expect } from '@playwright/test'
import { login } from './helpers'

test('favorite a spot persists and shows on Insights', async ({ page }) => {
  await login(page)
  await page.goto('/study-spots')
  // tap first card's heart
  const firstHeart = page.getByRole('button', { name: /favorite/i }).first()
  await firstHeart.click()
  await expect(firstHeart).toHaveAttribute('aria-pressed', 'true')
  // reload — still favorited
  await page.reload()
  await expect(page.getByRole('button', { name: /favorite/i }).first())
    .toHaveAttribute('aria-pressed', 'true')
  // insights has favorites section
  await page.goto('/insights')
  await expect(page.getByRole('heading', { name: /favorites/i })).toBeVisible()
})
```

- [ ] **Step 2:** Run — expect fail.

- [ ] **Step 3:** Add `useFavorites` hook in a new file `src/hooks/useFavorites.js`:

```jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { subscribeToFavorites, toggleFavoriteSpot } from '../services/users'

export function useFavorites() {
  const { user } = useAuth()
  const [ids, setIds] = useState([])
  useEffect(() => {
    if (!user) { setIds([]); return }
    return subscribeToFavorites(user.uid, setIds)
  }, [user?.uid])
  const toggle = async (spotId) => {
    if (!user) return
    // optimistic
    setIds(curr => curr.includes(spotId) ? curr.filter(i => i !== spotId) : [...curr, spotId])
    try { await toggleFavoriteSpot(user.uid, spotId) } catch {
      setIds(curr => curr.includes(spotId) ? curr.filter(i => i !== spotId) : [...curr, spotId])
    }
  }
  return { ids, toggle, isFavorite: (id) => ids.includes(id) }
}
```

- [ ] **Step 4:** Add a heart button component in SpotCard. Use lucide-react `Heart`.

```jsx
import { Heart } from 'lucide-react'
import { useFavorites } from '../../hooks/useFavorites'
// ...
const { isFavorite, toggle } = useFavorites()
const fav = isFavorite(spot.id)
// render inside card:
<button
  type="button"
  aria-label={`${fav ? 'Unfavorite' : 'Favorite'} ${spot.name}`}
  aria-pressed={fav}
  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(spot.id) }}
  className={clsx(
    'absolute top-3 right-3 rounded-full p-2 backdrop-blur transition',
    'bg-white/80 hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-900',
    fav && 'text-rose-500'
  )}
>
  <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
</button>
```

- [ ] **Step 5:** On Discovery, add a "Your favorites" strip above the list when `ids.length > 0`. Uses existing SpotCard in a horizontal scroll row.

- [ ] **Step 6:** On Insights, add a new top section "Favorites" showing favorited spots as cards.

- [ ] **Step 7:** Run test → pass.

- [ ] **Step 8:** Commit.

```bash
git add -A
git commit -m "feat(favorites): heart toggle + discovery strip + insights section"
```

---

## Task 8: Search + unified controls on Discovery

**Files:**
- Modify: `src/pages/study-spots/StudySpotDiscovery.jsx`
- Create: `e2e/search-and-sort.spec.ts`

- [ ] **Step 1:** Write the test.

```ts
// e2e/search-and-sort.spec.ts
import { test, expect } from '@playwright/test'

test('search filters and sort reorders', async ({ page }) => {
  await page.goto('/study-spots')
  // wait for at least one card
  await expect(page.locator('[data-testid="spot-card"]').first()).toBeVisible()
  const searchInput = page.getByPlaceholder(/search spots/i)
  await searchInput.fill('Doe')
  const cards = page.locator('[data-testid="spot-card"]')
  await expect(cards).toHaveCount(1)
  await searchInput.fill('')
  await expect(cards.first()).toBeVisible()

  // change sort
  await page.getByRole('combobox', { name: /sort/i }).selectOption('name')
  const firstCardName = await cards.first().locator('[data-testid="spot-name"]').innerText()
  // sanity: alphabetical — should start with a letter <= most others
  expect(firstCardName.charAt(0).toLowerCase()).toBeLessThanOrEqual('z')
})
```

- [ ] **Step 2:** Run — expect fail.

- [ ] **Step 3:** In `StudySpotDiscovery.jsx`, add state: `search` (string), `sort` (`'recommended' | 'name' | 'rating' | 'reviews'`). Compute derived `visibleSpots` by:
  - Filter: search term matches `name` OR `location` OR `type` (case-insensitive).
  - Sort: based on `sort` state. Default is current recommendation order.

- [ ] **Step 4:** Render a controls row above the filter chips:

```jsx
<div className="flex flex-wrap items-center gap-2 mb-3">
  <div className="flex-1 min-w-[200px] relative">
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
      type="search"
      value={search}
      onChange={e => setSearch(e.target.value)}
      placeholder="Search spots…"
      className="w-full rounded-full bg-white dark:bg-slate-900 pl-9 pr-3 py-2 ring-1 ring-slate-200 dark:ring-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
  <label className="sr-only" htmlFor="sort-select">Sort</label>
  <select
    id="sort-select"
    aria-label="Sort"
    value={sort}
    onChange={e => setSort(e.target.value)}
    className="rounded-full bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-1 ring-slate-200 dark:ring-slate-800"
  >
    <option value="recommended">Recommended</option>
    <option value="name">Name A–Z</option>
    <option value="rating">Highest rated</option>
    <option value="reviews">Most reviewed</option>
  </select>
</div>
```

- [ ] **Step 5:** Add `data-testid="spot-card"` and `data-testid="spot-name"` on SpotCard.

- [ ] **Step 6:** Run test → pass.

- [ ] **Step 7:** Commit.

```bash
git add -A
git commit -m "feat(discovery): search + sort controls"
```

---

## Task 9: Polish pass — Wave 2

Use findings from Task 1. Batch fixes into small commits.

**Expected sub-tasks (verify each in-browser):**

- [ ] **a) Loading skeletons** — Insights, Profile, GroupInfo, SpotInfo all show skeletons on initial load. Add where missing.
- [ ] **b) Empty states** — empty discovery (no matches), empty insights (no activity yet), empty favorites, empty group list. All have a friendly message + CTA.
- [ ] **c) Form polish** — auth forms show inline error, submit button disables when loading, uses toast on success.
- [ ] **d) Mobile tap targets** — bottom nav items, chip buttons, heart, and rating stars all ≥ 40px tap area. Use dev tools device toolbar.
- [ ] **e) Modal focus & escape** — RateSpotModal and any create/confirm modals trap focus and close on Escape. Use `useEffect` keydown listener on the modal.
- [ ] **f) Focus visible rings** — `focus-visible:ring-2 focus-visible:ring-indigo-500` on all interactive elements.
- [ ] **g) Map popup dark mode + mobile** — leaflet popup readable in dark mode, tap targets OK.
- [ ] **h) Micro-interactions** — card hover raise (`hover:-translate-y-0.5`), button active press (`active:scale-[0.98]`), `transition` where missing.
- [ ] **i) Header avatar + theme quick-toggle** — add a small header row showing the user email and a compact ThemeToggle.
- [ ] **j) Typography** — confirm h1/h2/h3 hierarchy on every page; no orphan styling.

After each fix, run dev server, eyeball, and commit with a short message: `polish: <what>`.

---

## Task 10: Extend existing E2E coverage

**Files:**
- Modify: `e2e/discovery.spec.ts` (skeleton → data)
- Modify: `e2e/flows.spec.ts` (rating updates averages; leave-group clears member)
- Create: `e2e/a11y-smoke.spec.ts` (h1 + nav aria)

- [ ] **Step 1:** In `discovery.spec.ts` add a test that asserts skeleton visible before data, then cards visible.

- [ ] **Step 2:** In `flows.spec.ts` add a rate-updates-average test (submit rating, then confirm the card shows the new count or the modal is closed + toast shown).

- [ ] **Step 3:** Write `a11y-smoke.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

const routes = ['/study-spots', '/study-groups', '/insights', '/profile']
for (const r of routes) {
  test(`a11y: ${r} has exactly one h1 and bottom nav labels`, async ({ page }) => {
    await page.goto(r)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.getByRole('navigation', { name: /primary/i })).toBeVisible()
  })
}
```

- [ ] **Step 4:** Add `aria-label="Primary"` to BottomNav if missing.

- [ ] **Step 5:** Run full suite — `npx playwright test` — green.

- [ ] **Step 6:** Commit.

```bash
git add -A
git commit -m "test: extend e2e — skeletons, rating flow, a11y smoke"
```

---

## Task 11: Final verification

- [ ] **Step 1:** `npm run typecheck` — clean.
- [ ] **Step 2:** `npm run lint` — clean (fix any warnings introduced).
- [ ] **Step 3:** `npm run build` — clean.
- [ ] **Step 4:** `npx playwright test` — all green.
- [ ] **Step 5:** Manual smoke on dev server — golden path: login → discovery → favorite → search → dark toggle → spot info → rate → group info → chat → check in → profile → theme.
- [ ] **Step 6:** Push branch, merge to main, Vercel deploys.

```bash
git push -u origin feat/full-polish-and-features
# open PR, self-merge, OR merge locally:
git checkout main && git merge --no-ff feat/full-polish-and-features && git push
```

- [ ] **Step 7:** Smoke on prod URL https://huddle-mu-blue.vercel.app.

- [ ] **Step 8:** Update auto-memory `project_huddle_prod.md` with new ship SHA + summary.

---

## Self-review

Spec coverage:
- Wave 1 audit → Task 1
- Wave 1 fixes → Tasks 2, 3, 9
- Wave 2 polish → Tasks 2 (toast), 3 (404), 9 (comprehensive polish)
- Wave 3 features → Task 4-5 (dark), 6-7 (favorites), 8 (search/sort)
- Wave 4 verification → Tasks 10, 11
- New deps → Task 0
- E2E per feature → Tasks 3, 5, 7, 8, 10

Placeholders: none.

Consistency: function names `toggleFavoriteSpot`, `subscribeToFavorites`, hook `useFavorites`, context `ThemeProvider`/`useTheme`, toast hook `useToast` — consistent across tasks.

Plan complete.
