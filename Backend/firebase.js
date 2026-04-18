const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Option 1: Use service account JSON file (download from Firebase Console → Project settings → Service accounts → Generate new private key)
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
let initialized = false;

if (require('fs').existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  initialized = true;
} else if (process.env.FIREBASE_PRIVATE_KEY) {
  // Option 2: Use .env variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
  initialized = true;
}

if (!initialized) {
  console.warn('Firebase Admin: No serviceAccountKey.json and no FIREBASE_* in .env. Auth/Firestore will not work.');
  admin.initializeApp({ projectId: 'dummy-project' });
}

const db = admin.firestore();
module.exports = { admin, db };
