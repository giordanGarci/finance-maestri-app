# Personal Loans App

Personal (single-user) app for organizing money lent to third parties: who owes, how much, interest, and payment status.

## Language

**Client**:
An individual the money is lent to. May have multiple active Loans at once, with accumulated history.
_Avoid_: Debtor, Borrower

**Loan**:
A credit operation granted to a Client: a Principal, an Interest rate fixed at creation, and one or more Installments with a due date. "Single payment" and "installment plan" are display labels inferred from the number of Installments (1 Installment = "single payment"), not distinct data types.
_Avoid_: Credit, Debt

**Principal**:
The amount lent to the Client, without Interest.
_Avoid_: Loaned capital (don't confuse with Available capital)

**Interest**:
An amount added to the Principal, calculated once at Loan creation as a rate on top of the Principal. Not automatically recalculated for late payments.
_Avoid_: Late fee, compound interest

**Installment**:
A fraction of the total to be paid (Principal + Interest) for a Loan, with its own due date. By default the amount is suggested by splitting the total evenly across Installments (with a cents adjustment on the last one), but the user can uncheck that suggestion and edit each Installment's amount manually.
_Avoid_: Payment tranche

**Installment status** (on-time / overdue):
Derived by comparing the Installment's due date with the current date, combined with the manual "paid" flag set by the user. There is no automatic bank integration.
_Avoid_: Pending (use only for "not due yet")

**Available capital**:
A balance derived automatically: sum of registered Contributions − sum of the Principals of active Loans + sum of received Installments. Never edited directly by the user.
_Avoid_: Cash, manual balance

**Contribution**:
A record of money the user adds to Available capital, outside the Loan/Installment cycle.
_Avoid_: Deposit

**Notification preference**:
A global app setting: how many days before an Installment's due date the user wants to be notified, and whether notifications are enabled. Delivered as a local notification on the device.
