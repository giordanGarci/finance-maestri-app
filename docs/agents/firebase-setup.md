# Manual Firebase setup

The code is already set up to read the Firebase configuration from
environment variables (`src/data/firebaseConfig.ts`), but the keys for a real
project can only be created by you in the Firebase console. Follow the steps
below once; after that the app works normally.

## 1. Create the project in the Firebase console

1. Go to https://console.firebase.google.com/ and click "Add project".
2. Give it a name (e.g. "personal-loans") and finish creating it. You don't
   need to enable Google Analytics for this app.

## 2. Register the app and get the keys

1. On the project's home screen, click the "Web" icon (`</>`) to register a
   web app, even though this is an Expo/React Native app — the Firebase JS
   SDK used here (`firebase/app`, `firebase/firestore`, `firebase/auth`) is
   the web SDK, which works in Expo managed workflow.
2. Give the app a name (e.g. "maestri-app") and finish registering it. You
   don't need to set up Firebase Hosting.
3. The console shows a `firebaseConfig` object with `apiKey`, `authDomain`,
   `projectId`, `storageBucket`, `messagingSenderId`, `appId`. Copy each
   value into the `.env` file at the root of the repository (create it from
   `.env.example`), filling in the corresponding `EXPO_PUBLIC_FIREBASE_*`
   variables.

## 3. Enable Firestore

1. In the side menu, go to "Firestore Database" → "Create database".
2. Choose a region (any one close to you works; it can't be changed later
   without migrating the project).
3. Start in production mode. Once created, go to the "Rules" tab and paste
   the rules below, replacing `OWNER_UID` with your own Firebase Auth uid
   (you'll only have this uid after step 4; you can leave the default rules
   and come back here later):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       function isOwner() {
         return request.auth != null && request.auth.uid == resource.data.ownerId;
       }
       match /clients/{id} {
         allow read, update, delete: if isOwner();
         allow create: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
       }
       match /loans/{id} {
         allow read, update, delete: if isOwner();
         allow create: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
         match /installments/{installmentId} {
           allow read, write: if request.auth != null;
         }
       }
       match /contributions/{id} {
         allow read, update, delete: if isOwner();
         allow create: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
       }
       match /withdrawals/{id} {
         allow read, update, delete: if isOwner();
         allow create: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
       }
       match /config/{id} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

   Since the app is single-user, these rules are intentionally simple (any
   authenticated user of your project can read/write `config` and
   `installments`). Tighten the model later if the app ever grows to support
   more than one account.

## 4. Enable Firebase Auth with email/password

See `docs/adr/0006-email-password-login.md`: login is email/password, not
Google Sign-In — Google login would require a native library with a real
Android client ID, which would force a development build just to
authenticate (see the development build section further below).

1. In the side menu, go to "Authentication" → "Sign-in method".
2. Enable the "Email/password" provider (the first item in the list).
3. No further key is needed in `.env` for this — login only uses the
   `EXPO_PUBLIC_FIREBASE_*` variables from step 2.
4. After the first real sign-up/login in the app, copy your uid from
   "Authentication" → "Users" and use it to replace `OWNER_UID` in the rules
   from step 3, if you want to lock access down to a single uid instead of
   "any authenticated user".

## 5. Fill in the local `.env`

```
cp .env.example .env
```

Fill in the values from step 2. The `.env` file is in `.gitignore` and
should not be committed.

## Checking that it worked

Run `npm run start` (or `npm run android`/`npm run web`) and confirm the app
doesn't throw the "Firebase not configured" error defined in
`src/data/firebaseConfig.ts`. That error lists exactly which variables are
missing.

## Local notifications require a development build, not Expo Go (login doesn't)

Email/password login (`src/data/auth.ts`) works normally in Expo Go — only
local notifications require a development build, as described below.

Starting with SDK 53, Android removed notification support from Expo Go
(even purely local, on-device scheduled ones — see ADR-0002): the mere
`import` of `expo-notifications` already triggers internal push-related code
and crashes the whole app in Expo Go. That's why `src/notifications/` only
imports that module dynamically and becomes a no-op when it detects Expo Go
(`isExpoGo()` in `src/notifications/permissions.ts`) — the rest of the app
(clients, loans, available capital) keeps working normally, only the
due-date notification is disabled.

To actually test the notifications feature, run a development build instead
of Expo Go:

```
npx expo run:android   # or npx expo run:ios
```

or generate a development build via EAS (`eas build --profile
development`), which remains free — it just stops being Expo Go.
