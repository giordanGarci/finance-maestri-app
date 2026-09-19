/**
 * Login com Google via Firebase Auth. Ver docs/agents/firebase-setup.md
 * (passo 4) para ativar o provedor Google no console e obter o client id.
 */
import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut, type User } from 'firebase/auth';
import { auth } from './firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

export function useAuthUser(): { user: User | null; carregando: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setCarregando(false);
    });
  }, []);

  return { user, carregando };
}

/**
 * `webClientId` funciona via o proxy de autenticação do Expo (Expo Go e
 * desenvolvimento). Um build standalone/dev client vai precisar também de
 * `androidClientId`/`iosClientId` próprios — fora de escopo deste MVP.
 */
export function useGoogleSignIn() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type !== 'success') return;
    const idToken = response.authentication?.idToken;
    if (!idToken) return;
    const credential = GoogleAuthProvider.credential(idToken);
    signInWithCredential(auth, credential).catch((erro) => {
      console.error('Falha ao autenticar com Firebase', erro);
    });
  }, [response]);

  return { podeEntrar: !!request, entrarComGoogle: () => promptAsync() };
}

export function signOutUser() {
  return signOut(auth);
}
