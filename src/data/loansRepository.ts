import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { loansRef, installmentsRef } from './collections';
import type { Loan, Installment } from '../domain/types';
import { currentUid } from './currentUid';

export interface NewLoanData {
  clientId: string;
  principal: number;
  interestRate: number;
  /** Principal + Interest — calculated in the domain layer (see src/domain), not here. */
  totalAmount: number;
  /** Installments already calculated (see src/domain) — this module only persists. */
  installments: Array<{ number: number; amount: number; dueDate: Date }>;
}

export function watchLoan(
  loanId: string,
  onChange: (loan: Loan | null) => void
): Unsubscribe {
  return onSnapshot(doc(loansRef(), loanId), (snap) => {
    onChange(snap.exists() ? snap.data() : null);
  });
}

export function listLoansByClient(
  clientId: string,
  onChange: (loans: Loan[]) => void
): Unsubscribe {
  const q = query(
    loansRef(),
    where('ownerId', '==', currentUid()),
    where('clientId', '==', clientId)
  );
  return onSnapshot(q, (snap) => {
    const loans = snap.docs.map((d) => d.data());
    loans.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    onChange(loans);
  });
}

export async function createLoan(data: NewLoanData): Promise<string> {
  const uid = currentUid();
  const batch = writeBatch(db);

  const loanDocRef = doc(collection(db, 'loans'));
  batch.set(loanDocRef, {
    clientId: data.clientId,
    principal: data.principal,
    interestRate: data.interestRate,
    totalAmount: data.totalAmount,
    createdAt: Timestamp.fromDate(new Date()),
    ownerId: uid,
  });

  for (const installment of data.installments) {
    const installmentDocRef = doc(collection(db, 'loans', loanDocRef.id, 'installments'));
    batch.set(installmentDocRef, {
      loanId: loanDocRef.id,
      number: installment.number,
      amount: installment.amount,
      dueDate: Timestamp.fromDate(installment.dueDate),
      paid: false,
      paidAt: null,
      ownerId: uid,
    });
  }

  await batch.commit();
  return loanDocRef.id;
}

/**
 * Updates an existing Loan. Reconciles Installments by number: an installment whose
 * number is still present is updated in place (preserving "paid"/paidAt);
 * numbers that disappear are removed, and new numbers are created as unpaid.
 */
export async function updateLoan(loanId: string, data: NewLoanData): Promise<void> {
  const uid = currentUid();
  const batch = writeBatch(db);

  const loanDocRef = doc(db, 'loans', loanId);
  batch.update(loanDocRef, {
    clientId: data.clientId,
    principal: data.principal,
    interestRate: data.interestRate,
    totalAmount: data.totalAmount,
  });

  const existingInstallmentsSnap = await getDocs(collection(db, 'loans', loanId, 'installments'));
  const existingInstallmentsByNumber = new Map(
    existingInstallmentsSnap.docs.map((d) => [d.data().number as number, d])
  );
  const newNumbers = new Set(data.installments.map((i) => i.number));

  for (const installment of data.installments) {
    const existing = existingInstallmentsByNumber.get(installment.number);
    if (existing) {
      batch.update(existing.ref, {
        loanId,
        amount: installment.amount,
        dueDate: Timestamp.fromDate(installment.dueDate),
      });
    } else {
      const installmentDocRef = doc(collection(db, 'loans', loanId, 'installments'));
      batch.set(installmentDocRef, {
        loanId,
        number: installment.number,
        amount: installment.amount,
        dueDate: Timestamp.fromDate(installment.dueDate),
        paid: false,
        paidAt: null,
        ownerId: uid,
      });
    }
  }

  for (const [number, installmentDoc] of existingInstallmentsByNumber) {
    if (!newNumbers.has(number)) {
      batch.delete(installmentDoc.ref);
    }
  }

  await batch.commit();
}

export function listInstallments(
  loanId: string,
  onChange: (installments: Installment[]) => void
): Unsubscribe {
  return onSnapshot(installmentsRef(loanId), (snap) => {
    // loanId is set on the document by createLoan/updateLoan, but installments written
    // before that field existed still need it: the parent path is authoritative here.
    const installments = snap.docs.map((d) => ({ ...d.data(), loanId }));
    installments.sort((a, b) => a.number - b.number);
    onChange(installments);
  });
}

export async function markInstallmentPaid(loanId: string, installmentId: string): Promise<void> {
  await updateDoc(doc(db, 'loans', loanId, 'installments', installmentId), {
    paid: true,
    paidAt: Timestamp.fromDate(new Date()),
  });
}

/**
 * Deletes a Loan and all of its Installments, paid or not. Available capital is
 * derived from the Loans/Installments that still exist (see domain/capital.ts:
 * Principal is subtracted, paid Installments added back), so removing them here
 * is what returns the borrowed Principal, net of anything already paid back —
 * no separate ledger entry needed.
 */
export async function deleteLoan(loanId: string): Promise<void> {
  const batch = writeBatch(db);

  const installmentsSnap = await getDocs(collection(db, 'loans', loanId, 'installments'));
  for (const installmentDoc of installmentsSnap.docs) {
    batch.delete(installmentDoc.ref);
  }

  batch.delete(doc(db, 'loans', loanId));

  await batch.commit();
}
