import { describe, expect, it } from 'vitest';
import { calculateAvailableCapital } from './capital';
import type { Contribution, Loan, Installment, Withdrawal } from './types';

describe('calculateAvailableCapital', () => {
  it('sums contributions, subtracts principals, and adds paid installments', () => {
    const contributions: Contribution[] = [{ id: 'a1', amount: 1000, date: new Date(2026, 0, 1) }];
    const withdrawals: Withdrawal[] = [];

    const loans: Loan[] = [
      {
        id: 'e1',
        clientId: 'c1',
        principal: 300,
        interestRate: 0.1,
        totalAmount: 330,
        createdAt: new Date(2026, 0, 2),
      },
    ];

    const installments: Installment[] = [
      {
        id: 'p1',
        loanId: 'e1',
        number: 1,
        amount: 330,
        dueDate: new Date(2026, 1, 2),
        paid: true,
        paidAt: new Date(2026, 1, 1),
      },
    ];

    expect(calculateAvailableCapital(contributions, withdrawals, loans, installments)).toBe(1030);
  });

  it('keeps subtracting the principal even after the loan is fully paid off', () => {
    const contributions: Contribution[] = [{ id: 'a1', amount: 1000, date: new Date(2026, 0, 1) }];
    const withdrawals: Withdrawal[] = [];
    const loans: Loan[] = [
      {
        id: 'e1',
        clientId: 'c1',
        principal: 300,
        interestRate: 0.1,
        totalAmount: 330,
        createdAt: new Date(2026, 0, 2),
      },
    ];
    const installments: Installment[] = [
      {
        id: 'p1',
        loanId: 'e1',
        number: 1,
        amount: 330,
        dueDate: new Date(2026, 1, 2),
        paid: true,
      },
    ];

    const result = calculateAvailableCapital(contributions, withdrawals, loans, installments);

    expect(result).toBe(1030);
    expect(result).not.toBe(1000);
    expect(result).not.toBe(1330);
  });

  it('does not count unpaid installments', () => {
    const contributions: Contribution[] = [];
    const withdrawals: Withdrawal[] = [];
    const loans: Loan[] = [
      {
        id: 'e1',
        clientId: 'c1',
        principal: 300,
        interestRate: 0.1,
        totalAmount: 330,
        createdAt: new Date(2026, 0, 2),
      },
    ];
    const installments: Installment[] = [
      {
        id: 'p1',
        loanId: 'e1',
        number: 1,
        amount: 330,
        dueDate: new Date(2026, 1, 2),
        paid: false,
      },
    ];

    expect(calculateAvailableCapital(contributions, withdrawals, loans, installments)).toBe(-300);
  });

  it('subtracts withdrawals from the available capital', () => {
    const contributions: Contribution[] = [{ id: 'a1', amount: 1000, date: new Date(2026, 0, 1) }];
    const withdrawals: Withdrawal[] = [{ id: 'w1', amount: 400, date: new Date(2026, 0, 3) }];

    expect(calculateAvailableCapital(contributions, withdrawals, [], [])).toBe(600);
  });
});
