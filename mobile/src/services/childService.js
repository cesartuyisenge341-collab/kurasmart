import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { validateChildProfile } from '../utils/childAge';

function requireFirestore() {
  if (!firestore) {
    throw new Error('Firebase is not configured. Check mobile/.env.');
  }
}

export async function listChildren(parentUid) {
  requireFirestore();
  const childrenCollection = collection(firestore, 'children');
  const [ownedSnapshot, legacySnapshot] = await Promise.all([
    getDocs(query(childrenCollection, where('userId', '==', parentUid))),
    getDocs(query(childrenCollection, where('parentUid', '==', parentUid))),
  ]);
  const uniqueDocuments = new Map();
  for (const childDocument of [
    ...ownedSnapshot.docs,
    ...legacySnapshot.docs,
  ]) {
    uniqueDocuments.set(childDocument.id, childDocument);
  }

  return [...uniqueDocuments.values()]
    .map((childDocument) => ({
      id: childDocument.id,
      ...childDocument.data(),
    }))
    .sort((left, right) => {
      const leftCreated = left.createdAt?.toMillis?.() ?? 0;
      const rightCreated = right.createdAt?.toMillis?.() ?? 0;
      return rightCreated - leftCreated;
    });
}

export async function createChildProfile({ parentUid, name, dateOfBirth }) {
  requireFirestore();
  const validationError = validateChildProfile({ name, dateOfBirth });
  if (validationError) {
    const error = new Error(validationError);
    error.code = 'child/invalid-profile';
    throw error;
  }

  const normalizedName = name.trim();
  const normalizedDate = dateOfBirth.trim();
  const createdAt = serverTimestamp();
  const reference = await addDoc(collection(firestore, 'children'), {
    userId: parentUid,
    name: normalizedName,
    dateOfBirth: normalizedDate,
    isActive: true,
    createdAt,
    updatedAt: serverTimestamp(),
  });

  return {
    id: reference.id,
    userId: parentUid,
    name: normalizedName,
    dateOfBirth: normalizedDate,
  };
}

export function getChildErrorMessage(error) {
  switch (error?.code) {
    case 'child/invalid-profile':
      return error.message;
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'Firebase denied access. Check the deployed Firestore rules.';
    case 'unavailable':
    case 'firestore/unavailable':
      return 'Could not reach Firebase. Check your internet connection.';
    default:
      return error?.message || 'Could not load child profiles. Please try again.';
  }
}
