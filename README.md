# Huddle

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![License: Educational](https://img.shields.io/badge/License-Educational-blue?style=flat-square)](LICENSE)

A campus study spot discovery, rating, and group matching app for students.

## About

Huddle helps students find study locations on campus, match with study groups, and get personalized spot recommendations. Users explore study spots on a map or list, rate them on multiple axes (noise, seating, lighting, outlets, WiFi, crowdedness), set personal study preferences, and receive recommendations — both individually and for their study groups.

## Features

- **Study spot discovery** — browse spots in a list *or* on an interactive map (Leaflet + OpenStreetMap), with live data from Firestore.
- **Filter chips** — narrow the list by `Quiet`, `Outlets`, or `Open now`.
- **Ratings & reviews** — rate a spot across productivity, comfort, location, noise, seating, outlets, WiFi, lighting, crowdedness, plus an overall score and comments. Community averages display on every spot card.
- **Study groups** — create a group with class/pace/noise/size/meeting info; discover groups by course; join or leave. Members can iCal export the next meeting or email the group.
- **User preferences** — set your preferred noise, seating, outlets, WiFi, lighting, and crowdedness on `/profile`.
- **Personalized recommendations** — "Recommended for you" strip on the discovery page, scored from your preferences against each spot.
- **Group recommendations** — each group's info page shows the top spots that best match the aggregated preferences of its members.
- **Auth** — email/password sign-up and sign-in with protected routes; password reset via email.

## Tech stack

| Layer | Tools |
|-------|-------|
| Frontend | React 19, React Router 7, TailwindCSS 4, Vite 7 |
| Backend API | Node.js + Express (`Backend/`), deployable to Render or wrapped for Vercel (`api/index.js` via `serverless-http`) |
| Database & Auth | Firebase (Firestore + Auth) |
| Map | Leaflet + react-leaflet, OpenStreetMap tiles |
| Language | TypeScript for services/utils, JSX for React components |

## Getting started

### Prerequisites

- Node.js v18+
- npm
- A Firebase project (Firestore + Email/Password auth enabled)

### 1. Install

```bash
git clone https://github.com/parsa-faraji/Huddle.git
cd Huddle
npm install
(cd Backend && npm install)
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in the Firebase web-app config values from **Firebase Console → Project settings → Your apps**.

### 3. Seed Firestore (one-time)

Download a service-account key from **Firebase Console → Project settings → Service accounts**, save it as `Backend/serviceAccountKey.json` (already gitignored), then:

```bash
node scripts/seed-firestore.cjs
```

The seed is idempotent and backfills new fields (e.g. `lat`/`lng`) onto existing docs, so it's safe to re-run.

### 4. Run dev servers

Two terminals:

```bash
# terminal 1 — frontend
npm run dev

# terminal 2 — backend (optional, for /profile and /health endpoints)
npm run backend:dev
```

Frontend defaults to `http://localhost:5173`, backend to `http://localhost:5000`.

## Project structure

```
Huddle/
├── api/                    # Vercel serverless wrapper (re-exports Backend/server)
├── Backend/                # Express API + Firebase Admin
│   ├── server.js           # Express app (listens only when run directly)
│   ├── middleware/
│   │   └── verifyToken.js  # Firebase ID-token verification
│   └── firebase.js         # Admin SDK init
├── public/                 # Static assets (images, svgs)
├── scripts/
│   └── seed-firestore.cjs  # Idempotent seed for spots + groups
├── src/
│   ├── components/         # Cards, modals, nav, MapView, RequireAuth
│   ├── context/            # AuthContext, AppContext
│   ├── data/               # Legacy mock data (seed source of truth)
│   ├── layouts/            # AppLayout (with BottomNav), AuthLayout
│   ├── pages/              # Route components
│   │   ├── auth/           # Login, Signup
│   │   ├── study-spots/    # Discovery, Info, SessionLog
│   │   ├── study-groups/   # Discovery, Info, Create
│   │   ├── Insights.jsx    # Joined spots/groups + rated sessions
│   │   └── Profile.jsx     # User preferences
│   ├── services/           # Firestore/Auth wrappers (TypeScript)
│   ├── utils/
│   │   └── recommendations.ts  # Scoring + aggregation logic
│   ├── types/              # Shared domain types
│   └── App.jsx             # Route table
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Composite indexes (ratings by user+createdAt)
├── render.yaml             # Render blueprint (backend)
├── vercel.json             # Vercel rewrites (frontend + /api)
└── .env.example            # Firebase web config template
```

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Vite dev server (frontend) |
| `npm run build` | Production frontend build into `dist/` |
| `npm run preview` | Serve the built `dist/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run backend:install` | Install Backend deps |
| `npm run backend:dev` | Start Express backend on :5000 |

## Deployment

Two paths are supported; pick one per environment.

- **Vercel** — `vercel.json` rewrites the SPA and routes `/api/*` to `api/index.js`, which wraps `Backend/server.js` via `serverless-http`. You will need `serverless-http` added to `Backend/package.json` before deploying.
- **Render** — `render.yaml` provisions the Express backend directly. The Vite frontend can be hosted on any static host (Vercel, Netlify, Cloudflare Pages).

## Firestore collections

| Collection | Purpose | Doc shape (highlights) |
|-----------|---------|------------------------|
| `users/{uid}` | Account + prefs | `email`, `displayName`, `joinedGroupIds[]`, `joinedSpotIds[]`, `preferences?` |
| `spots/{id}` | Study spots | `name`, `location`, `noiseLevel`, `outlets`, `lighting`, `crowded`, `open`, `lat`, `lng`, `ratingSum`, `ratingCount` |
| `groups/{id}` | Study groups | `name`, `course`, `ownerId`, `memberIds[]`, `members[]`, `meetingTime`, `meetingPlace` |
| `ratings/{id}` | Rating submissions | `userId`, `spotId`, `overallRating`, plus per-axis scores + comments |

Security rules restrict writes to doc owners and to controlled fields (e.g. any signed-in user may only update `ratingSum`/`ratingCount` on a spot, or `memberIds`/`members` on a group). See `firestore.rules`.

## Team

Built by the Huddle team — members across frontend, backend, design, and data.

## License

This project is for educational purposes.
