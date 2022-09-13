import {
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  UserCredential,
} from "firebase/auth";
import { Dispatch, SetStateAction } from "react";
import { User } from "@firebase/auth";
import auth from "./firebase";

const provider = new GoogleAuthProvider();

export function login(
  type: number,
  email?: string,
  password?: string
): Promise<UserCredential> {
  return new Promise((resolve, reject) => {
    if (type === 0) {
      setPersistence(auth, browserSessionPersistence)
        .then(() =>
          resolve(signInWithEmailAndPassword(auth, email!, password!))
        )
        .catch((e) => reject(e));
    } else if (type === 1) {
      setPersistence(auth, browserSessionPersistence)
        .then(() => resolve(signInWithPopup(auth, provider)))
        .catch((e) => reject(e));
    }
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

export async function signUp(
  type: number,
  email?: string,
  password?: string,
  displayName?: string
) {
  if (type === 0) {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email!,
      password!
    );
    await updateProfile(user, {
      displayName,
    });
    await sendEmailVerification(user);
  } else if (type === 1) {
    await login(type);
  }
}

export const onAuthStateChanged = (
  callback: Dispatch<SetStateAction<User | null>>
) => {
  onFirebaseAuthStateChanged(auth, async (user) => {
    if (user?.emailVerified) {
      callback(user);
    } else {
      await logout();
      callback(null);
    }
  });
};
