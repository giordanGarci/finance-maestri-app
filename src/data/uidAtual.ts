import { auth } from './firebaseConfig';

/** Uid do usuário logado, usado para preencher `donoId` nas escritas e nos filtros de leitura. */
export function uidAtual(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('Nenhum usuário autenticado.');
  }
  return uid;
}
