/* eslint-disable */
// Idempotent Firestore seed script.
// Run from repo root: node scripts/seed-firestore.js
// Requires Backend/serviceAccountKey.json (already gitignored).

const path = require('path');
const fs = require('fs');
const Module = require('module');

// firebase-admin is installed in Backend/node_modules, not root
Module.globalPaths.push(path.join(__dirname, '..', 'Backend', 'node_modules'));
const admin = require(path.join(__dirname, '..', 'Backend', 'node_modules', 'firebase-admin'));

const serviceAccountPath = path.join(__dirname, '..', 'Backend', 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error(
    `Missing ${serviceAccountPath}.\n` +
      'Download a service-account key from Firebase Console > Project settings > Service accounts.\n' +
      'See Backend/SETUP_FIREBASE.md.',
  );
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// Mock data sources (kept as the seed of truth)
const studySpots = [
  {
    id: '1',
    name: 'Doe Library',
    location: 'On campus',
    description: 'Convenient, beautiful library',
    distance: 0.3,
    hours: '9AM - 9PM',
    noiseLevel: 'Silent',
    outlets: true,
    lighting: 'Bright',
    crowded: 'Low',
    roomType: 'Library',
    open: true,
    rating: 4.7,
    image: '/cat.webp',
  },
  {
    id: '2',
    name: 'MLK Student Union',
    location: 'On campus',
    description: 'Collaborative study environment',
    distance: 0.5,
    hours: '10AM - 11PM',
    noiseLevel: 'Medium',
    outlets: true,
    lighting: 'Medium',
    crowded: 'High',
    roomType: 'Student Center',
    open: true,
    rating: 4.1,
    image: '/anothercat.jpg',
  },
  {
    id: '3',
    name: 'Cafe Strada',
    location: 'Off campus',
    description: 'Great outdoor seating',
    distance: 0.4,
    hours: '8AM - 6PM',
    noiseLevel: 'Loud',
    outlets: false,
    lighting: 'Dim',
    crowded: 'Medium',
    roomType: 'Cafe',
    open: true,
    rating: 3.2,
    image: '/yetanothercat.jpg',
  },
];

const studyGroups = [
  {
    id: '1',
    course: 'CS 61A',
    name: 'cs warriors',
    pace: 'Fast',
    noiseLevel: 'Medium',
    groupSize: 4,
    availability: 'Evenings',
    vibe: 'Focused',
    method: 'Practice problems',
    description: 'Looking for 2 more members!',
    creator: 'Alex',
    meetingTime: 'Wed, April 10, 6:00PM',
    meetingPlace: 'Doe Library Room 123',
    members: ['Alex', 'Taylor', 'Jordan'],
    image: '/cat.webp',
  },
  {
    id: '2',
    course: 'MATH 54',
    name: 'we love arun sharma',
    pace: 'Medium',
    noiseLevel: 'Quiet',
    groupSize: 3,
    availability: 'Afternoons',
    vibe: 'Chill',
    method: 'Concept discussion',
    description: 'Hoping to study collaboratively and meet new people!',
    creator: 'Jamie',
    meetingTime: 'Thu, April 11, 3:00PM',
    meetingPlace: 'Evans Hall Room 210',
    members: ['Jamie', 'Sam'],
    image: '/anothercat.jpg',
  },
];

async function seedSpots() {
  let created = 0;
  let skipped = 0;
  for (const { id, ...data } of studySpots) {
    const ref = db.collection('spots').doc(id);
    const snap = await ref.get();
    if (snap.exists) {
      skipped++;
      continue;
    }
    await ref.set({
      ...data,
      ratingSum: 0,
      ratingCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    created++;
  }
  console.log(`spots: ${created} created, ${skipped} already existed`);
}

async function seedGroups() {
  let created = 0;
  let skipped = 0;
  for (const { id, ...data } of studyGroups) {
    const ref = db.collection('groups').doc(id);
    const snap = await ref.get();
    if (snap.exists) {
      skipped++;
      continue;
    }
    await ref.set({
      ...data,
      ownerId: '',
      memberIds: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    created++;
  }
  console.log(`groups: ${created} created, ${skipped} already existed`);
}

(async () => {
  try {
    await seedSpots();
    await seedGroups();
    console.log('Seed complete.');
    process.exit(0);
  } catch (e) {
    console.error('Seed failed:', e);
    process.exit(1);
  }
})();
