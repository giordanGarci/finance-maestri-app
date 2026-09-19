# Domain: Installment status and Available capital

Status: resolved
Depends on: nothing (pure logic, no Firestore)

## Context

See `CONTEXT.md`, terms **Installment status** and **Available capital**.

- Installment status is *derived*: compares `dueDate` with the current date
  and combines it with the manual `paid` flag. Never persisted as a
  separate field (there's already `paid: boolean` on `Installment`, see
  `src/domain/types.ts`).
- Available capital is *derived*, never edited manually by the user:
  sum of Contributions − sum of Principals of active Loans + sum of
  received (paid) Installments.

## Scope

Create `src/domain/installment.ts`:

- `installmentStatus(installment: Pick<Installment, 'paid' | 'dueDate'>, today: Date): InstallmentStatus`
  ('on-time' | 'overdue'). A `paid` installment is never "overdue" (it's
  already resolved, even if it was marked after the due date).

Create `src/domain/capital.ts`:

- `calculateAvailableCapital(contributions: Contribution[], loans: Loan[], installments: Installment[]): number`
  — sum of contribution `amount`s, minus the sum of `principal` across
  **all** existing loans (not just ones with a pending installment), plus
  the sum of `amount` for installments with `paid === true`.
- Subtle point to document with a short code comment: a Loan's Principal
  keeps being subtracted even after all its Installments are paid. This is
  intentional — the Principal represents the cash outflow that already
  happened at Loan creation, and paid Installments are the cash inflow that
  returns it (with Interest). If the Principal stopped being subtracted once
  the Loan was paid off, the Interest received would be counted twice (the
  paid Installment would "return" the Principal twice: once by no longer
  being subtracted, once by being added). "Active loans" here means all
  existing Loans (there's no cancellation concept in the MVP); if a
  cancel/delete Loan feature is added later, only those should be excluded
  from the sum.

## Out of scope

- Persisting Available capital as a field (it's always calculated on the
  fly from existing data, per `CONTEXT.md`).

## Acceptance criteria

- `installmentStatus` returns `'overdue'` only when `paid === false` and
  `dueDate < today`.
- A test scenario with 1 Contribution of R$ 1000, 1 Loan with Principal R$
  300 with all Installments paid totaling R$ 330 (Principal + Interest),
  results in Available capital of R$ 1030 (1000 − 300 + 330), not R$ 1000
  or R$ 1330.

## Answer

Created `src/domain/installment.ts` (`installmentStatus`) and
`src/domain/capital.ts` (`calculateAvailableCapital`), both importing the
existing types from `src/domain/types.ts` without changing them.
`installmentStatus` returns `'on-time'` whenever `paid === true`, before
even looking at the date. Tested in `src/domain/installment.test.ts` and
`src/domain/capital.test.ts`, including the exact scenario from the
acceptance criteria (1000 − 300 + 330 = 1030) and an extra case confirming
the Principal is subtracted even with no Installment paid.
