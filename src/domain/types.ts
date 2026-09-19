/**
 * Tipos de domínio. Ver CONTEXT.md na raiz do repo para o glossário completo.
 * Estes tipos não conhecem Firestore: a conversão Timestamp <-> Date fica em src/data.
 */

export interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  observacoes?: string;
  criadoEm: Date;
}

export interface Emprestimo {
  id: string;
  clienteId: string;
  /** Valor emprestado, sem os Juros. */
  principal: number;
  /** Taxa sobre o Principal, fixada na criação (ex.: 0.10 = 10%). Não recalculada por atraso (ADR-0003). */
  taxaJuros: number;
  /** Principal + Juros, calculado uma única vez na criação. */
  valorTotal: number;
  criadoEm: Date;
}

export interface Parcela {
  id: string;
  emprestimoId: string;
  /** Ordem de exibição dentro do Empréstimo, a partir de 1. */
  numero: number;
  valor: number;
  dataVencimento: Date;
  paga: boolean;
  dataPagamento?: Date;
}

/** "em dia" / "atrasado" — derivado, nunca persistido. Ver StatusParcela em src/domain/parcela.ts (ticket futuro). */
export type StatusParcela = 'em-dia' | 'atrasado';

export interface Aporte {
  id: string;
  valor: number;
  data: Date;
  observacao?: string;
}

export interface PreferenciaAviso {
  /** Quantos dias antes do vencimento de uma Parcela o usuário quer ser notificado. */
  diasAntes: number;
  ativado: boolean;
}
