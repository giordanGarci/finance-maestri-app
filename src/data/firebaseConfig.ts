/**
 * Inicialização do Firebase (Firestore + Auth) a partir de variáveis de ambiente.
 * As chaves reais NÃO ficam neste repositório: veja docs/agents/firebase-setup.md
 * para o passo a passo de criar o projeto no console do Firebase e preencher o .env.
 */
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, type Auth } from 'firebase/auth';
// `getReactNativePersistence` existe em runtime (vem do build React Native de
// @firebase/auth, que o Metro resolve corretamente a partir de "firebase/auth"),
// mas falta nos typings publicados desta versão do SDK — daí o @ts-expect-error.
// @ts-expect-error - ver comentário acima (bug de typings conhecido do firebase-js-sdk)
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
      `Firebase não configurado: faltam ${missing.join(', ')} no .env. ` +
        'Siga docs/agents/firebase-setup.md para criar o projeto e preencher as chaves.'
    );
  }
}

assertConfigured(firebaseConfig);

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);

// `initializeAuth` só pode ser chamado uma vez por app (senão lança
// "auth/already-initialized"). No Metro com Fast Refresh este módulo pode
// reavaliar sem o app reiniciar, daí o fallback para `getAuth` no catch.
let authInstance: Auth;
try {
  authInstance = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  authInstance = getAuth(firebaseApp);
}
export const auth = authInstance;
