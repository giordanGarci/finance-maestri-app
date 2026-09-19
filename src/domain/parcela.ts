/**
 * Status da Parcela. Ver CONTEXT.md (termo "Status da parcela"): derivado
 * comparando a data de vencimento com hoje, combinado com a marcação manual
 * `paga`. Nunca persistido.
 */
import type { Parcela, StatusParcela } from './types';

export function statusParcela(
  parcela: Pick<Parcela, 'paga' | 'dataVencimento'>,
  hoje: Date
): StatusParcela {
  if (parcela.paga) {
    return 'em-dia';
  }
  return parcela.dataVencimento < hoje ? 'atrasado' : 'em-dia';
}
