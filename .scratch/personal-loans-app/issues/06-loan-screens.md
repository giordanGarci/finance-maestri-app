# Loan Screens

Status: resolved
Depends on: 02 (Firestore repository), 03 (interest/installment calculation), 05 (navigation + flow starting from the Client detail)

## Context

See `CONTEXT.md`, terms **Loan** and **Installment**. A Loan has a
Principal, an Interest rate fixed at creation, and one or more
Installments. There are no separate data types for "single payment" vs.
"installment plan" — it's just the number of Installments (1 = single
payment).

## Scope

- "New loan" screen (opened from a Client's detail, see ticket 05):
  Principal, Interest rate (%), number of Installments, first Installment's
  due date, and the interval between Installments (e.g. monthly). Shows the
  calculated total amount (`calculateTotalAmount`, ticket 03) and a preview
  of the suggested Installments (`suggestInstallments`, ticket 03), allowing
  manual editing of each Installment's amount before saving (per
  `CONTEXT.md`: the even-split suggestion can be unchecked/edited).
- "Loan detail" screen: Principal, Interest, total amount, and a list of
  Installments with due date, amount, and status (use `installmentStatus`
  from ticket 04 to show "on-time"/"overdue"; and the `paid` field to show
  "paid"). Each Installment has an action to mark it as paid
  (`markInstallmentPaid`, ticket 02).

## Out of scope

- Editing Principal/Interest after creation (ADR-0003: Interest is fixed at
  creation; allowing the Principal to be edited afterward would raise the
  question of recalculating Interest, which is out of the MVP).
- Deleting a Loan.

## Acceptance criteria

- Creating a Loan with Principal R$ 500, Interest 10%, 3 Installments
  generates Installments totaling R$ 550 with correctly spaced due dates.
- Marking an Installment as paid updates the status on screen without
  needing to leave and come back (via `onSnapshot`, see ticket 02).
- A Loan with 1 Installment is shown somewhere in the UI as "single
  payment" (a display label, not a new field in the database).

## Resolution notes

- `src/screens/loans/LoanFormScreen.tsx`: Principal, Interest (%), number
  of Installments, first Installment's due date (`dd/mm/yyyy` text), and
  interval in days. Uses `calculateTotalAmount`/`suggestInstallments` from
  the Contador for the preview; an "Edit installments manually" switch
  swaps the calculated amounts for editable `TextInput`s per Installment
  (keeping number and date), with a non-blocking warning if the sum
  diverges from the total amount after manual editing — the divergence is
  allowed on purpose (`CONTEXT.md`: the suggestion can be unchecked and
  edited).
- `src/screens/loans/LoanDetailScreen.tsx`: Principal, Interest, total, and
  the Installment list via `listInstallments`; status via `installmentStatus`
  (Contador), a "Paid" label overrides the status when `paid`. A "Single
  payment" vs. "Split into Nx" label appears here, based on the number of
  loaded Installments (not a new field in the domain). A "Mark as paid"
  button per unpaid Installment, calling `markInstallmentPaid` (updates via
  `onSnapshot`, without needing to reload the screen).
- `createLoan` from the repository (ticket 02, already committed) takes a
  single `{ clientId, principal, interestRate, totalAmount, installments }`
  object; adjusted the screen to that signature (documented as
  `NewLoanData` in the file).
- `npx tsc --noEmit` and `npm test` pass with no errors. End-to-end
  validation (creating a real Loan, seeing the document in Firestore)
  depends on running the app with `.env` filled in — not run in this
  session.
