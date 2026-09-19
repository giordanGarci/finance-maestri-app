# Telas de Empréstimos

Status: resolved
Depende de: 02 (repositório Firestore), 03 (cálculo de juros/parcelas), 05 (navegação + fluxo a partir do detalhe do Cliente)

## Contexto

Ver `CONTEXT.md`, termos **Empréstimo** e **Parcela**. Um Empréstimo tem um
Principal, uma taxa de Juros fixada na criação, e uma ou mais Parcelas. Não
existem tipos de dado separados para "pagamento único" vs "parcelado" — é
só o número de Parcelas (1 = pagamento único).

## Escopo

- Tela "Novo empréstimo" (aberta a partir do detalhe de um Cliente, ver
  ticket 05): Principal, taxa de Juros (%), quantidade de Parcelas, data da
  primeira Parcela e intervalo entre Parcelas (ex.: mensal). Mostra o valor
  total calculado (`calcularValorTotal`, ticket 03) e a prévia das Parcelas
  sugeridas (`sugerirParcelas`, ticket 03), permitindo editar manualmente o
  valor de cada Parcela antes de salvar (conforme `CONTEXT.md`: a sugestão
  de divisão igual pode ser desmarcada/editada).
- Tela "Detalhe do empréstimo": Principal, Juros, valor total, e lista de
  Parcelas com data de vencimento, valor, e status (usar `statusParcela` do
  ticket 04 para exibir "em dia"/"atrasado"; e o campo `paga` para mostrar
  "pago"). Cada Parcela tem uma ação para marcar como paga
  (`marcarParcelaPaga`, ticket 02).

## Fora de escopo

- Editar Principal/Juros depois de criado (ADR-0003: Juros são fixados na
  criação; permitir editar o Principal depois abriria a questão de
  recalcular Juros, que está fora do MVP).
- Excluir Empréstimo.

## Critérios de aceite

- Criar um Empréstimo de Principal R$ 500, Juros 10%, 3 Parcelas gera
  Parcelas somando R$ 550 com vencimentos espaçados corretamente.
- Marcar uma Parcela como paga atualiza o status na tela sem precisar sair
  e voltar (via `onSnapshot`, ver ticket 02).
- Um Empréstimo com 1 Parcela é exibido em algum lugar da UI como
  "pagamento único" (rótulo de exibição, não campo novo no banco).

## Notas de resolução

- `src/screens/emprestimos/EmprestimoFormScreen.tsx`: Principal, Juros (%),
  quantidade de Parcelas, data da primeira Parcela (texto `dd/mm/aaaa`) e
  intervalo em dias. Usa `calcularValorTotal`/`sugerirParcelas` do Contador
  para a prévia; um switch "Editar parcelas manualmente" troca os valores
  calculados por `TextInput`s editáveis por Parcela (mantendo número e data),
  com um aviso (não bloqueante) se a soma divergir do valor total após edição
  manual — a divergência é permitida de propósito (`CONTEXT.md`: a sugestão
  pode ser desmarcada e editada).
- `src/screens/emprestimos/EmprestimoDetalheScreen.tsx`: Principal, Juros,
  total e lista de Parcelas via `listarParcelas`; status via `statusParcela`
  (Contador), rótulo "Pago" sobrepõe o status quando `paga`. Rótulo
  "Pagamento único" vs. "Parcelado em Nx" aparece aqui, a partir da
  quantidade de Parcelas carregadas (não é um campo novo no domínio).
  Botão "Marcar como paga" por Parcela não paga, chamando
  `marcarParcelaPaga` (atualiza via `onSnapshot`, sem precisar recarregar a
  tela).
- `criarEmprestimo` do repositório (ticket 02, já commitado) recebe um único
  objeto `{ clienteId, principal, taxaJuros, valorTotal, parcelas }`; ajustei
  a tela a essa assinatura (documentada em `DadosNovoEmprestimo` no arquivo).
- `npx tsc --noEmit` e `npm test` passam sem erros. Validação end-to-end
  (criar Empréstimo real, ver documento no Firestore) depende de rodar o app
  com `.env` preenchido — não executada nesta sessão.
