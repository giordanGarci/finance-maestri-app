/**
 * Repositório da coleção `config/preferenciaAviso` (ticket 08). Os demais
 * repositórios (clientes/empréstimos/aportes) são escopo do ticket 02.
 */
import { onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore';
import type { PreferenciaAviso } from '../domain/types';
import { preferenciaAvisoDoc, toPreferenciaAviso } from './collections';

export function obterPreferenciaAviso(
  aoMudar: (preferencia: PreferenciaAviso) => void
): Unsubscribe {
  return onSnapshot(preferenciaAvisoDoc(), (snapshot) => {
    aoMudar(toPreferenciaAviso(snapshot.data()));
  });
}

export async function salvarPreferenciaAviso(dados: PreferenciaAviso): Promise<void> {
  await setDoc(preferenciaAvisoDoc(), dados);
}
