# Data repository (Firestore CRUD)

Status: resolved
Depends on: 01 (needs the authenticated uid to fill in `ownerId`)

## Context

`src/data/collections.ts` already models the collections (`clientsRef`,
`loansRef`, `installmentsRef(loanId)`, `contributionsRef`,
`notificationPreferenceDoc`) with Timestamp<->Date converters. Missing is
the layer of read/write functions the screens will call, so they don't
manipulate `addDoc`/`getDocs`/`onSnapshot` directly.

## Scope

Create one repository file per collection in `src/data/`
(`clientsRepository.ts`, `loansRepository.ts`,
`contributionsRepository.ts`, `notificationPreferenceRepository.ts`) with
functions such as:

- `listClients()`, `createClient(data)`, `updateClient(id, data)`
- `listLoansByClient(clientId)`, `createLoan(data)` (receives the
  already-calculated result from ticket 03 — this ticket doesn't calculate
  interest, only persists)
- `listInstallments(loanId)`, `markInstallmentPaid(loanId, installmentId)`
- `listContributions()`, `createContribution(data)`
- `getNotificationPreference()`, `saveNotificationPreference(data)`

All creation functions must fill in `ownerId` from the authenticated user
(see ticket 01).

Prefer `onSnapshot` (real-time listener) over `getDocs` for the listings
shown on screen, since the app is single-user but multi-screen (avoids
having to manually refresh the list after every write).

## Out of scope

- Pagination (data volume is low for a single user).
- Custom offline caching (the Firestore SDK already caches locally by
  default).

## Acceptance criteria

- No screen in `src/screens/` imports `firebase/firestore` directly; all
  reads/writes go through these repository functions.
- Creating a test Client/Loan/Contribution shows the document in the
  Firebase console with the expected fields and types (Timestamp for dates).

## Comments

Implemented `src/data/currentUid.ts` (shared helper: reads
`auth.currentUser.uid`, throws if no one is logged in — used by all the
repositories below instead of requiring every screen to pass the uid).

- `clientsRepository.ts`: `listClients`, `createClient`, `updateClient`.
- `loansRepository.ts`: `listLoansByClient`, `createLoan`
  (writes the Loan and all its Installments in a single atomic `writeBatch`),
  `listInstallments`, `markInstallmentPaid`.
- `contributionsRepository.ts`: `listContributions`, `createContribution`.
- `notificationPreferenceRepository.ts`: already implemented by whoever
  picked up ticket 08 (`getNotificationPreference`/`saveNotificationPreference`);
  not duplicated here.

Important, non-obvious decision: writers use `addDoc`/`setDoc`/`writeBatch`
on `collection(db, ...)` **without** `collections.ts`'s `withConverter`,
because the `ownerId` field (used by the security rules) isn't part of the
domain types (`Client`/`Loan`/`Installment`/`Contribution` in
`src/domain/types.ts` deliberately don't have `ownerId` — it's a Firestore
detail, not a domain one). Reads keep using the typed converters from
`collections.ts` (`clientsRef()`, `loansRef()`, etc.) via `onSnapshot`,
which ignore the extra `ownerId` field when deserializing.

All listings filter by `ownerId == currentUid()` in their queries (required
by the Firestore rules documented in `docs/agents/firebase-setup.md` — a
query without that filter is rejected by Firestore, not just filtered
client-side). Sorting (by name/date/number) is done client-side, not via
Firestore's `orderBy`, to avoid requiring manual composite index creation in
the console.

`NewLoanData.installments` uses the same `{ number, amount,
dueDate }` shape that `suggestInstallments` (ticket 03, `src/domain/loan.ts`)
already returns — ticket 06 can pass the result straight through.

Untested against a real Firebase project (no credentials in this
environment); validated only with `npx tsc --noEmit` (whole project,
including the files from tickets 03/04/08 already present in parallel).
Manual testing is pending whoever has a real `.env` configured.
