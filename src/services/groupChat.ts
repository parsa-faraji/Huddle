import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface GroupMessage {
  id: string;
  userId: string;
  displayName: string;
  body: string;
  createdAt?: Timestamp;
}

export const MAX_MESSAGE_LENGTH = 500;
const RECENT_MESSAGE_LIMIT = 50;

export function subscribeGroupMessages(
  groupId: string,
  cb: (messages: GroupMessage[]) => void,
) {
  const q = query(
    collection(db, 'groups', groupId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(RECENT_MESSAGE_LIMIT),
  );
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<GroupMessage, 'id'>),
    }));
    // Sort ascending for rendering (oldest → newest), firestore gave us DESC.
    rows.reverse();
    cb(rows);
  });
}

export async function sendGroupMessage(
  groupId: string,
  uid: string,
  displayName: string,
  body: string,
) {
  const trimmed = body.trim();
  if (!trimmed) throw new Error('Message is empty.');
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message is too long (max ${MAX_MESSAGE_LENGTH} characters).`);
  }
  await addDoc(collection(db, 'groups', groupId, 'messages'), {
    userId: uid,
    displayName: displayName || '',
    body: trimmed,
    createdAt: serverTimestamp(),
  });
}
