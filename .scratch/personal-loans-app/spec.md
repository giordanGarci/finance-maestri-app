# Personal Loans App

Status: in progress

## Context

See `CONTEXT.md` (glossary) and `docs/adr/0001-stack-expo-firebase.md`,
`docs/adr/0002-local-notifications.md`, `docs/adr/0003-fixed-interest-no-late-fees.md`,
`docs/adr/0004-folder-structure.md` at the repo root.

Personal app (single user) for tracking money lent to third parties:
who owes, how much, the Interest, and the payment status of the Installments.

## Already done (foundation)

- Expo (React Native + TypeScript) project initialized at the repo root.
- Folder structure: `src/domain`, `src/data`, `src/screens/{clients,loans,contributions}`,
  `src/navigation`, `src/notifications` (see ADR-0004).
- `src/data/firebaseConfig.ts`: Firebase initialization from
  `EXPO_PUBLIC_FIREBASE_*` environment variables (no real keys committed).
- `docs/agents/firebase-setup.md`: manual step-by-step in the
  Firebase console (create project, Firestore, Auth with Google, get keys).
- `src/domain/types.ts`: domain types (`Client`, `Loan`, `Installment`,
  `Contribution`, `NotificationPreference`) mirroring `CONTEXT.md`.
- `src/data/collections.ts`: Firestore collection modeling
  (`clients`, `loans` with subcollection `installments`, `contributions`,
  single document `config/notificationPreference`) with Timestamp<->Date
  converters.

## Still to do

See tickets in `.scratch/personal-loans-app/issues/`. Suggested order (each
ticket lists its dependencies in the "Depends on" section):

1. `01-authentication.md`
2. `02-firestore-repository.md`
3. `03-interest-installment-calculation.md`
4. `04-installment-status-available-capital.md`
5. `05-client-screens.md`
6. `06-loan-screens.md`
7. `07-contributions-available-capital-screen.md`
8. `08-notification-preference.md`
