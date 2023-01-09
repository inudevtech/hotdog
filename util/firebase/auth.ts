import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  UserCredential,
} from "firebase/auth";
import { Dispatch, SetStateAction } from "react";
import { GithubAuthProvider, sendPasswordResetEmail, TwitterAuthProvider, User } from "@firebase/auth";
import auth from "./firebase";

const googleProvider = new GoogleAuthProvider();
const twitterProvider = new TwitterAuthProvider();
const githubProvider = new GithubAuthProvider();

export const resetPassword = async (email?: string) => {
  if(email) {
  await sendPasswordResetEmail(auth, email);
  } else {
  await sendPasswordResetEmail(auth, <string>auth.currentUser?.email);
  }
};

export function login(
  type: number,
  email?: string,
  password?: string
): Promise<UserCredential> {
  return new Promise((resolve, reject) => {
    if (type === 0) {
      resolve(signInWithEmailAndPassword(auth, email!, password!));
    } else if (type === 1) {
      resolve(signInWithPopup(auth, googleProvider));
    } else if (type === 2) {
      resolve(signInWithPopup(auth, twitterProvider));
    } else if (type === 3) {
      resolve(signInWithPopup(auth, githubProvider));
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
  } else if (type > 0) {
    await login(type);
  }
}

export const onAuthStateChanged = (
  callback: Dispatch<SetStateAction<User | null>>
) => {
  onFirebaseAuthStateChanged(auth, async (user) => {
    if (
      user?.emailVerified ||
      user?.providerData[0].providerId !== "password"
    ) {
      callback(user);
    } else {
      await logout();
      callback(null);
    }
  });
};
