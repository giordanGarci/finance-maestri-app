import { useEffect, useState } from 'react';
import { calculateAvailableCapital } from '../../domain/capital';
import type { Contribution, Withdrawal } from '../../domain/types';
import { listContributions } from '../../data/contributionsRepository';
import { listWithdrawals } from '../../data/withdrawalsRepository';
import { useClientLoansData } from './useClientLoansData';

export function useAvailableCapital(): number | null {
  const [contributions, setContributions] = useState<Contribution[] | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[] | null>(null);
  const data = useClientLoansData();

  useEffect(() => listContributions(setContributions), []);
  useEffect(() => listWithdrawals(setWithdrawals), []);

  if (contributions === null || withdrawals === null || data === null) return null;

  return calculateAvailableCapital(contributions, withdrawals, data.loans, data.installments);
}
