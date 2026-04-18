import {
  collection,
  doc,
  onSnapshot,
  orderBy,
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
  const q = query(
    collection(db, 'ratings'),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Session, 'id'>) })));
  });
}
