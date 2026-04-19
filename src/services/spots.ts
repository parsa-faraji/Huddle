import { collection, doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';

export interface Spot {
  id: string;
  name: string;
  location?: string;
  description?: string;
  distance?: number;
  hours?: string;
  noiseLevel?: string;
  outlets?: boolean;
  lighting?: string;
  crowded?: string;
  roomType?: string;
  open?: boolean;
  rating?: number;
  ratingSum?: number;
  ratingCount?: number;
  image?: string;
  lat?: number;
  lng?: number;
}

export function subscribeSpots(cb: (spots: Spot[]) => void) {
  const q = query(collection(db, 'spots'), orderBy('name'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Spot, 'id'>) })));
  });
}

export async function getSpot(id: string): Promise<Spot | null> {
  const snap = await getDoc(doc(db, 'spots', id));
  return snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Spot, 'id'>) } : null;
}
