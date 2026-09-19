# Domain: Interest calculation and Installment generation

Status: resolved
Depends on: nothing (pure logic, no Firestore)

## Context

See `CONTEXT.md` (terms **Interest**, **Installment**) and
`docs/adr/0003-fixed-interest-no-late-fees.md`: Interest is a rate on top of
the Principal, calculated **once** at Loan creation, with no automatic
recalculation for late payments.

`CONTEXT.md` also defines the Installment amount suggestion rule: by
default, split the total (Principal + Interest) evenly across Installments,
with a cents adjustment on the last one, but the user can edit each amount
manually.

## Scope

Create `src/domain/loan.ts` with pure functions (no I/O):

- `calculateTotalAmount(principal: number, interestRate: number): number` —
  `principal + principal * interestRate`.
- `suggestInstallments(totalAmount: number, quantity: number, firstDueDate: Date, intervalDays: number): { number: number; amount: number; dueDate: Date }[]`
  — splits `totalAmount` evenly across `quantity` installments, adjusting
  rounding cents on the last installment so the sum is exactly
  `totalAmount`. Due dates spaced by `intervalDays` starting from
  `firstDueDate`.
- Cover with tests the `quantity === 1` case (a "single payment" loan, see
  `CONTEXT.md`: 1 Installment = "single payment" is just a display label,
  not a separate data type) and cases where the split isn't exact (e.g. R$
  100.00 in 3 installments → 33.33 / 33.33 / 33.34).

## Out of scope

- Persistence (that's ticket 02, which will call these functions before
  saving).
- Any form of late fees or recalculation for overdue payments (explicitly
  out of the MVP per ADR-0003).

## Acceptance criteria

- Functions are pure and testable without mocking Firestore.
- The sum of suggested Installments always exactly equals the total amount
  (no cents lost or left over).
- `suggestInstallments` with `quantity = 1` returns a single installment
  with the total amount.

## Answer

Created `src/domain/loan.ts` with `calculateTotalAmount` and
`suggestInstallments`. The split uses `Math.floor` on the base amount
(truncating down to cents) and adjusts the last installment as
`totalAmount - sum of previous ones`, guaranteeing an exact sum without
relying on accumulated rounding. Tested in `src/domain/loan.test.ts`
(quantity = 1, uneven split 100/3, date spacing by `intervalDays`, and a
7-installment case checking there's no cent loss). Added `vitest` as the
project's test runner (none was configured yet); run with `npm test`.
