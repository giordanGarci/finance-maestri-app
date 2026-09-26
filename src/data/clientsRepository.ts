import {
  addDoc,
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
import { auth, db } from './firebaseConfig';
import { clientsRef, loansRef } from './collections';
import type { Client } from '../domain/types';
import { currentUid } from './currentUid';

export interface ClientData {
  name: string;
  phone?: string;
  notes?: string;
}

/** Sorts by client name (avoids requiring a composite index in Firestore). */
export function listClients(onChange: (clients: Client[]) => void): Unsubscribe {
  const q = query(clientsRef(), where('ownerId', '==', currentUid()));
  return onSnapshot(q, (snap) => {
    const clients = snap.docs.map((d) => d.data());
    clients.sort((a, b) => a.name.localeCompare(b.name));
    onChange(clients);
  });
}

export async function createClient(data: ClientData): Promise<string> {
  const ref = await addDoc(collection(db, 'clients'), {
    name: data.name,
    phone: data.phone ?? null,
    notes: data.notes ?? null,
    createdAt: Timestamp.fromDate(new Date()),
    ownerId: currentUid(),
  });
  return ref.id;
}

export async function updateClient(id: string, data: Partial<ClientData>): Promise<void> {
  const fields: Record<string, unknown> = {};
  if (data.name !== undefined) fields.name = data.name;
  if (data.phone !== undefined) fields.phone = data.phone;
  if (data.notes !== undefined) fields.notes = data.notes;
  await updateDoc(doc(db, 'clients', id), fields);
}

/**
 * Deletes a Client together with all of their Loans and Installments, in one
 * batch. As with deleteLoan, Available capital is derived from what still
 * exists, so the Principal of every removed Loan (net of paid Installments)
 * returns to it automatically.
 */
export async function deleteClient(clientId: string): Promise<void> {
  const batch = writeBatch(db);

  const loansSnap = await getDocs(
    query(loansRef(), where('ownerId', '==', currentUid()), where('clientId', '==', clientId))
  );
  for (const loanDoc of loansSnap.docs) {
    const installmentsSnap = await getDocs(collection(db, 'loans', loanDoc.id, 'installments'));
    for (const installmentDoc of installmentsSnap.docs) {
      batch.delete(installmentDoc.ref);
    }
    batch.delete(loanDoc.ref);
  }

  batch.delete(doc(db, 'clients', clientId));

  await batch.commit();
}
