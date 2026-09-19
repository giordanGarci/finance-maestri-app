/**
 * Firebase (Firestore + Auth) initialization from environment variables.
 * Real keys do NOT live in this repository: see docs/agents/firebase-setup.md
 * for the steps to create the project in the Firebase console and fill in the .env.
 */
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, type Auth } from 'firebase/auth';
// `getReactNativePersistence` exists at runtime (it comes from the React Native
// build of @firebase/auth, which Metro resolves correctly from "firebase/auth"),
// but is missing from this SDK version's published typings — hence the @ts-expect-error.
// @ts-expect-error - see comment above (known typings bug in firebase-js-sdk)
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

function assertConfigured(config: FirebaseOptions): void {
  const missing = (['apiKey', 'authDomain', 'projectId', 'appId'] as const).filter(
    (key) => !config[key]
  );
  if (missing.length > 0) {
    throw new Error(
      `Firebase not configured: missing ${missing.join(', ')} in .env. ` +
        'Follow docs/agents/firebase-setup.md to create the project and fill in the keys.'
    );
  }
}

assertConfigured(firebaseConfig);

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);

// `initializeAuth` can only be called once per app (otherwise it throws
// "auth/already-initialized"). With Metro's Fast Refresh this module can
// re-evaluate without the app restarting, hence the `getAuth` fallback in the catch.
let authInstance: Auth;
try {
  authInstance = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  authInstance = getAuth(firebaseApp);
}
export const auth = authInstance;
