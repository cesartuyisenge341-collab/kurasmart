# KuraSmart

KuraSmart is a parent-focused child development, learning, and safety project for children aged 0–5.

## Current app

The mobile app is built with React Native and Expo in [`mobile/`](./mobile/). It uses the existing Firebase project (`kurasmart-91b10`) for Firebase Authentication, Cloud Firestore, Realtime Database, and Storage. Existing Firebase data and backend rules have not been replaced or cleared.

The original Flutter app source and Flutter-generated build files were removed. The existing Firebase Cloud Functions, rules, PHP API, SQL database files, and reusable assets were retained because they are backend/project resources, not the Flutter mobile app.

## Run the Expo app

Requirements: Node.js and npm.

From the project root:

```powershell
cd C:\xampp2\htdocs\kurasmart
npm start
```

The root scripts forward to the Expo project in `mobile/`. If its dependencies
are not installed yet, run `npm install` once from `mobile/`.

Then open the project in Expo Go or use the Expo development build for the selected device. `npm run android`, `npm run ios`, and `npm run web` are also available.

The Firebase client configuration is read from `mobile/.env`. A local configuration for the existing Firebase project is included and ignored by Git. For another checkout, copy `mobile/.env.example` to `mobile/.env` and fill it with the Firebase **client** configuration. Never put `service-account-key.json`, a service-account private key, or any Admin SDK credential in the mobile app.

## Project layout

```text
mobile/                 Expo React Native parent app
backend/firestore/      Firestore rules and indexes
backend/realtime-db/    Realtime Database rules
backend/storage/        Storage rules
backend/functions/      Existing Firebase Cloud Functions
api/                    Existing PHP API
database/               Existing SQL database files
assets/                 Reusable images, icons, fonts, and data
```

Firebase initialization is in `mobile/src/config/firebase.js`; platform-aware Auth initialization is in `mobile/src/config/auth*.js`. Parent sign-up, sign-in, and password reset use Firebase Authentication. Registration creates the matching `users/{uid}` Firestore profile.

The parent home screen lists profiles owned through either the current `userId` field or the legacy `parentUid` field. New profiles are stored in Firestore with an ISO `YYYY-MM-DD` birth date. Age validation allows children under 6 and existing Firestore Timestamp birth dates remain readable.

Run the focused age validation tests with `npm run test:child-age` from the project root.

## Firestore schema and rules (local review)

The Firestore collection design is documented in `backend/firestore/collections-schema.json`, indexes are in `backend/firestore/firestore-indexes.json`, and access policies are in `backend/firestore/firestore.rules`. The updated rules keep existing `userId` and legacy `parentUid` child ownership readable, restrict profiles to their owner, prevent client-written admin roles, and reserve device readings for device tokens provisioned by a trusted server.

Admin and device permissions rely on Firebase Auth custom claims created by trusted server code, never values written into a user profile. Device reading rules expect claims containing `role: "device"`, the provisioned `deviceId`, and the assigned `childIds` list.

These are local project files only; no rules have been deployed and no Firebase data has been changed. To run the Firestore emulator rule tests, install the test tools once and run:

```powershell
cd C:\xampp2\htdocs\kurasmart\backend\firestore
npm install
npm test
```

The tests use the demo project ID `demo-kurasmart` and the Firestore emulator; they do not connect to or modify the live Firebase project. Java must be available for the emulator. Review the rule diff and test results before deploying. Realtime Database and Storage rules are separate and have not been changed in this Firestore update.

## Important security note

The Firebase client config is not an Admin credential. Access control must be enforced by Firebase Security Rules. Before using real child data, verify the existing Firestore, Realtime Database, and Storage rules against the app's collection paths and ownership fields. Do not rely on hiding client-side UI for privacy or authorization.
