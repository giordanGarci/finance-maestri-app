import { useEffect, useState } from 'react';
import type { Client, Loan, Installment } from '../../domain/types';
import { listClients } from '../../data/clientsRepository';
import { listLoansByClient, listInstallments } from '../../data/loansRepository';

export interface ClientLoansData {
  clients: Client[];
  loans: Loan[];
  installments: Installment[];
  clientById: Record<string, Client>;
}

/**
 * There's no global read for Loans/Installments in the repository (only by
 * Client/by Loan), so we aggregate here: all Clients -> their Loans -> each
 * Loan's Installments. Acceptable for a single user's data volume (same
 * reasoning as not paginating, see ticket 02). Shared by every screen/hook
 * that needs a cross-client view (available capital, upcoming payments).
 */
export function useClientLoansData(): ClientLoansData | null {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [loansByClient, setLoansByClient] = useState<Record<string, Loan[]>>({});
  const [installmentsByLoan, setInstallmentsByLoan] = useState<Record<string, Installment[]>>({});

  useEffect(() => listClients(setClients), []);

  useEffect(() => {
    if (!clients) return;
    const unsubs = clients.map((client) =>
      listLoansByClient(client.id, (loans) => {
        setLoansByClient((current) => ({ ...current, [client.id]: loans }));
      })
    );
    return () => unsubs.forEach((unsub) => unsub());
  }, [clients]);

  const loans = clients ? clients.flatMap((c) => loansByClient[c.id] ?? []) : null;
  const loansKey = loans ? loans.map((l) => l.id).join(',') : '';

  useEffect(() => {
    if (!loans) return;
    const unsubs = loans.map((loan) =>
      listInstallments(loan.id, (installments) => {
        setInstallmentsByLoan((current) => ({ ...current, [loan.id]: installments }));
      })
    );
    return () => unsubs.forEach((unsub) => unsub());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loansKey]);

  if (clients === null || loans === null) return null;
  const installments = loans.flatMap((l) => installmentsByLoan[l.id] ?? []);

  const clientById: Record<string, Client> = {};
  for (const client of clients) clientById[client.id] = client;

  return { clients, loans, installments, clientById };
}
