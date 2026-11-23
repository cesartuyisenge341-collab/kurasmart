# KuraSmart Development Order

The application is being rebuilt as React Native with Expo and the existing Firebase project. The existing Firebase data and backend resources are retained.

## Phase 1 — Expo setup and Firebase connection

- [x] Create the Expo React Native app in `mobile/`.
- [x] Add Firebase JavaScript SDK and Expo-compatible AsyncStorage.
- [x] Configure Firebase Auth, Firestore, Realtime Database, and Storage from the existing project.
- [x] Preserve reusable assets and non-mobile backend resources.
- [x] Remove Flutter app source and generated build output.
- [ ] Verify on the selected Expo device.

## Phase 2 — Firebase data model and access rules

- [x] Extend the local Firestore schema for child progress, learning, safety, and AI event metadata.
- [x] Add the Firestore composite-index configuration referenced by Firebase CLI.
- [x] Restrict user profile writes and child data access in Firestore rules.
- [x] Add Firestore emulator rule tests.
- [x] Install test dependencies and run the Firestore emulator tests (reported passed).
- [ ] Re-run the Firestore suite after the latest legacy `parentUid` query assertion.
- [ ] Review the diff and explicitly approve before deploying any rules.

## Phase 3 — UI foundation and navigation

- Set up reusable components, branding, responsive layouts, and accessible navigation.
- Build welcome, registration, login, and parent dashboard screens.

## Phase 4 — Firebase security and authentication

- Review and test existing Firebase Security Rules before accessing child data.
- Align the mobile data model and ownership fields with the existing Firestore collections.
- Implement registration, login, session restore, password reset, and sign out.

## Phase 5 — Child profiles and development

- [x] Add and list parent-owned child profiles in Firestore.
- [x] Validate birth dates and calculate age for children 0–5, including legacy Timestamp dates.
- [ ] Run child age tests.
- [ ] Verify create/list on an Expo device after the reviewed Firestore rules are deployed.
- Add milestones and parent observations.

## Phase 6 — Learning

- Implement age-appropriate lessons, schedules, learning sessions, and progress history.

## Phase 7 — Monitoring and safety

- Integrate verified device readings, safe zones, caregiver contacts, and notifications.
- Clearly mark simulated data; never display it as a real wearable reading.

## Phase 8 — Admin dashboard and IoT

- Plan the React admin dashboard and ESP32 hardware/firmware integration.
- Select suitable temperature, GPS, microphone, and speaker components.
- Keep server credentials in trusted server environments, never in the mobile app.

## Phase 9 — AI prototypes and validation

- Prototype supported sound-event detection and learning response assessment.
- Use confidence-aware feedback; do not make medical or intelligence claims.

## Phase 10 — Integration, testing, and documentation

- Test authorization, privacy, reliability, accessibility, and device integration.
- Document any Firebase rules or schema changes before deployment.
