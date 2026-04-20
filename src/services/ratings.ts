import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export interface RatingFields {
  productivity?: number;
  comfort?: number;
  location?: number;
  recommend?: boolean | null;
  overallRating?: number;
  noiseLevel?: string;
  outlets?: string;
  lighting?: string;
  crowded?: string;
  seating?: string;
  wifi?: string;
  comments?: string;
}

export interface Session extends RatingFields {
  id: string;
  spotId: string;
  spot: string;
  userId: string;
}

export async function submitRating(
  spotId: string,
  spotName: string,
  uid: string,
  fields: RatingFields,
) {
  const score = Number(fields.overallRating ?? 0);
  await runTransaction(db, async (tx) => {
    const spotRef = doc(db, 'spots', spotId);
    const spotSnap = await tx.get(spotRef);
    if (!spotSnap.exists()) throw new Error('Spot not found');
    const data = spotSnap.data() as { ratingSum?: number; ratingCount?: number };
    const newSum = (data.ratingSum ?? 0) + score;
    const newCount = (data.ratingCount ?? 0) + 1;
    tx.update(spotRef, { ratingSum: newSum, ratingCount: newCount });

    const ratingRef = doc(collection(db, 'ratings'));
    tx.set(ratingRef, {
      spotId,
      spot: spotName,
      userId: uid,
      ...fields,
      createdAt: serverTimestamp(),
    });
  });
}

export function subscribeUserSessions(uid: string, cb: (sessions: Session[]) => void) {
  // Use the where-only query + in-memory sort. Firestore's `orderBy` skips
  // docs where the field is null, which hides a freshly-written rating until
  // the server stamps `createdAt` — that shows up to users as a phantom
  // "empty Insights" for several seconds. Sorting on the client keeps the
  // doc visible immediately (the pending timestamp resolves as 0 and lands
  // at the bottom briefly, then jumps into position once confirmed).
  const plain = query(collection(db, 'ratings'), where('userId', '==', uid));
  return onSnapshot(plain, (snap) => {
    const rows = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Session, 'id'>),
    }));
    rows.sort((a, b) => {
      const at = (a as { createdAt?: { toMillis?: () => number } }).createdAt;
      const bt = (b as { createdAt?: { toMillis?: () => number } }).createdAt;
      return (bt?.toMillis?.() ?? 0) - (at?.toMillis?.() ?? 0);
    });
    cb(rows);
  });
}
