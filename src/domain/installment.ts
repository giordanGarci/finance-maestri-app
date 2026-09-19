/**
 * Installment status. See CONTEXT.md ("Installment status"): derived by
 * comparing the due date with today, combined with the manual `paid` flag.
 * Never persisted.
 */
import type { Installment, InstallmentStatus } from './types';

export function installmentStatus(
  installment: Pick<Installment, 'paid' | 'dueDate'>,
  today: Date
): InstallmentStatus {
  if (installment.paid) {
    return 'on-time';
  }
  return installment.dueDate < today ? 'overdue' : 'on-time';
}
