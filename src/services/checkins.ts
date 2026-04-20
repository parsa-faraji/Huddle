import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export const CHECKIN_TTL_MS = 15 * 60 * 1000;

export interface Checkin {
  id: string;
  userId: string;
  spotId: string;
  createdAt?: Timestamp;
  expiresAt: Timestamp;
}

export async function checkIn(uid: string, spotId: string): Promise<string> {
  const expiresAt = Timestamp.fromMillis(Date.now() + CHECKIN_TTL_MS);
  const ref = await addDoc(collection(db, 'checkins'), {
    userId: uid,
    spotId,
    createdAt: serverTimestamp(),
    expiresAt,
  });
  return ref.id;
}

export function cancelCheckIn(checkinId: string) {
  return deleteDoc(doc(db, 'checkins', checkinId));
}

// Subscribe to all currently-valid check-ins. The query filters server-side
// on expiresAt > now, but we re-filter on the client each render because
// `now` keeps advancing.
export function subscribeActiveCheckins(cb: (checkins: Checkin[]) => void) {
  const nowTs = Timestamp.fromMillis(Date.now() - CHECKIN_TTL_MS);
  const q = query(collection(db, 'checkins'), where('expiresAt', '>', nowTs));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Checkin, 'id'>) }));
    cb(rows);
  });
}

export function isStillActive(c: Checkin, nowMs: number = Date.now()): boolean {
  const expMs = c.expiresAt?.toMillis?.() ?? 0;
  return expMs > nowMs;
}
