import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import type { AuthStateCallback, Unsubscribe, UserProfile } from '../types';

/**
 * Register a new user and create their Firestore profile document.
 */
export const signUp = async (email: string, password: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const profile: UserProfile = {
    email: user.email ?? email,
    createdAt: new Date(),
    preferences: {},
  };

  await setDoc(doc(db, 'users', user.uid), profile);

  return user;
};

/**
 * Sign in an existing user with email and password.
 */
export const signIn = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Sign the current user out.
 */
export const logOut = (): Promise<void> => signOut(auth);

/**
 * Subscribe to authentication state changes.
 *
 * @returns An unsubscribe function to stop listening.
 */
export const onAuthChange = (callback: AuthStateCallback): Unsubscribe =>
  onAuthStateChanged(auth, callback);
