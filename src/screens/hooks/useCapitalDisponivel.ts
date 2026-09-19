import { useEffect, useState } from 'react';
import { calcularCapitalDisponivel } from '../../domain/capital';
import type { Aporte, Cliente, Emprestimo, Parcela } from '../../domain/types';
import { listarAportes } from '../../data/aportesRepository';
import { listarClientes } from '../../data/clientesRepository';
import { listarEmprestimosPorCliente, listarParcelas } from '../../data/emprestimosRepository';

/**
 * Não existe leitura global de Empréstimos/Parcelas no repositório (só por
 * Cliente/por Empréstimo), então agregamos aqui: todos os Clientes -> seus
 * Empréstimos -> as Parcelas de cada um. Aceitável para o volume de um
 * usuário único (mesmo racional de não paginar, ver ticket 02).
 */
export function useCapitalDisponivel(): number | null {
  const [aportes, setAportes] = useState<Aporte[] | null>(null);
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [emprestimosPorCliente, setEmprestimosPorCliente] = useState<Record<string, Emprestimo[]>>({});
  const [parcelasPorEmprestimo, setParcelasPorEmprestimo] = useState<Record<string, Parcela[]>>({});

  useEffect(() => listarAportes(setAportes), []);
  useEffect(() => listarClientes(setClientes), []);

  useEffect(() => {
    if (!clientes) return;
    const unsubs = clientes.map((cliente) =>
      listarEmprestimosPorCliente(cliente.id, (emprestimos) => {
        setEmprestimosPorCliente((atual) => ({ ...atual, [cliente.id]: emprestimos }));
      })
    );
    return () => unsubs.forEach((unsub) => unsub());
  }, [clientes]);

  const emprestimos = clientes ? clientes.flatMap((c) => emprestimosPorCliente[c.id] ?? []) : null;
  const chaveEmprestimos = emprestimos ? emprestimos.map((e) => e.id).join(',') : '';

  useEffect(() => {
    if (!emprestimos) return;
    const unsubs = emprestimos.map((emprestimo) =>
      listarParcelas(emprestimo.id, (parcelas) => {
        setParcelasPorEmprestimo((atual) => ({ ...atual, [emprestimo.id]: parcelas }));
      })
    );
    return () => unsubs.forEach((unsub) => unsub());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveEmprestimos]);

  if (aportes === null || emprestimos === null) return null;
  const parcelas = emprestimos.flatMap((e) => parcelasPorEmprestimo[e.id] ?? []);

  return calcularCapitalDisponivel(aportes, emprestimos, parcelas);
}
