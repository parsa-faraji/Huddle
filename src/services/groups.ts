import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { addJoinedGroup, removeJoinedGroup } from './users';

export interface Group {
  id: string;
  name: string;
  course?: string;
  pace?: string;
  noiseLevel?: string;
  groupSize?: number | string;
  availability?: string;
  vibe?: string;
  method?: string;
  description?: string;
  creator?: string;
  meetingTime?: string;
  meetingPlace?: string;
  members?: string[];
  memberIds?: string[];
  ownerId?: string;
  image?: string;
}

export function subscribeGroups(cb: (groups: Group[]) => void) {
  const q = query(collection(db, 'groups'), orderBy('name'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Group, 'id'>) })));
  });
}

export async function getGroup(id: string): Promise<Group | null> {
  const snap = await getDoc(doc(db, 'groups', id));
  return snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Group, 'id'>) } : null;
}

export async function createGroup(data: Omit<Group, 'id'>, ownerUid: string, ownerName: string) {
  const payload = {
    ...data,
    ownerId: ownerUid,
    creator: ownerName || data.creator || '',
    memberIds: [ownerUid],
    members: ownerName ? [ownerName] : [],
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, 'groups'), payload);
  await addJoinedGroup(ownerUid, ref.id);
  return { id: ref.id, ...payload } as Group;
}

export async function joinGroup(groupId: string, uid: string, displayName: string) {
  await updateDoc(doc(db, 'groups', groupId), {
    memberIds: arrayUnion(uid),
    ...(displayName ? { members: arrayUnion(displayName) } : {}),
  });
  await addJoinedGroup(uid, groupId);
}

export async function leaveGroup(groupId: string, uid: string, displayName: string) {
  await updateDoc(doc(db, 'groups', groupId), {
    memberIds: arrayRemove(uid),
    ...(displayName ? { members: arrayRemove(displayName) } : {}),
  });
  await removeJoinedGroup(uid, groupId);
}
