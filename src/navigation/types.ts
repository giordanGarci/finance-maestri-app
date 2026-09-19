import type { Cliente, Emprestimo } from '../domain/types';

export type RootStackParamList = {
  ClientesLista: undefined;
  ClienteForm: { cliente?: Cliente } | undefined;
  ClienteDetalhe: { cliente: Cliente };
  EmprestimoForm: { clienteId: string; emprestimo?: Emprestimo };
  EmprestimoDetalhe: { emprestimo: Emprestimo };
  Aportes: undefined;
  PreferenciaAviso: undefined;
};
