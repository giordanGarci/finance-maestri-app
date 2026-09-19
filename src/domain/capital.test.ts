import { describe, expect, it } from 'vitest';
import { calcularCapitalDisponivel } from './capital';
import type { Aporte, Emprestimo, Parcela } from './types';

describe('calcularCapitalDisponivel', () => {
  it('soma aportes, subtrai principais e soma parcelas pagas', () => {
    const aportes: Aporte[] = [{ id: 'a1', valor: 1000, data: new Date(2026, 0, 1) }];

    const emprestimos: Emprestimo[] = [
      {
        id: 'e1',
        clienteId: 'c1',
        principal: 300,
        taxaJuros: 0.1,
        valorTotal: 330,
        criadoEm: new Date(2026, 0, 2),
      },
    ];

    const parcelas: Parcela[] = [
      {
        id: 'p1',
        emprestimoId: 'e1',
        numero: 1,
        valor: 330,
        dataVencimento: new Date(2026, 1, 2),
        paga: true,
        dataPagamento: new Date(2026, 1, 1),
      },
    ];

    expect(calcularCapitalDisponivel(aportes, emprestimos, parcelas)).toBe(1030);
  });

  it('continua subtraindo o principal mesmo após a quitação total do empréstimo', () => {
    const aportes: Aporte[] = [{ id: 'a1', valor: 1000, data: new Date(2026, 0, 1) }];
    const emprestimos: Emprestimo[] = [
      {
        id: 'e1',
        clienteId: 'c1',
        principal: 300,
        taxaJuros: 0.1,
        valorTotal: 330,
        criadoEm: new Date(2026, 0, 2),
      },
    ];
    const parcelas: Parcela[] = [
      {
        id: 'p1',
        emprestimoId: 'e1',
        numero: 1,
        valor: 330,
        dataVencimento: new Date(2026, 1, 2),
        paga: true,
      },
    ];

    const resultado = calcularCapitalDisponivel(aportes, emprestimos, parcelas);

    expect(resultado).toBe(1030);
    expect(resultado).not.toBe(1000);
    expect(resultado).not.toBe(1330);
  });

  it('não conta parcelas não pagas', () => {
    const aportes: Aporte[] = [];
    const emprestimos: Emprestimo[] = [
      {
        id: 'e1',
        clienteId: 'c1',
        principal: 300,
        taxaJuros: 0.1,
        valorTotal: 330,
        criadoEm: new Date(2026, 0, 2),
      },
    ];
    const parcelas: Parcela[] = [
      {
        id: 'p1',
        emprestimoId: 'e1',
        numero: 1,
        valor: 330,
        dataVencimento: new Date(2026, 1, 2),
        paga: false,
      },
    ];

    expect(calcularCapitalDisponivel(aportes, emprestimos, parcelas)).toBe(-300);
  });
});
