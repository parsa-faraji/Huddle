# Huddle Backend Workshop – Pair Programming Guide

A step-by-step guide for your team to learn and build the Huddle backend together.

---

## Before You Start

1. **Open the Playground** – In your browser, open `playground.html` (double-click it or drag into browser).
2. **Start the backend** – In a terminal: `cd Backend && npm start`
3. **Share your screen** – For pair programming, one person shares; switch driver every 10–15 min.

---

## Session 1: Your First Endpoint (30–45 min)

**Goal:** Understand request → server → response, and add a new endpoint.

### Step 1: Test what’s already there
- In the Playground, click **Home** preset, then **Send request**
- You should see: `Backend is running!`
- Click **Health** preset, then **Send request**
- You should see: `{ "ok": true, "message": "Backend is healthy!" }`

### Step 2: Add a new endpoint
Open `server.js` and add:

```javascript
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});
```

Restart the server (Ctrl+C, then `npm start`). In the Playground, set path to `/api/hello`, click Send. You should see your message.

**Discuss:** What does `res.json()` do? Why do we use it instead of `res.send()`?

---

## Session 2: Protected Routes & Auth (45–60 min)

**Goal:** Understand how `verifyToken` works and test a protected route.

### Step 1: See what happens without a token
- Click **Profile** preset, leave the token field empty, click Send
- You should get `401` and `{ "error": "No token provided" }`

### Step 2: Get a token
1. Sign in on the Huddle frontend (http://localhost:5173)
2. Go to the Dashboard and click **Fetch My Profile from Backend**
3. Open DevTools (F12) → **Network** tab
4. Click the request to `profile` → **Headers** → find **Request Headers** → copy the value of `Authorization` (everything after `Bearer `)
5. Paste that into the Playground’s “Auth token” field

### Step 3: Call /profile with the token
- Click **Profile** preset, then Send
- You should get `200` and `{ "message": "Hello user <your-uid>" }`

**Discuss:** What does `verifyToken` do? Where does `req.user` come from?

---

## Session 3: Study Spots – Read from Firestore (60 min)

**Goal:** Create study spots in Firestore and return them via an API.

### Step 1: Plan the data
Decide what a “study spot” looks like, e.g.:

```json
{
  "id": "spot1",
  "name": "Main Library 3F",
  "noise": "quiet",
  "hasOutlets": true,
  "openLate": false
}
```

### Step 2: Add test data in Firestore
In [Firebase Console](https://console.firebase.google.com/) → Firestore → start a `spots` collection and add 1–2 documents.

### Step 3: Add the endpoint
In `server.js`:

```javascript
const { db } = require('./firebase');

app.get('/api/spots', async (req, res) => {
  try {
    const snapshot = await db.collection('spots').get();
    const spots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ spots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

Restart, add a preset in the Playground for `GET /api/spots`, and test.

**Discuss:** What is `snapshot.docs`? Why do we use `doc.id` and `doc.data()`?

---

## Session 4: Create a Spot (POST) (45 min)

**Goal:** Accept JSON in the request body and write to Firestore.

Add:

```javascript
app.post('/api/spots', verifyToken, async (req, res) => {
  try {
    const { name, noise, hasOutlets, openLate } = req.body;
    const ref = await db.collection('spots').add({
      name,
      noise: noise || 'unknown',
      hasOutlets: !!hasOutlets,
      openLate: !!openLate,
      createdBy: req.user.uid,
      createdAt: new Date(),
    });
    res.status(201).json({ id: ref.id, message: 'Spot created!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

In the Playground: Method `POST`, path `/api/spots`, Body:

```json
{
  "name": "Coffee Shop Study",
  "noise": "moderate",
  "hasOutlets": true,
  "openLate": true
}
```

Add your token and Send.

---

## Session 5: Filtering (Query params) (30 min)

**Goal:** Filter spots with `?noise=quiet` etc.

```javascript
app.get('/api/spots', async (req, res) => {
  try {
    let query = db.collection('spots');
    if (req.query.noise) {
      query = query.where('noise', '==', req.query.noise);
    }
    const snapshot = await query.get();
    const spots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ spots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

Test in Playground: path `/api/spots?noise=quiet`

---

## What to Build Next

| Feature          | Suggested endpoint              | HTTP   |
|------------------|----------------------------------|--------|
| Get one spot     | `GET /api/spots/:id`            | GET    |
| Add rating       | `POST /api/spots/:id/ratings`   | POST   |
| User preferences | `GET /api/profile/preferences`  | GET    |
| Update prefs     | `PATCH /api/profile/preferences`| PATCH  |
| Create group     | `POST /api/groups`              | POST   |
| Join group       | `POST /api/groups/:id/join`     | POST   |

Add presets in the Playground for each new endpoint as you build them.

---

## Pair Programming Roles

- **Driver** – Types code, runs requests, shares screen
- **Navigator** – Reads this guide, suggests next step, asks “what if we…?”
- Switch every 10–15 minutes.

---

## Tips

- Keep the Playground and this guide open side by side.
- When something breaks, read the error in the response – it usually tells you what’s wrong.
- Use `console.log(req.body)` or `console.log(req.query)` to debug.
- Have fun and ask lots of questions!
