# Contributions and Available Capital Screen

Status: resolved
Depends on: 02 (Firestore repository), 04 (available capital calculation), 05 (navigation)

## Context

See `CONTEXT.md`, terms **Contribution** and **Available capital**.
A Contribution is money the user adds to Available capital outside the
Loan/Installment cycle. Available capital is always derived, never edited
directly.

## Scope

- "Contributions" screen: list of Contributions (amount, date, note) + a
  button to register a new Contribution (amount required, date defaults to
  today, note optional). Uses `listContributions`/`createContribution` from
  ticket 02.
- An Available capital indicator visible on this screen (and ideally also
  on ticket 05's home/client-list screen, as a summary at the top). Uses
  `calculateAvailableCapital` from ticket 04, fed by the data loaded from
  `contributions`, `loans`, and all `installments` across all loans.

## Out of scope

- Editing/deleting a Contribution entered by mistake (not requested; if
  needed later, treating it as a negative Contribution is simpler than
  allowing retroactive editing).

## Acceptance criteria

- Registering a R$ 200 Contribution immediately increases the displayed
  Available capital by R$ 200.
- The displayed Available capital never has a direct edit field — it's
  always calculated text/label.

## Resolution notes

- `src/screens/contributions/ContributionsScreen.tsx`: list of
  Contributions (amount, date, note) + a form (amount required, date always
  today via the repository's `createContribution`, note optional). No
  edit/delete, per "out of scope".
- Available capital: `src/screens/hooks/useAvailableCapital.ts` +
  `src/screens/components/AvailableCapitalSummary.tsx`, reused on the
  Contributions screen and at the top of the Client list (ticket 05),
  always as calculated text, never editable.
- Gap found: the repository (ticket 02) only exposes
  `listLoansByClient(clientId)` and `listInstallments(loanId)`, with no
  global read. Instead of requesting a change to Firestore/security rules
  from the Alicerce, `useAvailableCapital` aggregates client-side: all
  Clients -> each one's Loans -> each Loan's Installments ->
  `calculateAvailableCapital` (Contador). Acceptable for a single user's
  data volume (same reasoning as the "out of scope: pagination" in tickets
  02/04). Coordinated with the team (see comment below).
- `npx tsc --noEmit` and `npm test` pass with no errors. End-to-end
  validation of the acceptance criteria (a R$ 200 contribution reflected
  immediately) depends on running the app against real Firestore — not run
  in this session.

## Comments

- Vitrine: flagged to the team (via `Claude Code`) that a global read of
  Loans/Installments was missing for Available capital, and chose to solve
  it by aggregating client-side instead of requesting a
  repository/security-rules change right now. If the data volume grows
  enough for this to matter, it's worth reconsidering a `listAllInstallments`
  via `collectionGroup` (the pattern already exists in
  `src/notifications/useSyncNotifications.ts`, which does exactly that for
  a different purpose).
