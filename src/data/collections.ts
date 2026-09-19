/**
 * Firestore collection modeling, mirroring the terms in CONTEXT.md.
 *
 * clients/{clientId}
 * loans/{loanId}
 *   loans/{loanId}/installments/{installmentId}   <- subcollection
 * contributions/{contributionId}
 * config/notificationPreference                    <- single document
 *
 * Every document in clients/loans/installments/contributions has an `ownerId`
 * field (Firebase Auth uid) used by the security rules, since the app is
 * single-user but the data is still tied to an account. See
 * docs/agents/firebase-setup.md for the suggested rules.
 */
import {
  collection,
  doc,
  type CollectionReference,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { Contribution, Client, Loan, Installment, NotificationPreference } from '../domain/types';

function converter<TDomain extends { id: string }>(
  toFirestoreFields: (value: Omit<TDomain, 'id'>) => DocumentData,
  fromFirestoreFields: (data: DocumentData, id: string) => TDomain
): FirestoreDataConverter<TDomain> {
  return {
    toFirestore(value: TDomain): DocumentData {
      const { id, ...rest } = value;
      return toFirestoreFields(rest as Omit<TDomain, 'id'>);
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): TDomain {
      return fromFirestoreFields(snapshot.data(), snapshot.id);
    },
  };
}

export const clientConverter = converter<Client>(
  (c) => ({
    name: c.name,
    phone: c.phone ?? null,
    notes: c.notes ?? null,
    createdAt: Timestamp.fromDate(c.createdAt),
  }),
  (data, id) => ({
    id,
    name: data.name,
    phone: data.phone ?? undefined,
    notes: data.notes ?? undefined,
    createdAt: (data.createdAt as Timestamp).toDate(),
  })
);

export const loanConverter = converter<Loan>(
  (e) => ({
    clientId: e.clientId,
    principal: e.principal,
    interestRate: e.interestRate,
    totalAmount: e.totalAmount,
    createdAt: Timestamp.fromDate(e.createdAt),
  }),
  (data, id) => ({
    id,
    clientId: data.clientId,
    principal: data.principal,
    interestRate: data.interestRate,
    totalAmount: data.totalAmount,
    createdAt: (data.createdAt as Timestamp).toDate(),
  })
);

export const installmentConverter = converter<Installment>(
  (p) => ({
    loanId: p.loanId,
    number: p.number,
    amount: p.amount,
    dueDate: Timestamp.fromDate(p.dueDate),
    paid: p.paid,
    paidAt: p.paidAt ? Timestamp.fromDate(p.paidAt) : null,
  }),
  (data, id) => ({
    id,
    loanId: data.loanId,
    number: data.number,
    amount: data.amount,
    dueDate: (data.dueDate as Timestamp).toDate(),
    paid: data.paid,
    paidAt: data.paidAt ? (data.paidAt as Timestamp).toDate() : undefined,
  })
);

export const contributionConverter = converter<Contribution>(
  (a) => ({
    amount: a.amount,
    date: Timestamp.fromDate(a.date),
    note: a.note ?? null,
  }),
  (data, id) => ({
    id,
    amount: data.amount,
    date: (data.date as Timestamp).toDate(),
    note: data.note ?? undefined,
  })
);

export function clientsRef(): CollectionReference<Client> {
  return collection(db, 'clients').withConverter(clientConverter);
}

export function loansRef(): CollectionReference<Loan> {
  return collection(db, 'loans').withConverter(loanConverter);
}

export function installmentsRef(loanId: string): CollectionReference<Installment> {
  return collection(db, 'loans', loanId, 'installments').withConverter(installmentConverter);
}

export function contributionsRef(): CollectionReference<Contribution> {
  return collection(db, 'contributions').withConverter(contributionConverter);
}

/** Single document: config/notificationPreference. */
export function notificationPreferenceDoc() {
  return doc(db, 'config', 'notificationPreference');
}

export function toNotificationPreference(data: DocumentData | undefined): NotificationPreference {
  return {
    daysBefore: data?.daysBefore ?? 3,
    enabled: data?.enabled ?? true,
  };
}
