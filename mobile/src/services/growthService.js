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

/**
 * Add a growth measurement record.
 * @param {{ childId, userId, measuredOn, weight, height, headCircumference, note }}
 */
export async function addGrowthRecord({
  childId,
  userId,
  measuredOn,   // 'YYYY-MM-DD'
  weight,       // kg, optional
  height,       // cm, optional
  headCircumference, // cm, optional
  note = '',
}) {
  requireFirestore();

  if (!measuredOn || !/^\d{4}-\d{2}-\d{2}$/.test(measuredOn)) {
    throw new Error('Enter a valid date in YYYY-MM-DD format.');
  }
  const hasAtLeastOne = weight || height || headCircumference;
  if (!hasAtLeastOne) {
    throw new Error('Enter at least one measurement (weight, height, or head circumference).');
  }

  const data = {
    childId,
    recordedBy: userId,
    measuredOn,
    note: note.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (weight)            data.weight            = parseFloat(weight);
  if (height)            data.height            = parseFloat(height);
  if (headCircumference) data.headCircumference = parseFloat(headCircumference);

  const ref = await addDoc(collection(firestore, 'growthRecords'), data);
  return { id: ref.id, ...data };
}

/**
 * List growth records for a child, newest first.
 */
export async function listGrowthRecords(childId) {
  requireFirestore();
  const snap = await getDocs(
    query(
      collection(firestore, 'growthRecords'),
      where('childId', '==', childId),
      orderBy('measuredOn', 'desc'),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function getGrowthErrorMessage(error) {
  switch (error?.code) {
    case 'permission-denied':
      return 'Firebase denied access. Check Firestore rules.';
    case 'unavailable':
      return 'Could not reach Firebase. Check your internet connection.';
    default:
      return error?.message || 'Could not save record. Please try again.';
  }
}
