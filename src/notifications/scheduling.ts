import type { Installment, NotificationPreference } from '../domain/types';
import { isExpoGo } from './permissions';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function alertDate(dueDate: Date, daysBefore: number): Date {
  return new Date(dueDate.getTime() - daysBefore * MILLISECONDS_PER_DAY);
}

/**
 * Cancels every existing local schedule and recreates one per Installment
 * that is still unpaid and not overdue, firing `daysBefore` days before the
 * due date. Call this whenever Installments or the Notification preference
 * change (see ADR-0002: schedules are local, so they need to be fixed up on
 * every change instead of relying on a backend).
 *
 * No-op on Expo Go (see comment in `permissions.ts`): it doesn't even
 * import `expo-notifications`, since the import itself crashes the app in
 * that environment.
 */
export async function syncNotifications(
  installments: Installment[],
  preference: NotificationPreference
): Promise<void> {
  if (isExpoGo()) {
    return;
  }

  const Notifications = await import('expo-notifications');

  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!preference.enabled) {
    return;
  }

  const now = new Date();

  for (const installment of installments) {
    if (installment.paid) continue;
    if (installment.dueDate.getTime() <= now.getTime()) continue;

    const notifyAt = alertDate(installment.dueDate, preference.daysBefore);
    if (notifyAt.getTime() <= now.getTime()) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: installment.id,
      content: {
        title: 'Installment due soon',
        body: `Installment #${installment.number} (R$ ${installment.amount.toFixed(2)}) is due in ${preference.daysBefore} day(s).`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notifyAt,
      },
    });
  }
}
