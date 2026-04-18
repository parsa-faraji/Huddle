import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  collection,
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserDoc {
  email: string;
  displayName: string;
  joinedGroupIds: string[];
  joinedSpotIds: string[];
}

export function subscribeUserDoc(uid: string, cb: (data: UserDoc | null) => void) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    cb(snap.exists() ? (snap.data() as UserDoc) : null);
  });
}

export async function getUserDoc(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

export async function getUserEmails(uids: string[]): Promise<string[]> {
  if (uids.length === 0) return [];
  // Firestore `in` supports up to 30 values per query
  const chunks: string[][] = [];
  for (let i = 0; i < uids.length; i += 30) chunks.push(uids.slice(i, i + 30));
  const emails: string[] = [];
  for (const chunk of chunks) {
    const snap = await getDocs(query(collection(db, 'users'), where('__name__', 'in', chunk)));
    snap.forEach((d) => {
      const data = d.data() as UserDoc;
      if (data.email) emails.push(data.email);
    });
  }
  return emails;
}

export function joinSpot(uid: string, spotId: string) {
  return updateDoc(doc(db, 'users', uid), { joinedSpotIds: arrayUnion(spotId) });
}

export function leaveSpot(uid: string, spotId: string) {
  return updateDoc(doc(db, 'users', uid), { joinedSpotIds: arrayRemove(spotId) });
}

export function addJoinedGroup(uid: string, groupId: string) {
  return updateDoc(doc(db, 'users', uid), { joinedGroupIds: arrayUnion(groupId) });
}

export function removeJoinedGroup(uid: string, groupId: string) {
  return updateDoc(doc(db, 'users', uid), { joinedGroupIds: arrayRemove(groupId) });
}
