import { useEffect, useState } from 'react';
import { calculateAvailableCapital } from '../../domain/capital';
import type { Contribution, Client, Loan, Installment } from '../../domain/types';
import { listContributions } from '../../data/contributionsRepository';
import { listClients } from '../../data/clientsRepository';
import { listLoansByClient, listInstallments } from '../../data/loansRepository';

/**
 * There's no global read for Loans/Installments in the repository (only by
 * Client/by Loan), so we aggregate here: all Clients -> their Loans -> each
 * Loan's Installments. Acceptable for a single user's data volume (same
 * reasoning as not paginating, see ticket 02).
 */
export function useAvailableCapital(): number | null {
  const [contributions, setContributions] = useState<Contribution[] | null>(null);
  const [clients, setClients] = useState<Client[] | null>(null);
  const [loansByClient, setLoansByClient] = useState<Record<string, Loan[]>>({});
  const [installmentsByLoan, setInstallmentsByLoan] = useState<Record<string, Installment[]>>({});

  useEffect(() => listContributions(setContributions), []);
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

  if (contributions === null || loans === null) return null;
  const installments = loans.flatMap((l) => installmentsByLoan[l.id] ?? []);

  return calculateAvailableCapital(contributions, loans, installments);
}
