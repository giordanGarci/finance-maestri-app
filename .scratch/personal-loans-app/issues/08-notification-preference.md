# Notification Preference and Local Notifications

Status: resolved
Depends on: 02 (Firestore repository, for `notificationPreferenceRepository`), 06 (needs Installments to already exist to have something to notify about)

## Context

See `CONTEXT.md`, term **Notification preference**, and
`docs/adr/0002-local-notifications.md`: notifications are scheduled locally
on the device via Expo Notifications, not pushed from a backend. This means
the schedules need to be recreated/fixed up every time the app opens and
every time an Installment's date changes (the ADR deliberately accepts this
cost).

`expo-notifications`, `expo-device`, and `expo-constants` are already
installed (`package.json`).

## Scope

- `src/notifications/`:
  - `permissions.ts`: request notification permission (via
    `expo-notifications`; keep in mind local notifications don't work on
    the standard Android emulator without Google Play Services / and have
    limited support in Expo Go from SDK 53 on — test on a development build
    or physical device, document this in the file).
  - `scheduling.ts`: a `syncNotifications(installments: Installment[], preference: NotificationPreference)`
    function that cancels every existing local schedule
    (`cancelAllScheduledNotificationsAsync`) and recreates one schedule per
    unpaid, not-yet-overdue Installment, firing `daysBefore` days before the
    `dueDate`, only if `preference.enabled`.
- "Notification preference" screen: a numeric `daysBefore` field and an
  `enabled` switch, saving via `notificationPreferenceRepository` (ticket
  02) and calling `syncNotifications` after saving.
- Also call `syncNotifications` when the app opens (after login) and after
  any change to Installments (creating a Loan, marking an Installment as
  paid), to keep the schedules consistent with the current state, per
  ADR-0002.

## Out of scope

- Remote push/notifications when the app is uninstalled or the phone is
  off (explicitly dropped by ADR-0002).
- Notifying for already-overdue Installments (the alert is preventive,
  before the due date; an overdue Installment is already visible on the
  Loan screen via ticket 06/04).

## Acceptance criteria

- With the preference set to "3 days before" and an Installment due in 5
  days, there's a local notification scheduled for 2 days from now.
- Marking that Installment as paid removes its scheduled notification.
- Disabling the preference (`enabled = false`) cancels every schedule.

## Resolution notes

Tickets 02 and 06 were still `open` (no `notificationPreferenceRepository`
or Loan screens/navigation yet) at implementation time, so:

- `src/notifications/permissions.ts`: `requestNotificationPermission()` +
  a documented warning about the emulator/Expo Go.
- `src/notifications/scheduling.ts`: `syncNotifications(installments, preference)`
  exactly as specified.
- `src/notifications/useSyncNotifications.ts`: a hook that listens to every
  Installment (via `collectionGroup(db, 'installments')`, since it's a
  subcollection) and the Notification preference via `onSnapshot`, and
  calls `syncNotifications` on every change to either. This covers "opening
  the app" and "any change to Installments" (creating a Loan, marking one
  paid) without needing call sites scattered across tickets 01/06's
  screens. Ticket 01 finished during this session and had already created
  `App.tsx`, so wired up `useSyncNotifications(!!user)` there (takes an
  `active` flag to avoid reading `installments`/`config` before login,
  since Firestore rules require `request.auth != null`). When ticket 05's
  main navigation replaces this provisional root screen, the hook needs to
  stay mounted above the navigation (or in some component that always
  renders while logged in).
- `src/data/notificationPreferenceRepository.ts`: implemented only the
  `getNotificationPreference`/`saveNotificationPreference` slice (names per
  ticket 02), using `onSnapshot`/`setDoc` on `notificationPreferenceDoc()`.
  The client/loan/contribution repositories remain open for ticket 02.
- `src/screens/NotificationPreferenceScreen.tsx`: a `daysBefore` field +
  `enabled` switch; on save, persists the preference, requests notification
  permission if `enabled`, fetches the current Installments (`getDocs` on
  the same `collectionGroup`), and calls `syncNotifications` directly
  (redundant with the hook once it's mounted, but keeps the screen
  functional on its own before then). **Missing**: not registered in any
  navigation yet — ticket 05 (navigation) is `claimed` but not resolved at
  the time of this implementation; whoever finishes it needs to add a route
  for `NotificationPreferenceScreen` (e.g. in a settings screen).
- `npx tsc --noEmit` passes with no errors. There's no test suite in the
  project yet; manual validation of the acceptance criteria depends on a
  development build on a physical device (see `permissions.ts`) and on
  having real Loans/Installments in Firestore (tickets 02/03/06), so
  end-to-end acceptance criteria weren't validated in this session.

## Fix: startup crash in Expo Go (Android)

Bug reported by the user testing on Android via Expo Go: the app crashed on
boot with `[runtime not ready]: Android Push notifications... removed
from Expo Go`. Cause: `scheduling.ts` statically imported
`expo-notifications` at the top of the file; that import alone triggers
`warnOfExpoGoPushUsage`/`addPushTokenListener` internally in the library and
crashes the app in Expo Go from SDK 53 on — even though the code only used
local scheduling, never push. `useSyncNotifications.ts` imported
`scheduling.ts` unconditionally, and `App.tsx` calls
`useSyncNotifications` with no guard at all, so the crash happened every
time, even logged out. `isExpoGo()` already existed in `permissions.ts` but
wasn't used anywhere to prevent this.

Fix applied:

- `permissions.ts` and `scheduling.ts` no longer import
  `expo-notifications` at the top of the file — only via a dynamic
  `import('expo-notifications')`, and only after checking `isExpoGo()`.
  This way the module never even gets evaluated in Expo Go.
- `syncNotifications` and `requestNotificationPermission` become no-ops
  (return without doing anything / `false`) when `isExpoGo()`, instead of
  crashing.
- `useSyncNotifications` also checks `isExpoGo()` before mounting the
  Firestore listeners (avoids listening to `installments`/`config` just to
  call a sync that would ignore everything anyway).
- `NotificationPreferenceScreen` shows a warning when `isExpoGo()`
  explaining that the preference is saved normally, but schedules only work
  in a development build.
- `docs/agents/firebase-setup.md` got a "Local notifications require a
  development build, not Expo Go" section with the command (`expo
  run:android` / `expo run:ios` or `eas build --profile development`,
  which remains free).

The rest of the app (clients, loans, available capital) isn't affected by
this import — no other module imports `expo-notifications`.
`npx tsc --noEmit` and `npm test` (vitest, 12 tests) pass.
