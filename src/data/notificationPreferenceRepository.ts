/**
 * Repository for the `config/notificationPreference` collection. The other
 * repositories (clients/loans/contributions) live in their own files.
 */
import { onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore';
import type { NotificationPreference } from '../domain/types';
import { notificationPreferenceDoc, toNotificationPreference } from './collections';

export function getNotificationPreference(
  onChange: (preference: NotificationPreference) => void
): Unsubscribe {
  return onSnapshot(notificationPreferenceDoc(), (snapshot) => {
    onChange(toNotificationPreference(snapshot.data()));
  });
}

export async function saveNotificationPreference(data: NotificationPreference): Promise<void> {
  await setDoc(notificationPreferenceDoc(), data);
}
