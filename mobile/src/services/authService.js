import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth } from '../config/auth';
import { firestore } from '../config/firebase';

function requireFirebase() {
  if (!auth || !firestore) {
    throw new Error('Firebase is not configured. Check mobile/.env.');
  }
}

export async function registerParent({ fullName, email, password }) {
  requireFirebase();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = fullName.trim();
  const credential = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password,
  );

  try {
    await updateProfile(credential.user, { displayName: normalizedName });
    await setDoc(doc(firestore, 'users', credential.user.uid), {
      uid: credential.user.uid,
      email: normalizedEmail,
      fullName: normalizedName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return credential.user;
  } catch (profileError) {
    try {
      await deleteUser(credential.user);
    } catch (rollbackError) {
      throw new Error(
        'Your account was created, but its profile could not be saved and the account could not be rolled back. Contact support before trying again.',
        { cause: rollbackError },
      );
    }
    throw profileError;
  }
}

export async function signInParent({ email, password }) {
  requireFirebase();
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password,
  );
  return credential.user;
}

export async function requestPasswordReset(email) {
  requireFirebase();
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

export async function signOutParent() {
  requireFirebase();
  await signOut(auth);
}

export function getAuthErrorMessage(error) {
  if (error?.message?.startsWith('Your account was created')) {
    return error.message;
  }

  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'An account already uses this email. Try signing in instead.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Choose a stronger password.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'The email or password is incorrect.';
    case 'auth/too-many-requests':
      return 'There have been too many attempts. Wait a little and try again.';
    case 'auth/network-request-failed':
      return 'Could not reach Firebase. Check your internet connection.';
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'Firebase denied profile creation. Check the Firestore users rules.';
    default:
      return error?.message || 'Something went wrong. Please try again.';
  }
}
