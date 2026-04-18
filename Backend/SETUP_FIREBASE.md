# Backend Firebase setup (one-time)

The backend needs **Firebase service account** credentials so it can verify users and use Firestore. You only do this once.

## Easiest: use the JSON file

1. Open [Firebase Console](https://console.firebase.google.com/) → your **huddle-5ae58** project.
2. Click the **gear** → **Project settings**.
3. Go to the **Service accounts** tab.
4. Click **Generate new private key** → **Generate key**. A JSON file downloads.
5. Move that file into this folder (**Backend**).
6. Rename it to **`serviceAccountKey.json`** (exactly that name).
7. Restart the server: `npm start`.

Done. The backend will load it automatically. Do not commit this file (it’s in .gitignore).

---

If you prefer using `.env` instead of the JSON file, copy `.env.example` to `.env` and fill in the three values from the same JSON file.
