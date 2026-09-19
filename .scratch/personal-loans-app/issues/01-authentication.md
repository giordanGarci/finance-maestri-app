# Authentication (Firebase Auth)

> Original title was "Google authentication" — changed to email/password
> along the way, see `docs/adr/0006-email-password-login.md` and the Comments.

Status: resolved
Depends on: nothing (but needs `.env` filled in — see `docs/agents/firebase-setup.md`)

## Context

ADR-0001 sets Firebase Auth for login. The app is single-user, but still
needs an authenticated account because Firestore's security rules (see
`docs/agents/firebase-setup.md`, step 3) require
`request.auth != null`, and `clients`/`loans`/`contributions` documents
store an `ownerId` field with the logged-in user's uid.

`src/data/firebaseConfig.ts` already exports `auth` (Firebase Auth instance).
The login flow itself is still missing.

## Scope

- Login screen (`src/screens/auth/LoginScreen.tsx`) with email/password (see
  Comments — switched from Google Sign-In to avoid requiring a development
  build just to authenticate).
- A hook (`useAuthUser`) exposing the current user, for the
  `clients`/`loans`/`contributions` screens to use the uid as `ownerId` when
  creating documents.
- App root screen (`App.tsx`) decides between the login screen and the main
  navigation based on `auth.currentUser` / `onAuthStateChanged`.

## Out of scope

- Other login providers (Google, etc. — dropped, see
  `docs/adr/0006-email-password-login.md`).
- Password recovery / multiple users (the app is single-user; if the
  password is forgotten, it can be reset directly in the Firebase console).

## Acceptance criteria

- With `.env` filled in, it's possible to create an account with
  email/password and log in with it afterward, and the app navigates to the
  main screen.
- Closing and reopening the app keeps the session (no need to log in again).
- There's a way to sign out (even if it's just a button on a simple
  settings screen).
- Works in Expo Go, without requiring a development build.

## Comments

**First version (Google Sign-In):** implemented with
`expo-auth-session/providers/google` + `webClientId`, assuming Expo's
authentication proxy (`auth.expo.io`) would cover Expo Go/Android. That
assumption was wrong: the user tested on Android via Expo Go and hit a fatal
error (`androidClientId must be defined...`) — the proxy was removed in Expo
SDK 48, and Google OAuth clients of type "Web" don't accept the `exp://`
redirect from Expo Go or a custom scheme either (a Google redirect_uri
validation issue, not a Firebase bug). The viable alternative was
`@react-native-google-signin/google-signin` with a real Android client ID
(package name + SHA-1) and a development build — which would force a dev
build just for login, not only for notifications.

**Final decision:** the user chose to switch to email/password login instead
of resolving native Google Sign-In, already recorded in
`docs/adr/0006-email-password-login.md`. Current implementation:
`src/data/auth.ts` (`useAuthUser`, `createAccount`, `signInWithEmailPassword`,
`signOutUser`, using `createUserWithEmailAndPassword`/
`signInWithEmailAndPassword` from `firebase/auth`) and
`src/screens/auth/LoginScreen.tsx` (email/password fields with a "sign in" /
"create account" toggle). `@react-native-google-signin/google-signin`,
`expo-auth-session`, and `expo-web-browser` were removed; `app.json` no
longer has any auth-related plugin/scheme.

Extra bug fixed along the way: `firebaseConfig.ts` used
`getAuth(app)`, which by default uses in-memory persistence in React Native
(login didn't survive reopening the app) — switched to
`initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })`
with a fallback to `getAuth` in the catch (Fast Refresh re-evaluates the
module without restarting the app, and `initializeAuth` can only run once).
Needed a `// @ts-expect-error` on an isolated import: `getReactNativePersistence`
exists at runtime (confirmed empirically by bundling a probe with Metro:
`firebase/auth` re-exports `@firebase/auth`, whose React Native build has the
function) but is missing from this firebase-js-sdk version's published
typings (a known SDK bug, not ours).

Email/password login works normally in Expo Go — doesn't require a
development build. Still untested against a real Firebase project (no
credentials in this environment); validated with `npx tsc --noEmit` and
`npm test`.
