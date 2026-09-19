import { addDoc, collection, onSnapshot, query, Timestamp, where, type Unsubscribe } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { aportesRef } from './collections';
import type { Aporte } from '../domain/types';
import { uidAtual } from './uidAtual';

export interface DadosAporte {
  valor: number;
  data?: Date;
  observacao?: string;
}

export function listarAportes(onChange: (aportes: Aporte[]) => void): Unsubscribe {
  const q = query(aportesRef(), where('donoId', '==', uidAtual()));
  return onSnapshot(q, (snap) => {
    const aportes = snap.docs.map((d) => d.data());
    aportes.sort((a, b) => b.data.getTime() - a.data.getTime());
    onChange(aportes);
  });
}

export async function criarAporte(dados: DadosAporte): Promise<string> {
  const ref = await addDoc(collection(db, 'aportes'), {
    valor: dados.valor,
    data: Timestamp.fromDate(dados.data ?? new Date()),
    observacao: dados.observacao ?? null,
    donoId: uidAtual(),
  });
  return ref.id;
}
