/**
 * Domain types. See CONTEXT.md at the repo root for the full glossary.
 * These types know nothing about Firestore: the Timestamp <-> Date conversion lives in src/data.
 */

export interface Client {
  id: string;
  name: string;
  phone?: string;
  notes?: string;
  createdAt: Date;
}

export interface Loan {
  id: string;
  clientId: string;
  /** Amount lent, without Interest. */
  principal: number;
  /** Rate on top of the Principal, fixed at creation (e.g. 0.10 = 10%). Not recalculated for late payments (ADR-0003). */
  interestRate: number;
  /** Principal + Interest, calculated once at creation. */
  totalAmount: number;
  createdAt: Date;
}

export interface Installment {
  id: string;
  loanId: string;
  /** Display order within the Loan, starting at 1. */
  number: number;
  amount: number;
  dueDate: Date;
  paid: boolean;
  paidAt?: Date;
}

/** "on-time" / "overdue" — derived, never persisted. See InstallmentStatus in src/domain/installment.ts. */
export type InstallmentStatus = 'on-time' | 'overdue';

export interface Contribution {
  id: string;
  amount: number;
  date: Date;
  note?: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  date: Date;
  note?: string;
}

export interface NotificationPreference {
  /** How many days before an Installment's due date the user wants to be notified. */
  daysBefore: number;
  enabled: boolean;
}
