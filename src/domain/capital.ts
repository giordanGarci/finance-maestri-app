/**
 * Capital disponível. Ver CONTEXT.md (termo "Capital disponível"): derivado,
 * nunca editado manualmente pelo usuário.
 */
import type { Aporte, Emprestimo, Parcela } from './types';

export function calcularCapitalDisponivel(
  aportes: Aporte[],
  emprestimos: Emprestimo[],
  parcelas: Parcela[]
): number {
  const totalAportes = aportes.reduce((soma, aporte) => soma + aporte.valor, 0);

  // O Principal de todo Empréstimo existente é subtraído, mesmo após a quitação
  // (não há conceito de cancelamento no MVP): ele representa a saída de caixa
  // que já aconteceu na criação. As Parcelas pagas são a entrada de caixa que
  // devolve esse Principal, com Juros. Parar de subtrair o Principal quando o
  // Empréstimo é quitado contaria o Juros recebido em dobro.
  const totalPrincipais = emprestimos.reduce((soma, emprestimo) => soma + emprestimo.principal, 0);

  const totalParcelasPagas = parcelas
    .filter((parcela) => parcela.paga)
    .reduce((soma, parcela) => soma + parcela.valor, 0);

  return totalAportes - totalPrincipais + totalParcelasPagas;
}
