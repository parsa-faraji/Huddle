import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// Sign up a new user
export const signUp = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user doc in Firestore on first sign-up
  await setDoc(doc(db, 'users', user.uid), {
    email: user.email,
    createdAt: new Date(),
    preferences: {}, // to be filled in later
  });

  return user;
};

// Sign in an existing user
export const signIn = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Sign out
export const logOut = () => signOut(auth);

// Listen for auth state changes (useful for protecting routes)
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);
