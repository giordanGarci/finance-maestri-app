/**
 * Local notifications (Expo Notifications) require a real device:
 * - Standard Android emulator: does not receive local notifications without
 *   Google Play Services installed.
 * - Expo Go on Android from SDK 53 on: push support was removed, and the
 *   static `import` of `expo-notifications` alone triggers
 *   `warnOfExpoGoPushUsage`/`addPushTokenListener` internally and crashes
 *   the whole app with "[runtime not ready]" on startup — even when only
 *   using local scheduling, with no push involved. That's why this module
 *   (and `scheduling.ts`) never imports `expo-notifications` at the top of
 *   the file, only via a dynamic `import()`, always after checking
 *   `isExpoGo()`. Works normally in a development build
 *   (`expo run:android` / `expo run:ios`, or an EAS development build,
 *   which remains free) or on a physical device outside Expo Go.
 */
import Constants from 'expo-constants';
import * as Device from 'expo-device';

export function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/**
 * Requests notification permission from the user, if not already granted.
 * Returns `false` without asking anything when there is no way to deliver
 * the notification: Expo Go on Android, or an emulator without Google Play
 * Services.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (isExpoGo() || !Device.isDevice) {
    return false;
  }

  const Notifications = await import('expo-notifications');

  const currentPermission = await Notifications.getPermissionsAsync();
  if (currentPermission.granted) {
    return true;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();
  return requestedPermission.granted;
}
