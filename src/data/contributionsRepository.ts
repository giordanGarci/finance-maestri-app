import { addDoc, collection, onSnapshot, query, Timestamp, where, type Unsubscribe } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { contributionsRef } from './collections';
import type { Contribution } from '../domain/types';
import { currentUid } from './currentUid';

export interface ContributionData {
  amount: number;
  date?: Date;
  note?: string;
}

export function listContributions(onChange: (contributions: Contribution[]) => void): Unsubscribe {
  const q = query(contributionsRef(), where('ownerId', '==', currentUid()));
  return onSnapshot(q, (snap) => {
    const contributions = snap.docs.map((d) => d.data());
    contributions.sort((a, b) => b.date.getTime() - a.date.getTime());
    onChange(contributions);
  });
}

export async function createContribution(data: ContributionData): Promise<string> {
  const ref = await addDoc(collection(db, 'contributions'), {
    amount: data.amount,
    date: Timestamp.fromDate(data.date ?? new Date()),
    note: data.note ?? null,
    ownerId: currentUid(),
  });
  return ref.id;
}
