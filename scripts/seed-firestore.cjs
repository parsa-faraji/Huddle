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
    lat: 37.8725,
    lng: -122.2597,
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
    lat: 37.8692,
    lng: -122.2595,
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
    lat: 37.8696,
    lng: -122.2541,
  },
  {
    id: '4',
    name: 'Moffitt Library',
    location: 'On campus',
    description: '24/7 study space with group rooms',
    distance: 0.25,
    hours: '24/7',
    noiseLevel: 'Medium',
    outlets: true,
    lighting: 'Bright',
    crowded: 'Medium',
    roomType: 'Library',
    open: true,
    rating: 4.5,
    image: '/cat.webp',
    lat: 37.8726,
    lng: -122.2609,
  },
  {
    id: '5',
    name: 'Main Stacks (Gardner)',
    location: 'On campus',
    description: 'Silent underground stacks',
    distance: 0.3,
    hours: '9AM - 10PM',
    noiseLevel: 'Silent',
    outlets: true,
    lighting: 'Medium',
    crowded: 'Low',
    roomType: 'Library',
    open: true,
    rating: 4.6,
    image: '/cat.webp',
    lat: 37.8722,
    lng: -122.2598,
  },
  {
    id: '6',
    name: 'Kresge Engineering Library',
    location: 'On campus',
    description: 'Quiet engineering-focused library',
    distance: 0.5,
    hours: '9AM - 10PM',
    noiseLevel: 'Silent',
    outlets: true,
    lighting: 'Bright',
    crowded: 'Low',
    roomType: 'Library',
    open: true,
    rating: 4.4,
    image: '/cat.webp',
    lat: 37.8745,
    lng: -122.2576,
  },
  {
    id: '7',
    name: 'FSM Cafe',
    location: 'On campus',
    description: 'Busy on-campus cafe under the campanile',
    distance: 0.2,
    hours: '7AM - 6PM',
    noiseLevel: 'Medium',
    outlets: true,
    lighting: 'Bright',
    crowded: 'High',
    roomType: 'Cafe',
    open: true,
    rating: 3.8,
    image: '/anothercat.jpg',
    lat: 37.8692,
    lng: -122.2608,
  },
  {
    id: '8',
    name: 'Yali\'s Cafe',
    location: 'On campus',
    description: 'Popular cafe near the north side',
    distance: 0.45,
    hours: '7AM - 7PM',
    noiseLevel: 'Medium',
    outlets: true,
    lighting: 'Bright',
    crowded: 'Medium',
    roomType: 'Cafe',
    open: true,
    rating: 4.0,
    image: '/yetanothercat.jpg',
    lat: 37.8760,
    lng: -122.2589,
  },
  {
    id: '9',
    name: 'Bancroft Library',
    location: 'On campus',
    description: 'Historical rare books and manuscripts',
    distance: 0.3,
    hours: '10AM - 5PM',
    noiseLevel: 'Silent',
    outlets: false,
    lighting: 'Medium',
    crowded: 'Low',
    roomType: 'Library',
    open: true,
    rating: 4.3,
    image: '/cat.webp',
    lat: 37.8722,
    lng: -122.2585,
  },
  {
    id: '10',
    name: 'VLSB Life Sciences Library',
    location: 'On campus',
    description: 'Skylit atrium reading room',
    distance: 0.4,
    hours: '9AM - 9PM',
    noiseLevel: 'Silent',
    outlets: true,
    lighting: 'Bright',
    crowded: 'Medium',
    roomType: 'Library',
    open: true,
    rating: 4.2,
    image: '/anothercat.jpg',
    lat: 37.8713,
    lng: -122.2623,
  },
  {
    id: '11',
    name: 'Dwinelle Hall',
    location: 'On campus',
    description: 'Labyrinthine humanities building with quiet corners',
    distance: 0.35,
    hours: '7AM - 10PM',
    noiseLevel: 'Medium',
    outlets: true,
    lighting: 'Medium',
    crowded: 'Medium',
    roomType: 'Classroom',
    open: true,
    rating: 3.9,
    image: '/cat.webp',
    lat: 37.8711,
    lng: -122.2599,
  },
  {
    id: '12',
    name: 'Wheeler Hall',
    location: 'On campus',
    description: 'Spacious lecture hall — empty rooms on weekends',
    distance: 0.3,
    hours: '8AM - 9PM',
    noiseLevel: 'Silent',
    outlets: true,
    lighting: 'Bright',
    crowded: 'Low',
    roomType: 'Classroom',
    open: true,
    rating: 4.0,
    image: '/anothercat.jpg',
    lat: 37.8706,
    lng: -122.2581,
  },
  {
    id: '13',
    name: 'North Gate Hall',
    location: 'On campus',
    description: 'Journalism school with small hideaway rooms',
    distance: 0.55,
    hours: '8AM - 8PM',
    noiseLevel: 'Silent',
    outlets: true,
    lighting: 'Medium',
    crowded: 'Low',
    roomType: 'Classroom',
    open: true,
    rating: 4.3,
    image: '/yetanothercat.jpg',
    lat: 37.8759,
    lng: -122.2598,
  },
  {
    id: '14',
    name: 'Golden Bear Cafe',
    location: 'On campus',
    description: 'Central buzzing cafe in Lower Sproul',
    distance: 0.25,
    hours: '7AM - 8PM',
    noiseLevel: 'Loud',
    outlets: true,
    lighting: 'Bright',
    crowded: 'High',
    roomType: 'Cafe',
    open: true,
    rating: 3.7,
    image: '/cat.webp',
    lat: 37.8691,
    lng: -122.2590,
  },
  {
    id: '15',
    name: "Peet's Coffee (Sproul)",
    location: 'Off campus',
    description: 'Fast wifi, consistent seating, espresso-strong vibes',
    distance: 0.2,
    hours: '6AM - 9PM',
    noiseLevel: 'Medium',
    outlets: true,
    lighting: 'Bright',
    crowded: 'Medium',
    roomType: 'Cafe',
    open: true,
    rating: 4.1,
    image: '/yetanothercat.jpg',
    lat: 37.8685,
    lng: -122.2577,
  },
];

// Pre-seeded ratings make spots feel lived-in on first visit. userId values
// are fictional — admin SDK bypasses the rules so these writes land cleanly.
const seedReviews = [
  ['1', 'Reliable silent floors upstairs. Outlets at every seat.', 5, 'cal-demo-amelia'],
  ['1', 'Packed at midterm week but otherwise a dream.', 4, 'cal-demo-jun'],
  ['2', 'Great for group study but deafening at 2PM.', 3, 'cal-demo-reid'],
  ['3', 'Outdoor seating + espresso. Skip during rain.', 4, 'cal-demo-amelia'],
  ['4', 'Open 24/7 during dead week — lifesaver.', 5, 'cal-demo-maya'],
  ['5', 'The stacks are basically a library bunker. Silent.', 5, 'cal-demo-jun'],
  ['6', 'Grad students rule the place. Respect the silence.', 4, 'cal-demo-reid'],
  ['7', 'Coffee is mid but the view beats any other cafe.', 4, 'cal-demo-maya'],
  ['8', 'North side gem. Quiet most afternoons.', 4, 'cal-demo-amelia'],
  ['9', 'Feels like a Hogwarts reading room.', 5, 'cal-demo-maya'],
  ['10', 'The atrium light at 3PM hits different.', 4, 'cal-demo-reid'],
  ['11', "Dwinelle's classrooms are dead post-5PM — hidden gold.", 4, 'cal-demo-jun'],
  ['12', 'Weekends = free lecture halls. Clutch for group work.', 4, 'cal-demo-amelia'],
  ['13', 'Small, obscure, and almost always empty. Perfect.', 5, 'cal-demo-maya'],
  ['14', 'Loud but the energy actually helps me focus.', 4, 'cal-demo-reid'],
  ['15', 'Fastest wifi near campus + open late.', 4, 'cal-demo-jun'],
];

// Pre-seeded group chat so demo groups show what chat looks like.
const seedMessages = {
  1: [
    { userId: 'cal-demo-alex', displayName: 'Alex', body: "Heads up — bringing the MT1 study guide tonight." },
    { userId: 'cal-demo-taylor', displayName: 'Taylor', body: "🙌 I\'ll grab a room on Doe 2nd floor." },
    { userId: 'cal-demo-jordan', displayName: 'Jordan', body: "Can we start at 6:30 instead? Section runs late." },
    { userId: 'cal-demo-alex', displayName: 'Alex', body: "Works. Doe, Room 215. See you there." },
  ],
  2: [
    { userId: 'cal-demo-jamie', displayName: 'Jamie', body: "Anyone want to work through Ch.5 eigenvalues before Thurs?" },
    { userId: 'cal-demo-sam', displayName: 'Sam', body: "Yes please. 3PM Evans?" },
    { userId: 'cal-demo-jamie', displayName: 'Jamie', body: "Evans 210 — I\'ll bring the homework." },
  ],
};

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
  let backfilled = 0;
  let skipped = 0;
  for (const { id, ...data } of studySpots) {
    const ref = db.collection('spots').doc(id);
    const snap = await ref.get();
    if (snap.exists) {
      // Backfill newly-added fields (e.g. lat/lng) onto existing docs.
      const existing = snap.data() || {};
      const patch = {};
      if (existing.lat == null && data.lat != null) patch.lat = data.lat;
      if (existing.lng == null && data.lng != null) patch.lng = data.lng;
      if (Object.keys(patch).length > 0) {
        await ref.update(patch);
        backfilled++;
      } else {
        skipped++;
      }
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
  console.log(`spots: ${created} created, ${backfilled} backfilled, ${skipped} already up-to-date`);
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

async function seedReviewsAndAggregates() {
  // Only seed reviews for spots that don't already have any ratings — keeps
  // the script idempotent without nuking real user ratings.
  let createdRatings = 0;
  let touchedSpots = 0;
  const bySpot = new Map();
  for (const [spotId, comment, rating, userId] of seedReviews) {
    if (!bySpot.has(spotId)) bySpot.set(spotId, []);
    bySpot.get(spotId).push({ comment, rating, userId });
  }

  for (const [spotId, entries] of bySpot) {
    const existingSnap = await db
      .collection('ratings')
      .where('spotId', '==', spotId)
      .where('userId', 'in', entries.map((e) => e.userId))
      .get();
    const existingUsers = new Set();
    existingSnap.forEach((d) => existingUsers.add(d.data().userId));
    const toInsert = entries.filter((e) => !existingUsers.has(e.userId));
    if (toInsert.length === 0) continue;

    const batch = db.batch();
    for (const { comment, rating, userId } of toInsert) {
      const ref = db.collection('ratings').doc();
      batch.set(ref, {
        spotId,
        userId,
        overallRating: rating,
        comments: comment,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      createdRatings++;
    }
    await batch.commit();

    // Bump the spot aggregate (ratingSum / ratingCount) for the new reviews.
    const addSum = toInsert.reduce((acc, e) => acc + e.rating, 0);
    await db.collection('spots').doc(spotId).update({
      ratingSum: admin.firestore.FieldValue.increment(addSum),
      ratingCount: admin.firestore.FieldValue.increment(toInsert.length),
    });
    touchedSpots++;
  }
  console.log(`ratings: ${createdRatings} created across ${touchedSpots} spots`);
}

async function seedGroupMessages() {
  let created = 0;
  let skippedGroups = 0;
  for (const [groupId, messages] of Object.entries(seedMessages)) {
    const snap = await db.collection('groups').doc(groupId).collection('messages').limit(1).get();
    if (!snap.empty) {
      skippedGroups++;
      continue;
    }
    const batch = db.batch();
    for (const m of messages) {
      const ref = db.collection('groups').doc(groupId).collection('messages').doc();
      batch.set(ref, {
        ...m,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      created++;
    }
    await batch.commit();
  }
  console.log(
    `group messages: ${created} created, ${skippedGroups} groups already had chat history`,
  );
}

(async () => {
  try {
    await seedSpots();
    await seedGroups();
    await seedReviewsAndAggregates();
    await seedGroupMessages();
    console.log('Seed complete.');
    process.exit(0);
  } catch (e) {
    console.error('Seed failed:', e);
    process.exit(1);
  }
})();
