/**
 * Caregiver service — manages caregiver accounts, access requests and approvals.
 *
 * Firestore collections used:
 *   users/{uid}                  — role: 'parent' | 'caregiver'
 *   caregiverRequests/{reqId}    — pending / approved / rejected requests
 *   children/{childId}           — parent-owned child profiles
 */
import {
  addDoc,
  collection,
  deleteUser as _deleteUser,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../config/auth';
import { firestore } from '../config/firebase';

function requireFirebase() {
  if (!auth || !firestore) throw new Error('Firebase not configured. Check mobile/.env.');
}

// ─── Registration ───────────────────────────────────────

/**
 * Register a new caregiver account.
 * Writes users/{uid} with role:'caregiver'.
 */
export async function registerCaregiver({ fullName, email, password, institution }) {
  requireFirebase();
  const credential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);

  try {
    await updateProfile(credential.user, { displayName: fullName.trim() });
    await setDoc(doc(firestore, 'users', credential.user.uid), {
      uid: credential.user.uid,
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      institution: institution.trim(),
      role: 'caregiver',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return credential.user;
  } catch (err) {
    // Roll back — delete the Firebase Auth user so the email is free again
    try { await credential.user.delete(); } catch {}
    throw err;
  }
}

// ─── Sign in (shared with parent, role determined from Firestore) ────────────

export async function signInUser({ email, password }) {
  requireFirebase();
  const credential = await signInWithEmailAndPassword(
    auth, email.trim().toLowerCase(), password,
  );
  return credential.user;
}

// ─── Fetch user profile (to read role) ──────────────────

export async function getUserProfile(uid) {
  requireFirebase();
  const { getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(firestore, 'users', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ─── Child access codes ──────────────────────────────────

/**
 * Look up a child by its access code (the child's Firestore document ID is the code).
 * Returns the child doc or null.
 */
export async function findChildByCode(code) {
  requireFirebase();
  const { getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(firestore, 'children', code.trim()));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ─── Caregiver access requests ───────────────────────────

/**
 * Caregiver sends a request to access a child.
 * Prevents duplicate pending requests.
 */
export async function sendCaregiverRequest({ caregiverUid, caregiverName, caregiverEmail, institution, childId, childName, parentUid }) {
  requireFirebase();

  // Check for existing pending request
  const existing = await getDocs(
    query(
      collection(firestore, 'caregiverRequests'),
      where('caregiverUid', '==', caregiverUid),
      where('childId', '==', childId),
      where('status', '==', 'pending'),
    ),
  );
  if (!existing.empty) throw new Error('already_pending');

  const ref = await addDoc(collection(firestore, 'caregiverRequests'), {
    caregiverUid,
    caregiverName,
    caregiverEmail,
    institution,
    childId,
    childName,
    parentUid,
    status: 'pending',   // 'pending' | 'approved' | 'rejected'
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Parent approves a request.
 */
export async function approveRequest(requestId) {
  requireFirebase();
  await updateDoc(doc(firestore, 'caregiverRequests', requestId), {
    status: 'approved',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Parent rejects a request.
 */
export async function rejectRequest(requestId) {
  requireFirebase();
  await updateDoc(doc(firestore, 'caregiverRequests', requestId), {
    status: 'rejected',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Parent revokes a previously approved request.
 */
export async function revokeAccess(requestId) {
  requireFirebase();
  await updateDoc(doc(firestore, 'caregiverRequests', requestId), {
    status: 'rejected',
    revokedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// ─── Queries ─────────────────────────────────────────────

/**
 * Get all requests for children owned by this parent (for the approval screen).
 */
export async function getRequestsForParent(parentUid) {
  requireFirebase();
  const snap = await getDocs(
    query(
      collection(firestore, 'caregiverRequests'),
      where('parentUid', '==', parentUid),
      orderBy('createdAt', 'desc'),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Subscribe to parent requests in real time (returns unsubscribe fn).
 */
export function subscribeToParentRequests(parentUid, onChange) {
  return onSnapshot(
    query(
      collection(firestore, 'caregiverRequests'),
      where('parentUid', '==', parentUid),
      orderBy('createdAt', 'desc'),
    ),
    (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
  );
}

/**
 * Get all approved children for a caregiver (across all families).
 */
export async function getApprovedChildrenForCaregiver(caregiverUid) {
  requireFirebase();
  const snap = await getDocs(
    query(
      collection(firestore, 'caregiverRequests'),
      where('caregiverUid', '==', caregiverUid),
      where('status', '==', 'approved'),
    ),
  );
  return snap.docs.map((d) => ({ requestId: d.id, ...d.data() }));
}

/**
 * Get all requests sent by this caregiver (all statuses).
 */
export async function getAllRequestsByCaregiver(caregiverUid) {
  requireFirebase();
  const snap = await getDocs(
    query(
      collection(firestore, 'caregiverRequests'),
      where('caregiverUid', '==', caregiverUid),
      orderBy('createdAt', 'desc'),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function getCaregiverErrorMessage(error) {
  if (error?.message === 'already_pending') return 'A pending request already exists for this child.';
  switch (error?.code) {
    case 'auth/email-already-in-use': return 'An account already uses this email. Try signing in.';
    case 'auth/invalid-email':        return 'Enter a valid email address.';
    case 'auth/weak-password':        return 'Choose a stronger password (8+ characters).';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':       return 'The email or password is incorrect.';
    case 'auth/too-many-requests':    return 'Too many attempts. Wait a moment and try again.';
    case 'permission-denied':         return 'Firebase denied access. Check Firestore rules.';
    default:                          return error?.message || 'Something went wrong. Please try again.';
  }
}
