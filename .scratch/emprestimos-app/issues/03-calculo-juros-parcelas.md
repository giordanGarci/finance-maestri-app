# Domínio: cálculo de Juros e geração de Parcelas

Status: open
Depende de: nada (lógica pura, sem Firestore)

## Contexto

Ver `CONTEXT.md` (termos **Juros**, **Parcela**) e
`docs/adr/0003-juros-fixos-sem-mora.md`: os Juros são uma taxa sobre o
Principal, calculada **uma única vez** na criação do Empréstimo, sem
recálculo automático por atraso.

`CONTEXT.md` também define a regra de sugestão de valor das Parcelas: por
padrão, divide o total (Principal + Juros) igualmente entre as Parcelas,
com ajuste de centavos na última, mas o usuário pode editar cada valor
manualmente.

## Escopo

Criar `src/domain/emprestimo.ts` com funções puras (sem I/O):

- `calcularValorTotal(principal: number, taxaJuros: number): number` — 
  `principal + principal * taxaJuros`.
- `sugerirParcelas(valorTotal: number, quantidade: number, primeiraDataVencimento: Date, intervaloDias: number): { numero: number; valor: number; dataVencimento: Date }[]` 
  — divide `valorTotal` igualmente entre `quantidade` parcelas, ajustando
  centavos de arredondamento na última parcela para que a soma seja
  exatamente `valorTotal`. Datas de vencimento espaçadas por
  `intervaloDias` a partir de `primeiraDataVencimento`.
- Cobrir com testes o caso `quantidade === 1` (empréstimo "pagamento
  único", ver `CONTEXT.md`: 1 Parcela = "pagamento único", é só um rótulo
  de exibição, não um tipo de dado separado) e casos onde a divisão não é
  exata (ex.: R$ 100,00 em 3 parcelas → 33,33 / 33,33 / 33,34).

## Fora de escopo

- Persistência (isso é o ticket 02, que vai chamar essas funções antes de
  salvar).
- Qualquer forma de juros de mora ou recálculo por atraso (explicitamente
  fora do MVP pela ADR-0003).

## Critérios de aceite

- Funções são puras e testáveis sem mockar Firestore.
- Soma das Parcelas sugeridas é sempre exatamente igual ao valor total
  (nenhuma perda/sobra de centavos).
- `sugerirParcelas` com `quantidade = 1` retorna uma única parcela com o
  valor total.
