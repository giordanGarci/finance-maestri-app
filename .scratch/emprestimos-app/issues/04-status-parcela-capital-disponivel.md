# Domínio: status da Parcela e Capital disponível

Status: open
Depende de: nada (lógica pura, sem Firestore)

## Contexto

Ver `CONTEXT.md`, termos **Status da parcela** e **Capital disponível**.

- Status da parcela é *derivado*: compara `dataVencimento` com a data atual
  e combina com a marcação manual `paga`. Nunca é persistido como campo
  separado (já existe `paga: boolean` em `Parcela`, ver
  `src/domain/types.ts`).
- Capital disponível é *derivado*, nunca editado manualmente pelo usuário:
  soma dos Aportes − soma dos Principais dos Empréstimos ativos + soma das
  Parcelas recebidas (pagas).

## Escopo

Criar `src/domain/parcela.ts`:

- `statusParcela(parcela: Pick<Parcela, 'paga' | 'dataVencimento'>, hoje: Date): StatusParcela`
  ('em-dia' | 'atrasado'). Uma parcela `paga` nunca é "atrasado" (ela já foi
  resolvida, mesmo que a marcação tenha acontecido depois do vencimento).

Criar `src/domain/capital.ts`:

- `calcularCapitalDisponivel(aportes: Aporte[], emprestimos: Emprestimo[], parcelas: Parcela[]): number`
  — soma dos `valor` dos aportes, menos a soma dos `principal` de **todos**
  os empréstimos existentes (não só os com parcela pendente), mais a soma
  dos `valor` das parcelas com `paga === true`.
- Ponto sutil a documentar com um comentário curto no código: o Principal
  de um Empréstimo continua sendo subtraído mesmo depois de todas as
  Parcelas pagas. Isso é intencional — o Principal representa a saída de
  caixa que já aconteceu na criação do Empréstimo, e as Parcelas pagas são
  a entrada de caixa que a devolve (com Juros). Se o Principal parasse de
  ser subtraído quando o Empréstimo fosse liquidado, o Juros recebido
  seria contado a mais (a Parcela paga "voltaria" o Principal duas vezes:
  uma por não ser mais subtraído, outra por ser somado). "Empréstimos
  ativos" aqui significa todos os Empréstimos existentes (não há conceito
  de cancelamento no MVP); se um recurso de cancelar/excluir Empréstimo for
  adicionado depois, só esses deveriam ser excluídos da soma.

## Fora de escopo

- Persistir o Capital disponível como campo (é sempre calculado on-the-fly
  a partir dos dados existentes, conforme `CONTEXT.md`).

## Critérios de aceite

- `statusParcela` retorna `'atrasado'` só quando `paga === false` e
  `dataVencimento < hoje`.
- Um cenário de teste com 1 Aporte de R$ 1000, 1 Empréstimo de Principal
  R$ 300 com todas as Parcelas pagas somando R$ 330 (Principal + Juros),
  resulta em Capital disponível de R$ 1030 (1000 − 300 + 330), não R$ 1000
  nem R$ 1330.
