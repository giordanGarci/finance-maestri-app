/**
 * Interest calculation and Installment suggestion. See CONTEXT.md ("Interest",
 * "Installment") and docs/adr/0003-fixed-interest-no-late-fees.md: Interest is
 * fixed once at Loan creation, with no recalculation for late payments.
 */

export function calculateTotalAmount(principal: number, interestRate: number): number {
  return principal + principal * interestRate;
}

export interface SuggestedInstallment {
  number: number;
  amount: number;
  dueDate: Date;
}

export function suggestInstallments(
  totalAmount: number,
  quantity: number,
  firstDueDate: Date,
  intervalDays: number
): SuggestedInstallment[] {
  const baseAmount = Math.floor((totalAmount / quantity) * 100) / 100;
  const installments: SuggestedInstallment[] = [];

  for (let number = 1; number <= quantity; number++) {
    const dueDate = new Date(firstDueDate);
    dueDate.setDate(dueDate.getDate() + intervalDays * (number - 1));

    const last = number === quantity;
    const sumOfPrevious = baseAmount * (quantity - 1);
    const amount = last ? Math.round((totalAmount - sumOfPrevious) * 100) / 100 : baseAmount;

    installments.push({ number, amount, dueDate });
  }

  return installments;
}
