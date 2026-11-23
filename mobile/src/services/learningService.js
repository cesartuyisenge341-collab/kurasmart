/**
 * learningService — schedule lessons and push them to wearable devices.
 *
 * Firestore collections:
 *   learningSchedules/{id}  — scheduled lessons per child
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

function requireFirestore() {
  if (!firestore) throw new Error('Firebase not configured. Check mobile/.env.');
}

/**
 * Schedule a lesson for a child on a given date.
 */
export async function scheduleLesson({
  childId,
  parentUid,
  lessonId,
  lessonTitle,
  lessonIcon,
  domain,
  scheduledDate,   // 'YYYY-MM-DD'
  scheduledTime,   // 'HH:MM'
  durationMin,
  lang,
}) {
  requireFirestore();
  const ref = await addDoc(collection(firestore, 'learningSchedules'), {
    childId,
    parentUid,
    lessonId,
    lessonTitle,
    lessonIcon,
    domain,
    scheduledDate,
    scheduledTime,
    durationMin,
    lang,
    status: 'scheduled',   // 'scheduled' | 'playing' | 'done' | 'skipped'
    sentToDevice: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Load all schedules for a child (newest first).
 */
export async function getSchedules(childId) {
  requireFirestore();
  const snap = await getDocs(
    query(
      collection(firestore, 'learningSchedules'),
      where('childId', '==', childId),
      orderBy('scheduledDate', 'desc'),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get today's scheduled lessons for a child.
 */
export async function getTodaySchedules(childId) {
  requireFirestore();
  const today = new Date().toISOString().split('T')[0];
  const snap = await getDocs(
    query(
      collection(firestore, 'learningSchedules'),
      where('childId', '==', childId),
      where('scheduledDate', '==', today),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Mark a schedule as sent to the wearable device.
 * In a real system this would call an HTTP endpoint on the ESP32.
 */
export async function sendToDevice(scheduleId) {
  requireFirestore();
  await updateDoc(doc(firestore, 'learningSchedules', scheduleId), {
    sentToDevice: true,
    status: 'playing',
  });
  // TODO: HTTP call to ESP32 endpoint when device integration is ready
  return true;
}

/**
 * Mark a schedule as done.
 */
export async function markDone(scheduleId) {
  requireFirestore();
  await updateDoc(doc(firestore, 'learningSchedules', scheduleId), {
    status: 'done',
  });
}

/**
 * Delete a scheduled lesson.
 */
export async function deleteSchedule(scheduleId) {
  requireFirestore();
  await deleteDoc(doc(firestore, 'learningSchedules', scheduleId));
}

export function getLearningErrorMessage(error) {
  switch (error?.code) {
    case 'permission-denied': return 'Firebase denied access. Check Firestore rules.';
    case 'unavailable':       return 'No internet connection.';
    default:                  return error?.message || 'Something went wrong.';
  }
}
