import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

function requireFirestore() {
  if (!firestore) throw new Error('Firebase is not configured. Check mobile/.env.');
}

export const CARE_LOG_TYPES = ['feeding', 'sleep_start', 'sleep_end', 'diaper', 'mood', 'note'];

export const MOOD_VALUES = ['happy', 'calm', 'fussy', 'crying', 'sick'];

export const FEEDING_VALUES = [
  'breast_left', 'breast_right', 'bottle_60ml', 'bottle_90ml',
  'bottle_120ml', 'bottle_150ml', 'bottle_180ml', 'solids',
];

export const DIAPER_VALUES = ['wet', 'dirty', 'both', 'dry'];

/**
 * Add a care log entry for a child.
 * @param {{ childId, userId, type, value, note }} params
 */
export async function addCareLog({ childId, userId, type, value = '', note = '' }) {
  requireFirestore();
  if (!CARE_LOG_TYPES.includes(type)) throw new Error(`Unknown care log type: ${type}`);

  const docRef = await addDoc(collection(firestore, 'careLog'), {
    childId,
    userId,
    type,
    value: value.trim(),
    note: note.trim(),
    loggedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: docRef.id, childId, userId, type, value, note };
}

/**
 * List care log entries for a child, newest first.
 * @param {string} childId
 * @param {number} limitCount  max rows (default 50)
 */
export async function listCareLogs(childId, limitCount = 50) {
  requireFirestore();
  const snap = await getDocs(
    query(
      collection(firestore, 'careLog'),
      where('childId', '==', childId),
      orderBy('loggedAt', 'desc'),
    ),
  );
  return snap.docs.slice(0, limitCount).map((d) => ({ id: d.id, ...d.data() }));
}

export function getCareLogErrorMessage(error) {
  switch (error?.code) {
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'Firebase denied access. Check Firestore rules.';
    case 'unavailable':
      return 'Could not reach Firebase. Check your internet connection.';
    default:
      return error?.message || 'Could not save log. Please try again.';
  }
}
