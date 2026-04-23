import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  collection,
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserPreferences {
  noiseLevel?: string;
  seating?: string;
  outlets?: string;
  wifi?: string;
  lighting?: string;
  crowded?: string;
}

export interface UserDoc {
  email: string;
  displayName: string;
  schoolDomain?: string;
  joinedGroupIds: string[];
  joinedSpotIds: string[];
  favoriteSpotIds?: string[];
  themePreference?: 'light' | 'dark' | 'auto';
  preferences?: UserPreferences;
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

export async function getUserDocs(uids: string[]): Promise<UserDoc[]> {
  if (uids.length === 0) return [];
  const chunks: string[][] = [];
  for (let i = 0; i < uids.length; i += 30) chunks.push(uids.slice(i, i + 30));
  const docs: UserDoc[] = [];
  for (const chunk of chunks) {
    const snap = await getDocs(query(collection(db, 'users'), where('__name__', 'in', chunk)));
    snap.forEach((d) => docs.push(d.data() as UserDoc));
  }
  return docs;
}

// setDoc with merge: true tolerates the user doc not yet existing (e.g. a
// first mutation that races with signUp's initial setDoc). updateDoc would
// throw "No document to update" in that case.

export function joinSpot(uid: string, spotId: string) {
  return setDoc(doc(db, 'users', uid), { joinedSpotIds: arrayUnion(spotId) }, { merge: true });
}

export function leaveSpot(uid: string, spotId: string) {
  return updateDoc(doc(db, 'users', uid), { joinedSpotIds: arrayRemove(spotId) });
}

export function addJoinedGroup(uid: string, groupId: string) {
  return setDoc(doc(db, 'users', uid), { joinedGroupIds: arrayUnion(groupId) }, { merge: true });
}

export function removeJoinedGroup(uid: string, groupId: string) {
  return updateDoc(doc(db, 'users', uid), { joinedGroupIds: arrayRemove(groupId) });
}

export function updatePreferences(uid: string, preferences: UserPreferences) {
  return setDoc(doc(db, 'users', uid), { preferences }, { merge: true });
}

export function addFavoriteSpot(uid: string, spotId: string) {
  return setDoc(
    doc(db, 'users', uid),
    { favoriteSpotIds: arrayUnion(spotId) },
    { merge: true },
  );
}

export function removeFavoriteSpot(uid: string, spotId: string) {
  return updateDoc(doc(db, 'users', uid), {
    favoriteSpotIds: arrayRemove(spotId),
  });
}

export function updateThemePreference(
  uid: string,
  themePreference: 'light' | 'dark' | 'auto',
) {
  return setDoc(doc(db, 'users', uid), { themePreference }, { merge: true });
}
