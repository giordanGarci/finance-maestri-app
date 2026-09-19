/**
 * Modelagem das coleções do Firestore, espelhando os termos de CONTEXT.md.
 *
 * clientes/{clienteId}
 * emprestimos/{emprestimoId}
 *   emprestimos/{emprestimoId}/parcelas/{parcelaId}   <- subcoleção
 * aportes/{aporteId}
 * config/preferenciaAviso                              <- documento único
 *
 * Cada documento de clientes/emprestimos/parcelas/aportes tem um campo `donoId`
 * (uid do Firebase Auth) usado pelas regras de segurança, já que o app é de
 * usuário único mas os dados continuam associados a uma conta. Ver
 * docs/agents/firebase-setup.md para as regras sugeridas.
 */
import {
  collection,
  doc,
  type CollectionReference,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { Aporte, Cliente, Emprestimo, Parcela, PreferenciaAviso } from '../domain/types';

function converter<TDomain extends { id: string }>(
  toFirestoreFields: (value: Omit<TDomain, 'id'>) => DocumentData,
  fromFirestoreFields: (data: DocumentData, id: string) => TDomain
): FirestoreDataConverter<TDomain> {
  return {
    toFirestore(value: TDomain): DocumentData {
      const { id, ...rest } = value;
      return toFirestoreFields(rest as Omit<TDomain, 'id'>);
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): TDomain {
      return fromFirestoreFields(snapshot.data(), snapshot.id);
    },
  };
}

export const clienteConverter = converter<Cliente>(
  (c) => ({
    nome: c.nome,
    telefone: c.telefone ?? null,
    observacoes: c.observacoes ?? null,
    criadoEm: Timestamp.fromDate(c.criadoEm),
  }),
  (data, id) => ({
    id,
    nome: data.nome,
    telefone: data.telefone ?? undefined,
    observacoes: data.observacoes ?? undefined,
    criadoEm: (data.criadoEm as Timestamp).toDate(),
  })
);

export const emprestimoConverter = converter<Emprestimo>(
  (e) => ({
    clienteId: e.clienteId,
    principal: e.principal,
    taxaJuros: e.taxaJuros,
    valorTotal: e.valorTotal,
    criadoEm: Timestamp.fromDate(e.criadoEm),
  }),
  (data, id) => ({
    id,
    clienteId: data.clienteId,
    principal: data.principal,
    taxaJuros: data.taxaJuros,
    valorTotal: data.valorTotal,
    criadoEm: (data.criadoEm as Timestamp).toDate(),
  })
);

export const parcelaConverter = converter<Parcela>(
  (p) => ({
    emprestimoId: p.emprestimoId,
    numero: p.numero,
    valor: p.valor,
    dataVencimento: Timestamp.fromDate(p.dataVencimento),
    paga: p.paga,
    dataPagamento: p.dataPagamento ? Timestamp.fromDate(p.dataPagamento) : null,
  }),
  (data, id) => ({
    id,
    emprestimoId: data.emprestimoId,
    numero: data.numero,
    valor: data.valor,
    dataVencimento: (data.dataVencimento as Timestamp).toDate(),
    paga: data.paga,
    dataPagamento: data.dataPagamento ? (data.dataPagamento as Timestamp).toDate() : undefined,
  })
);

export const aporteConverter = converter<Aporte>(
  (a) => ({
    valor: a.valor,
    data: Timestamp.fromDate(a.data),
    observacao: a.observacao ?? null,
  }),
  (data, id) => ({
    id,
    valor: data.valor,
    data: (data.data as Timestamp).toDate(),
    observacao: data.observacao ?? undefined,
  })
);

export function clientesRef(): CollectionReference<Cliente> {
  return collection(db, 'clientes').withConverter(clienteConverter);
}

export function emprestimosRef(): CollectionReference<Emprestimo> {
  return collection(db, 'emprestimos').withConverter(emprestimoConverter);
}

export function parcelasRef(emprestimoId: string): CollectionReference<Parcela> {
  return collection(db, 'emprestimos', emprestimoId, 'parcelas').withConverter(parcelaConverter);
}

export function aportesRef(): CollectionReference<Aporte> {
  return collection(db, 'aportes').withConverter(aporteConverter);
}

/** Documento único: config/preferenciaAviso. */
export function preferenciaAvisoDoc() {
  return doc(db, 'config', 'preferenciaAviso');
}

export function toPreferenciaAviso(data: DocumentData | undefined): PreferenciaAviso {
  return {
    diasAntes: data?.diasAntes ?? 3,
    ativado: data?.ativado ?? true,
  };
}
