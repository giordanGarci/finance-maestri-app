import { describe, expect, it } from 'vitest';
import { calcularValorTotal, sugerirParcelas } from './emprestimo';

describe('calcularValorTotal', () => {
  it('soma o principal com os juros', () => {
    expect(calcularValorTotal(1000, 0.1)).toBe(1100);
  });

  it('retorna o próprio principal quando a taxa é zero', () => {
    expect(calcularValorTotal(500, 0)).toBe(500);
  });
});

describe('sugerirParcelas', () => {
  it('com quantidade 1, retorna uma única parcela com o valor total', () => {
    const primeiraDataVencimento = new Date(2026, 0, 10);
    const parcelas = sugerirParcelas(1100, 1, primeiraDataVencimento, 30);

    expect(parcelas).toEqual([
      { numero: 1, valor: 1100, dataVencimento: primeiraDataVencimento },
    ]);
  });

  it('divide o valor igualmente, ajustando centavos na última parcela', () => {
    const primeiraDataVencimento = new Date(2026, 0, 10);
    const parcelas = sugerirParcelas(100, 3, primeiraDataVencimento, 30);

    expect(parcelas.map((p) => p.valor)).toEqual([33.33, 33.33, 33.34]);
    expect(parcelas.reduce((soma, p) => soma + p.valor, 0)).toBeCloseTo(100, 10);
  });

  it('espaça as datas de vencimento pelo intervalo de dias informado', () => {
    const primeiraDataVencimento = new Date(2026, 0, 10);
    const parcelas = sugerirParcelas(300, 3, primeiraDataVencimento, 30);
    const formatar = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

    expect(parcelas.map((p) => formatar(p.dataVencimento))).toEqual([
      '2026-1-10',
      '2026-2-9',
      '2026-3-11',
    ]);
  });

  it('nunca perde ou sobra centavos, mesmo com divisões não exatas', () => {
    const parcelas = sugerirParcelas(1000, 7, new Date(2026, 0, 1), 15);
    const soma = parcelas.reduce((acc, p) => acc + p.valor, 0);

    expect(Math.round(soma * 100) / 100).toBe(1000);
  });
});
