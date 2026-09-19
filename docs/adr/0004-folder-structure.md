# Folder structure: Expo app at the repo root

The Expo (TypeScript) project was initialized directly at the root of
`C:\maestri`, not in an `app/` subdirectory, because the repo already follows
the "single-context" layout described in `docs/agents/domain.md`
(`CONTEXT.md` and `docs/adr/` at the root, code in `src/`). Creating an
`app/` subdirectory would needlessly duplicate that root, since there are no
multiple contexts or multiple apps in this repository.

Inside `src/`, code is organized by layer, not by feature:

- `src/domain/`: types and business rules (Client, Loan, Installment,
  Contribution, interest/available capital calculation). Knows nothing about
  Firestore or React.
- `src/data/`: Firebase integration (`firebaseConfig.ts`) and Firestore
  collection modeling (`collections.ts`), including the converters that
  translate between Firestore's `Timestamp` and the domain's `Date`.
- `src/screens/`: the app's screens, grouped by area (`clients/`,
  `loans/`, `contributions/`).
- `src/navigation/`: navigation configuration between screens.
- `src/notifications/`: local notification scheduling (Expo
  Notifications, see ADR-0002).

Alternative considered: organizing by feature (`src/clients/`,
`src/loans/`, each with its own types, data, and screens). Discarded
for the MVP because the domain is small and shares a lot between Client,
Loan, Installment, and Contribution (e.g. available capital cuts across
Loans and Contributions); separating by layer avoids duplicating that
coupling across multiple feature folders.
