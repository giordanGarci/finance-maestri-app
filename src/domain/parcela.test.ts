import { describe, expect, it } from 'vitest';
import { statusParcela } from './parcela';

describe('statusParcela', () => {
  const hoje = new Date(2026, 5, 15);

  it('retorna "atrasado" quando não paga e a data de vencimento já passou', () => {
    expect(statusParcela({ paga: false, dataVencimento: new Date(2026, 5, 1) }, hoje)).toBe(
      'atrasado'
    );
  });

  it('retorna "em-dia" quando não paga e a data de vencimento ainda não chegou', () => {
    expect(statusParcela({ paga: false, dataVencimento: new Date(2026, 5, 30) }, hoje)).toBe(
      'em-dia'
    );
  });

  it('retorna "em-dia" para uma parcela paga, mesmo com vencimento no passado', () => {
    expect(statusParcela({ paga: true, dataVencimento: new Date(2026, 0, 1) }, hoje)).toBe(
      'em-dia'
    );
  });
});
