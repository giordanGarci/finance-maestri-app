/**
 * Available capital. See CONTEXT.md ("Available capital"): derived,
 * never edited manually by the user.
 */
import type { Contribution, Loan, Installment, Withdrawal } from './types';

export function calculateAvailableCapital(
  contributions: Contribution[],
  withdrawals: Withdrawal[],
  loans: Loan[],
  installments: Installment[]
): number {
  const totalContributions = contributions.reduce((sum, contribution) => sum + contribution.amount, 0);
  const totalWithdrawals = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

  // The Principal of every existing Loan is subtracted, even after it's fully paid off
  // (there is no cancellation concept in the MVP): it represents the cash outflow that
  // already happened at creation. Paid Installments are the cash inflow that returns that
  // Principal, plus Interest. If the Principal stopped being subtracted once the Loan is
  // paid off, the Interest received would be counted twice.
  const totalPrincipals = loans.reduce((sum, loan) => sum + loan.principal, 0);

  const totalPaidInstallments = installments
    .filter((installment) => installment.paid)
    .reduce((sum, installment) => sum + installment.amount, 0);

  return totalContributions - totalWithdrawals - totalPrincipals + totalPaidInstallments;
}
