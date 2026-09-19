import { collectionGroup, onSnapshot } from 'firebase/firestore';
import { useEffect } from 'react';
import { installmentConverter, notificationPreferenceDoc, toNotificationPreference } from '../data/collections';
import { db } from '../data/firebaseConfig';
import type { Installment, NotificationPreference } from '../domain/types';
import { syncNotifications } from './scheduling';
import { isExpoGo } from './permissions';

/**
 * Keeps notification schedules in sync with the current state, listening to
 * every Installment (via collectionGroup, since `installments` is a
 * subcollection of each Loan) and the Notification preference, and calling
 * `syncNotifications` on every change to either. Since schedules are local
 * (ADR-0002), this replaces having to remember to call `syncNotifications`
 * manually from every screen that creates a Loan or marks an Installment as
 * paid.
 *
 * Call once at the app root. `active` should stay `false` until there is a
 * logged-in user (Firestore rules require `request.auth != null` to read
 * `installments`/`config`). No-op on Expo Go (see `permissions.ts`): there's
 * no point listening to Firestore just to call a sync that will ignore
 * everything anyway.
 */
export function useSyncNotifications(active: boolean): void {
  useEffect(() => {
    if (!active || isExpoGo()) {
      return;
    }

    let installments: Installment[] = [];
    let preference: NotificationPreference | undefined;

    const sync = () => {
      if (preference) {
        void syncNotifications(installments, preference);
      }
    };

    const stopInstallments = onSnapshot(
      collectionGroup(db, 'installments').withConverter(installmentConverter),
      (snapshot) => {
        installments = snapshot.docs.map((doc) => doc.data());
        sync();
      }
    );

    const stopPreference = onSnapshot(notificationPreferenceDoc(), (snapshot) => {
      preference = toNotificationPreference(snapshot.data());
      sync();
    });

    return () => {
      stopInstallments();
      stopPreference();
    };
  }, [active]);
}
