/**
 * Cálculo de Juros e sugestão de Parcelas. Ver CONTEXT.md (termos "Juros",
 * "Parcela") e docs/adr/0003-juros-fixos-sem-mora.md: os Juros são fixados
 * uma única vez na criação do Empréstimo, sem recálculo por atraso.
 */

export function calcularValorTotal(principal: number, taxaJuros: number): number {
  return principal + principal * taxaJuros;
}

export interface ParcelaSugerida {
  numero: number;
  valor: number;
  dataVencimento: Date;
}

export function sugerirParcelas(
  valorTotal: number,
  quantidade: number,
  primeiraDataVencimento: Date,
  intervaloDias: number
): ParcelaSugerida[] {
  const valorBase = Math.floor((valorTotal / quantidade) * 100) / 100;
  const parcelas: ParcelaSugerida[] = [];

  for (let numero = 1; numero <= quantidade; numero++) {
    const dataVencimento = new Date(primeiraDataVencimento);
    dataVencimento.setDate(dataVencimento.getDate() + intervaloDias * (numero - 1));

    const ultima = numero === quantidade;
    const somaAnteriores = valorBase * (quantidade - 1);
    const valor = ultima ? Math.round((valorTotal - somaAnteriores) * 100) / 100 : valorBase;

    parcelas.push({ numero, valor, dataVencimento });
  }

  return parcelas;
}
