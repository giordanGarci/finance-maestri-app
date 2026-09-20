import type { Installment, Loan } from '../../domain/types';
import { useClientLoansData } from './useClientLoansData';

export interface UpcomingInstallment {
  installment: Installment;
  loan: Loan;
  clientName: string;
}

/** Every not-yet-paid Installment across all Clients, enriched with the Client name and its Loan. */
export function useUpcomingInstallments(): UpcomingInstallment[] | null {
  const data = useClientLoansData();
  if (!data) return null;

  const loanById = new Map(data.loans.map((loan) => [loan.id, loan]));

  const upcoming: UpcomingInstallment[] = [];
  for (const installment of data.installments) {
    if (installment.paid) continue;
    const loan = loanById.get(installment.loanId);
    if (!loan) continue;
    upcoming.push({ installment, loan, clientName: data.clientById[loan.clientId]?.name ?? '—' });
  }
  return upcoming;
}
