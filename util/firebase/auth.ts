import {
  browserSessionPersistence, createUserWithEmailAndPassword,
  onAuthStateChanged as onFirebaseAuthStateChanged, sendEmailVerification,
  setPersistence, signInWithEmailAndPassword,
  signOut, updateProfile, UserCredential,
} from 'firebase/auth';
import { Dispatch, SetStateAction } from 'react';
import { User } from '@firebase/auth';
import auth from './firebase';

export function login(email:string, password:string): Promise<UserCredential> {
  return new Promise((resolve, reject) => {
    setPersistence(auth, browserSessionPersistence)
      .then(() => resolve(signInWithEmailAndPassword(auth, email, password)))
      .catch((e) => reject(e));
  });
}

export function logout(reload?: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    signOut(auth)
      .then(() => {
        if (reload) {
          window.location.reload();
        }
        resolve();
      })
      .catch((error) => reject(error));
  });
}

export async function signUp(email:string, password:string, displayName:string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, {
    displayName,
  });
  await sendEmailVerification(user);
}

export const onAuthStateChanged = (callback: Dispatch<SetStateAction<User | null>>) => {
  onFirebaseAuthStateChanged(auth, async (user) => {
    if (user?.emailVerified) {
      callback(user);
    } else {
      await logout();
      callback(null);
    }
  });
};
