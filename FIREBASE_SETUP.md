# Firebase Setup for Huddle

## 1) Create a Firebase project
1. Open https://console.firebase.google.com
2. Click `Create a project`.
3. Project name suggestion: `huddle-dev`.
4. Enable Google Analytics only if you need it.

## 2) Add a Web app
1. Inside your project, click `</>` (Web app).
2. Register app name: `huddle-web`.
3. Copy the Firebase config values.

## 3) Configure local env
1. In project root, copy env template:
   - `cp .env.example .env.local`
2. Fill all `VITE_FIREBASE_*` values from Firebase Console:
   - Firebase Console -> Project settings -> General -> Your apps -> SDK setup and configuration

## 4) Enable Firebase products
In Firebase Console, enable:
1. Authentication
   - Sign-in providers: start with `Email/Password`.
2. Firestore Database
   - Create database in `production mode`.
3. Storage
   - Create bucket in your preferred region.

## 5) Install project dependencies
When app files (`package.json`) are present:
- `npm install`
- Ensure `firebase` package exists. If missing: `npm install firebase`

## 6) Connect app code
Use `src/services/firebase.ts` for shared Firebase initialization and imports:
- `auth` for Authentication
- `db` for Firestore
- `storage` for Cloud Storage

## 7) Deploy rules/indexes (optional but recommended)
If using Firebase CLI:
1. `npm install -g firebase-tools`
2. `firebase login`
3. `firebase init firestore storage` (if needed)
4. `firebase use --add`
5. `firebase deploy --only firestore:rules,firestore:indexes,storage`

## Notes
- Current rules are starter rules requiring authenticated users.
- Tighten rules per collection once your schema is implemented.
