import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
  after,
  before,
  test,
} from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

const projectId = 'demo-kurasmart';
const rules = await readFile(
  fileURLToPath(new URL('../firestore.rules', import.meta.url)),
  'utf8',
);

let environment;

before(async () => {
  environment = await initializeTestEnvironment({
    projectId,
    firestore: { rules },
  });

  await environment.withSecurityRulesDisabled(async (context) => {
    const database = context.firestore();

    await setDoc(doc(database, 'users', 'parent-1'), {
      uid: 'parent-1',
      email: 'parent@example.test',
      fullName: 'Parent One',
    });
    await setDoc(doc(database, 'users', 'parent-2'), {
      uid: 'parent-2',
      email: 'other@example.test',
      fullName: 'Parent Two',
    });
    await setDoc(doc(database, 'children', 'child-1'), {
      userId: 'parent-1',
      name: 'Child One',
      dateOfBirth: '2024-01-01',
    });
    await setDoc(doc(database, 'children', 'legacy-child'), {
      parentUid: 'parent-1',
      name: 'Legacy Child',
      dateOfBirth: '2023-01-01',
    });
    await setDoc(
      doc(database, 'children', 'child-1', 'caregivers', 'caregiver-1'),
      {
        caregiverId: 'caregiver-1',
        role: 'caregiver',
      },
    );
    await setDoc(doc(database, 'temperatureReadings', 'reading-1'), {
      childId: 'child-1',
      deviceId: 'device-1',
      temperatureC: 36.5,
      recordedAt: Timestamp.now(),
    });
    await setDoc(doc(database, 'lessons', 'published-lesson'), {
      title: 'Published lesson',
      isPublished: true,
    });
    await setDoc(doc(database, 'lessons', 'draft-lesson'), {
      title: 'Draft lesson',
      isPublished: false,
    });
  });
});

after(async () => {
  await environment?.cleanup();
});

test('a parent can create only their own profile without role claims', async () => {
  const database = environment.authenticatedContext('parent-new', {
    email: 'new-parent@example.test',
  }).firestore();

  await assertSucceeds(setDoc(doc(database, 'users', 'parent-new'), {
    uid: 'parent-new',
    email: 'new-parent@example.test',
    fullName: 'New Parent',
    fcmTokens: [],
    settings: { theme: 'light' },
  }));
  await assertFails(setDoc(doc(database, 'users', 'parent-new'), {
    uid: 'parent-new',
    email: 'new-parent@example.test',
    fullName: 'New Parent',
    role: 'admin',
  }));
  await assertFails(updateDoc(doc(database, 'users', 'parent-new'), {
    role: 'admin',
  }));
});

test('child and temperature data are restricted to the child's family', async () => {
  const ownerDb = environment.authenticatedContext('parent-1').firestore();
  const otherDb = environment.authenticatedContext('parent-2').firestore();

  await assertSucceeds(getDoc(doc(ownerDb, 'children', 'child-1')));
  await assertSucceeds(getDoc(doc(ownerDb, 'children', 'legacy-child')));
  await assertFails(getDoc(doc(otherDb, 'children', 'child-1')));
  await assertSucceeds(
    getDoc(doc(ownerDb, 'temperatureReadings', 'reading-1')),
  );
  await assertFails(
    getDoc(doc(otherDb, 'temperatureReadings', 'reading-1')),
  );
  await assertSucceeds(getDocs(query(
    collection(ownerDb, 'children'),
    where('userId', '==', 'parent-1'),
  )));
  await assertSucceeds(getDocs(query(
    collection(ownerDb, 'children'),
    where('parentUid', '==', 'parent-1'),
  )));
  await assertFails(getDocs(collection(ownerDb, 'children')));
});

test('a caregiver can read only a child with an explicit caregiver grant', async () => {
  const caregiverDb = environment.authenticatedContext('caregiver-1').firestore();
  const unrelatedDb = environment.authenticatedContext('parent-2').firestore();

  await assertSucceeds(getDoc(doc(caregiverDb, 'children', 'child-1')));
  await assertSucceeds(
    getDoc(doc(caregiverDb, 'temperatureReadings', 'reading-1')),
  );
  await assertFails(getDoc(doc(unrelatedDb, 'children', 'legacy-child')));
});

test('parents cannot write device readings, while assigned device claims can', async () => {
  const parentDb = environment.authenticatedContext('parent-1').firestore();
  const deviceDb = environment.authenticatedContext('device-auth', {
    role: 'device',
    deviceId: 'device-1',
    childIds: ['child-1'],
  }).firestore();
  const unassignedDeviceDb = environment.authenticatedContext('device-auth-2', {
    role: 'device',
    deviceId: 'device-2',
    childIds: ['another-child'],
  }).firestore();

  const reading = {
    childId: 'child-1',
    deviceId: 'device-1',
    temperatureC: 36.7,
    recordedAt: Timestamp.now(),
  };

  await assertFails(setDoc(doc(parentDb, 'temperatureReadings', 'new-reading'), reading));
  await assertSucceeds(
    setDoc(doc(deviceDb, 'temperatureReadings', 'device-reading'), reading),
  );
  await assertFails(
    setDoc(doc(unassignedDeviceDb, 'temperatureReadings', 'wrong-child'), reading),
  );
});

test('published lessons are readable but drafts remain administrator-only', async () => {
  const parentDb = environment.authenticatedContext('parent-1').firestore();

  await assertSucceeds(
    getDoc(doc(parentDb, 'lessons', 'published-lesson')),
  );
  await assertFails(getDoc(doc(parentDb, 'lessons', 'draft-lesson')));

  const adminDb = environment.authenticatedContext('admin-1', {
    admin: true,
  }).firestore();
  await assertSucceeds(getDoc(doc(adminDb, 'lessons', 'draft-lesson')));
});

test('parent child creation requires the signed-in UID as owner', async () => {
  const ownerDb = environment.authenticatedContext('parent-1').firestore();
  const otherDb = environment.authenticatedContext('parent-2').firestore();
  const child = {
    userId: 'parent-1',
    name: 'New Child',
    dateOfBirth: '2025-03-01',
  };

  await assertSucceeds(setDoc(doc(ownerDb, 'children', 'new-child'), child));
  await assertFails(
    setDoc(doc(otherDb, 'children', 'spoofed-child'), child),
  );
});
