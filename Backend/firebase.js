const admin = require('firebase-admin');
require('dotenv').config();

// ---------------------------------------------------------------------------
// Firebase Admin SDK initialization
// ---------------------------------------------------------------------------
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
];

const missing = requiredVars.filter((v) => !process.env[v]);

if (missing.length > 0) {
  console.error(
    `[firebase] Missing required environment variables: ${missing.join(', ')}\n` +
    'See Backend/.env.example for the full list of required variables.'
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

const db = admin.firestore();

module.exports = { admin, db };
