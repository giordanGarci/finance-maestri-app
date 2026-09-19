/**
 * Login por e-mail/senha via Firebase Auth (ver docs/adr/0006-login-email-senha.md:
 * trocamos de Google Sign-In pra evitar exigir development build só pra autenticar).
 */
import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from './firebaseConfig';

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

export function criarConta(email: string, senha: string) {
  return createUserWithEmailAndPassword(auth, email, senha);
}

export function entrarComEmailSenha(email: string, senha: string) {
  return signInWithEmailAndPassword(auth, email, senha);
}

export function signOutUser() {
  return signOut(auth);
}
