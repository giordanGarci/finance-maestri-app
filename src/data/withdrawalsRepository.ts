import { addDoc, collection, onSnapshot, query, Timestamp, where, type Unsubscribe } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { withdrawalsRef } from './collections';
import type { Withdrawal } from '../domain/types';
import { currentUid } from './currentUid';

export interface WithdrawalData {
  amount: number;
  date?: Date;
  note?: string;
}

export function listWithdrawals(onChange: (withdrawals: Withdrawal[]) => void): Unsubscribe {
  const q = query(withdrawalsRef(), where('ownerId', '==', currentUid()));
  return onSnapshot(q, (snap) => {
    const withdrawals = snap.docs.map((d) => d.data());
    withdrawals.sort((a, b) => b.date.getTime() - a.date.getTime());
    onChange(withdrawals);
  });
}

export async function createWithdrawal(data: WithdrawalData): Promise<string> {
  const ref = await addDoc(collection(db, 'withdrawals'), {
    amount: data.amount,
    date: Timestamp.fromDate(data.date ?? new Date()),
    note: data.note ?? null,
    ownerId: currentUid(),
  });
  return ref.id;
}
