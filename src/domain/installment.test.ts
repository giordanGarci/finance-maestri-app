import { describe, expect, it } from 'vitest';
import { installmentStatus } from './installment';

describe('installmentStatus', () => {
  const today = new Date(2026, 5, 15);

  it('returns "overdue" when unpaid and the due date has already passed', () => {
    expect(installmentStatus({ paid: false, dueDate: new Date(2026, 5, 1) }, today)).toBe(
      'overdue'
    );
  });

  it('returns "on-time" when unpaid and the due date has not arrived yet', () => {
    expect(installmentStatus({ paid: false, dueDate: new Date(2026, 5, 30) }, today)).toBe(
      'on-time'
    );
  });

  it('returns "on-time" for a paid installment, even with a due date in the past', () => {
    expect(installmentStatus({ paid: true, dueDate: new Date(2026, 0, 1) }, today)).toBe(
      'on-time'
    );
  });
});
