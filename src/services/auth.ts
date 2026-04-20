import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { extractDomain, isStudentEmail } from './studentEmail';

export type AuthCallback = (user: User | null) => void;

export function onAuthChange(cb: AuthCallback) {
  return onAuthStateChanged(auth, cb);
}

export async function signIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export class NonStudentEmailError extends Error {
  code = 'huddle/non-student-email';
  constructor() {
    super('Huddle is limited to students — please sign up with your school email (.edu).');
  }
}

export async function signUp(name: string, email: string, password: string) {
  if (!isStudentEmail(email)) throw new NonStudentEmailError();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, 'users', cred.user.uid), {
    email,
    displayName: name || '',
    schoolDomain: extractDomain(email) ?? '',
    createdAt: serverTimestamp(),
    joinedGroupIds: [],
    joinedSpotIds: [],
  });
  return cred.user;
}

export function signOut() {
  return fbSignOut(auth);
}

export function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}
