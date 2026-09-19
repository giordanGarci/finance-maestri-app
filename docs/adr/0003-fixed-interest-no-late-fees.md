# Interest fixed at creation, no automatic late fees (MVP)

A Loan's Interest is calculated once, at creation, as a rate on top of the Principal, and is not automatically recalculated when an Installment is overdue. This is a deliberate simplification for the MVP: charging something extra for a late payment is left to the user's manual discretion, avoiding unrequested accrual/compounding logic with financially sensitive effects if implemented incorrectly.
