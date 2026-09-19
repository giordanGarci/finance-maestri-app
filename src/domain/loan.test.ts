import { describe, expect, it } from 'vitest';
import { calculateTotalAmount, suggestInstallments } from './loan';

describe('calculateTotalAmount', () => {
  it('sums the principal with the interest', () => {
    expect(calculateTotalAmount(1000, 0.1)).toBe(1100);
  });

  it('returns the principal itself when the rate is zero', () => {
    expect(calculateTotalAmount(500, 0)).toBe(500);
  });
});

describe('suggestInstallments', () => {
  it('with quantity 1, returns a single installment with the total amount', () => {
    const firstDueDate = new Date(2026, 0, 10);
    const installments = suggestInstallments(1100, 1, firstDueDate, 30);

    expect(installments).toEqual([
      { number: 1, amount: 1100, dueDate: firstDueDate },
    ]);
  });

  it('splits the amount evenly, adjusting cents on the last installment', () => {
    const firstDueDate = new Date(2026, 0, 10);
    const installments = suggestInstallments(100, 3, firstDueDate, 30);

    expect(installments.map((i) => i.amount)).toEqual([33.33, 33.33, 33.34]);
    expect(installments.reduce((sum, i) => sum + i.amount, 0)).toBeCloseTo(100, 10);
  });

  it('spaces due dates by the given interval in days', () => {
    const firstDueDate = new Date(2026, 0, 10);
    const installments = suggestInstallments(300, 3, firstDueDate, 30);
    const format = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

    expect(installments.map((i) => format(i.dueDate))).toEqual([
      '2026-1-10',
      '2026-2-9',
      '2026-3-11',
    ]);
  });

  it('never loses or gains cents, even with uneven splits', () => {
    const installments = suggestInstallments(1000, 7, new Date(2026, 0, 1), 15);
    const sum = installments.reduce((acc, i) => acc + i.amount, 0);

    expect(Math.round(sum * 100) / 100).toBe(1000);
  });
});
