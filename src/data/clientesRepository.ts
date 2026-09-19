import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { clientesRef } from './collections';
import type { Cliente } from '../domain/types';
import { uidAtual } from './uidAtual';

export interface DadosCliente {
  nome: string;
  telefone?: string;
  observacoes?: string;
}

/** Ordena por nome no cliente (evita exigir índice composto no Firestore). */
export function listarClientes(onChange: (clientes: Cliente[]) => void): Unsubscribe {
  const q = query(clientesRef(), where('donoId', '==', uidAtual()));
  return onSnapshot(q, (snap) => {
    const clientes = snap.docs.map((d) => d.data());
    clientes.sort((a, b) => a.nome.localeCompare(b.nome));
    onChange(clientes);
  });
}

export async function criarCliente(dados: DadosCliente): Promise<string> {
  const ref = await addDoc(collection(db, 'clientes'), {
    nome: dados.nome,
    telefone: dados.telefone ?? null,
    observacoes: dados.observacoes ?? null,
    criadoEm: Timestamp.fromDate(new Date()),
    donoId: uidAtual(),
  });
  return ref.id;
}

export async function atualizarCliente(id: string, dados: Partial<DadosCliente>): Promise<void> {
  const campos: Record<string, unknown> = {};
  if (dados.nome !== undefined) campos.nome = dados.nome;
  if (dados.telefone !== undefined) campos.telefone = dados.telefone;
  if (dados.observacoes !== undefined) campos.observacoes = dados.observacoes;
  await updateDoc(doc(db, 'clientes', id), campos);
}
