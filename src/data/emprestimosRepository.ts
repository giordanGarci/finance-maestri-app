import {
  collection,
  doc,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { emprestimosRef, parcelasRef } from './collections';
import type { Emprestimo, Parcela } from '../domain/types';
import { uidAtual } from './uidAtual';

export interface DadosNovoEmprestimo {
  clienteId: string;
  principal: number;
  taxaJuros: number;
  /** Principal + Juros — calculado no domínio (ver src/domain), não aqui. */
  valorTotal: number;
  /** Parcelas já calculadas (ver src/domain) — este módulo só persiste. */
  parcelas: Array<{ numero: number; valor: number; dataVencimento: Date }>;
}

export function listarEmprestimosPorCliente(
  clienteId: string,
  onChange: (emprestimos: Emprestimo[]) => void
): Unsubscribe {
  const q = query(
    emprestimosRef(),
    where('donoId', '==', uidAtual()),
    where('clienteId', '==', clienteId)
  );
  return onSnapshot(q, (snap) => {
    const emprestimos = snap.docs.map((d) => d.data());
    emprestimos.sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
    onChange(emprestimos);
  });
}

export async function criarEmprestimo(dados: DadosNovoEmprestimo): Promise<string> {
  const uid = uidAtual();
  const batch = writeBatch(db);

  const emprestimoDocRef = doc(collection(db, 'emprestimos'));
  batch.set(emprestimoDocRef, {
    clienteId: dados.clienteId,
    principal: dados.principal,
    taxaJuros: dados.taxaJuros,
    valorTotal: dados.valorTotal,
    criadoEm: Timestamp.fromDate(new Date()),
    donoId: uid,
  });

  for (const parcela of dados.parcelas) {
    const parcelaDocRef = doc(collection(db, 'emprestimos', emprestimoDocRef.id, 'parcelas'));
    batch.set(parcelaDocRef, {
      numero: parcela.numero,
      valor: parcela.valor,
      dataVencimento: Timestamp.fromDate(parcela.dataVencimento),
      paga: false,
      dataPagamento: null,
      donoId: uid,
    });
  }

  await batch.commit();
  return emprestimoDocRef.id;
}

export function listarParcelas(
  emprestimoId: string,
  onChange: (parcelas: Parcela[]) => void
): Unsubscribe {
  return onSnapshot(parcelasRef(emprestimoId), (snap) => {
    const parcelas = snap.docs.map((d) => d.data());
    parcelas.sort((a, b) => a.numero - b.numero);
    onChange(parcelas);
  });
}

export async function marcarParcelaPaga(emprestimoId: string, parcelaId: string): Promise<void> {
  await updateDoc(doc(db, 'emprestimos', emprestimoId, 'parcelas', parcelaId), {
    paga: true,
    dataPagamento: Timestamp.fromDate(new Date()),
  });
}
