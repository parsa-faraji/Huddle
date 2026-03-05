const admin = require('firebase-admin');
require('dotenv').config();

if (process.env.FIREBASE_PRIVATE_KEY) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
} else {
  console.warn('FIREBASE_PRIVATE_KEY is missing. Firebase Admin SDK not initialized.');
  // Initialize with dummy config just to prevent crashes if it's used elsewhere
  admin.initializeApp({ projectId: 'dummy-project' });
}

const db = admin.firestore();
module.exports = { admin, db };
