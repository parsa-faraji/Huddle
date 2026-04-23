# Huddle: Full Polish, Features, and Verification

**Date:** 2026-04-22
**Scope:** End-to-end pass over the Huddle app to stabilize, polish, add three leverage features, and prove everything works via Playwright.

## Goal

Take Huddle from "shipped and functional" to "feels done." Every page polished. Every feature tested. Three new features that noticeably raise perceived value (Search, Favorites, Dark Mode). All flows covered by Playwright.

## Current state (as of 5266960)

- React 19 + Vite 7 + Tailwind 4 + Firebase (Firestore + Auth).
- 15 seeded UCB spots, 2 seeded groups, pre-seeded ratings + chat messages.
- Pages: Login, Signup, Discovery (spots), Spot Info, Session Log, Groups Discovery, Group Info, Create Group, Insights, Profile, plus a 3-step onboarding tour.
- Existing E2E: `auth.spec.ts`, `checkins.spec.ts`, `discovery.spec.ts`, `flows.spec.ts`, `group-chat.spec.ts`, `onboarding.spec.ts`, `signup-gate.spec.ts` — 23 tests green at last ship.
- Services layer (TS) wraps Firestore: `spots`, `groups`, `ratings`, `users`, `checkins`, `groupChat`, `auth`.

## Non-goals

- No backend rewrite, no new server endpoints.
- No redesign of the information architecture (routes stay as-is).
- No new third-party services (no Sentry, no PostHog, etc.).
- No photo uploads (would require Storage bucket + rules — out of scope).

## Wave 1 — Audit & fix (stability + correctness)

Manual walk-through of every flow. For each discovered issue: a git commit with a fix and, where practical, an E2E test.

Flows to audit:
1. Anonymous → login/signup (including .edu gate error messaging)
2. Discovery: list, map, filter chips, recommendations strip
3. Spot Info: ratings, rate-this-spot, check-in, community averages
4. Groups: discovery, info, create, join/leave, chat, iCal export
5. Insights: joined spots, joined groups, rated sessions
6. Profile: preferences save/load
7. Onboarding tour: appears, dismisses, help button re-opens

Expected rough edges based on code tour (to verify in-browser):
- Form error messages inconsistent across auth forms.
- Loading skeleton coverage may not be full — some pages show blank-flash before data.
- Map popups probably not mobile-friendly.
- Missing 404 route.
- Keyboard nav for modals (escape, focus trap).

## Wave 2 — Polish pass

- **Design tokens:** unify any ad-hoc color/spacing into existing tokens.
- **Loading states:** skeleton on every data-fetch page (discovery, spot info, group info, insights, profile).
- **Empty states:** each list page gets an illustrated empty state with CTA.
- **Micro-interactions:** button press/hover, card hover-raise (desktop), tap feedback (mobile), route transitions.
- **Typography:** verify scale applies everywhere, headings hierarchy correct.
- **Forms:** inline validation, error messages, success toasts.
- **Mobile:** 44px tap targets, safe-area padding, bottom nav doesn't cover content.
- **A11y basics:** aria-labels on icon buttons, focus-visible rings, form labels, escape-closes-modal, focus trap in modals.
- **404 page:** friendly not-found with "back to Discovery" link.
- **Toast/notification system:** lightweight, used for success + error surfaces.

## Wave 3 — New features

### 3a. Search + unified controls on Discovery
- Text input: filters spots by `name`, `location`, `type`, or matching course (if we keep a courses array per spot — otherwise skip course).
- Existing filter chips move into a controls row alongside search + sort.
- Sort: Recommended (default, preferences-scored), Name A–Z, Highest rated, Most reviewed.
- Debounced (250ms) for polish.

### 3b. Favorites
- Per-user `favoriteSpotIds: string[]` on the `users/{uid}` doc.
- Heart icon on each spot card; toggles with optimistic update.
- Insights page gets a "Favorites" section above joined spots.
- Discovery page: a "Your favorites" strip appears above the list when user has ≥1 favorite.
- Firestore rule addition: user may update their own `favoriteSpotIds`.

### 3c. Dark mode
- `class`-based dark mode on `html`, driven by Tailwind 4's `darkVariant`.
- Toggle lives in Profile + in a quick toggle near the avatar (or in bottom nav overflow — TBD during polish).
- Preference: `auto` (system), `light`, `dark`. Persists to `localStorage`; signed-in users also get it mirrored to `users/{uid}.themePreference`.
- All existing surfaces updated to use dark-aware token classes.

## Wave 4 — Playwright verification

Extend E2E suite to cover every feature, including new ones. Per the user directive, every feature gets a test.

New/extended tests:
- `search-and-sort.spec.ts` — search filters correctly, sort changes ordering.
- `favorites.spec.ts` — toggle heart, appears on Discovery strip, appears on Insights, persists across reload.
- `theme.spec.ts` — toggle dark mode, class applied, persists on reload.
- `not-found.spec.ts` — unknown URL renders 404 page with back link.
- Extend `flows.spec.ts` to cover rating submission updates averages, leave-group removes membership.
- Extend `discovery.spec.ts` to include loading skeleton → data swap (not flash).
- A11y smoke: verify every page has a unique `<h1>` and that bottom-nav items have accessible names.

All tests: `npm run test:e2e` should be green before we call it done. Build must pass. Typecheck must pass.

## Rollout plan

1. Create a feature branch: `feat/full-polish-and-features`. Commit in waves (one commit per logical change, not one giant commit).
2. Run dev server throughout, verify visually + via Playwright as each wave lands.
3. At the end: `npm run build` clean, `npm run lint` clean, `npm run typecheck` clean, `npx playwright test` all green.
4. Merge to `main`, push, Vercel deploys, smoke-test the live URL.
5. Update seed script only if Favorites/theme touch seed; re-run if needed.

## Dependencies to add

- `lucide-react` — consistent icon set (heart, search, sun, moon, x, etc.), tree-shaken.
- `clsx` — class merging for dark-mode-aware conditional classes. ~400b.

That's it. No other new deps.

## Open questions (resolved)

- **Which features?** Search, Favorites, Dark mode. (User-confirmed.)
- **New deps OK?** Yes (`lucide-react` + `clsx`). (User-confirmed.)
- **Testing bar?** Every feature covered by Playwright. (User-directive.)

## Success criteria

- All existing E2E pass.
- New E2E pass for search/sort, favorites, dark mode, 404.
- Build + lint + typecheck clean.
- Manual smoke on prod: sign up, browse, favorite a spot, toggle dark, join a group, chat, check in, rate a spot, sign out — all work.
- Visually: every page feels intentional. Loading states smooth, empty states useful, micro-interactions subtle but present.
