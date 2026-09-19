# Telas de Clientes

Status: resolved
Depende de: 01 (autenticação), 02 (repositório Firestore)

## Contexto

Ver `CONTEXT.md`, termo **Cliente**: pessoa física para quem o dinheiro é
emprestado, pode ter múltiplos Empréstimos ativos simultaneamente com
histórico acumulado.

Este é o primeiro ticket de UI: também é responsável por montar a
navegação principal do app (`src/navigation/`), já que precisa de pelo
menos duas telas (lista e detalhe) navegáveis.

## Escopo

- `src/navigation/`: stack de navegação principal (ex.: `@react-navigation/native`
  + `@react-navigation/native-stack` — avaliar se instala ou usa o roteador
  do próprio Expo Router; registrar a escolha como ADR se for uma decisão
  não trivial). Deve encaixar a tela de login (ticket 01) e as telas deste
  ticket e do ticket 06.
- Tela "Lista de clientes": nome + indicador simples (ex.: quantidade de
  Empréstimos ativos). Usa `listarClientes()` do ticket 02.
- Tela "Novo/editar cliente": formulário com nome (obrigatório), telefone e
  observações (opcionais).
- Tela "Detalhe do cliente": dados do cliente + lista dos Empréstimos dele
  (usa `listarEmprestimosPorCliente`, do ticket 02) com um botão para criar
  novo Empréstimo para esse Cliente (abre o fluxo do ticket 06).

## Fora de escopo

- Busca/filtro de clientes (lista simples é suficiente para o volume de
  dados de um usuário único).
- Exclusão de cliente (não pedido; se um cliente tiver Empréstimos, exigiria
  decidir o que fazer com eles — deixar para um ticket futuro se for
  necessário).

## Critérios de aceite

- Dá para criar um Cliente, ver ele na lista, abrir o detalhe e editar nome/
  telefone/observações.
- O detalhe do cliente mostra os Empréstimos dele (vazio é um estado válido
  para cliente novo).

## Notas de resolução

- Navegação: `@react-navigation/native` + `@react-navigation/native-stack`
  (instalados via `npx expo install`), não Expo Router — decisão registrada
  em `docs/adr/0005-navegacao-react-navigation.md` (Expo Router pediria uma
  pasta `app/` que conflita com a estrutura fixada na ADR-0004). A troca
  entre login e a stack autenticada continua em `App.tsx` (ticket 01), fora
  da stack; a stack em si vive em `src/navigation/RootNavigator.tsx` com as
  rotas `ClientesLista`, `ClienteForm`, `ClienteDetalhe`, `EmprestimoForm`,
  `EmprestimoDetalhe`, `Aportes` e `PreferenciaAviso` (ver nota do ticket 08
  abaixo).
- Telas: `src/screens/clientes/ClientesListaScreen.tsx`,
  `ClienteFormScreen.tsx`, `ClienteDetalheScreen.tsx`. Edição de cliente
  recebe o `Cliente` completo via parâmetro de navegação (a lista/detalhe já
  tem o objeto em mãos), evitando depender de um `obterCliente(id)` que não
  existe no repositório.
- `ClientesListaScreen` mostra o resumo de Capital disponível no topo (ver
  ticket 07) e um link para a tela de Aportes.
- Ticket 08 (Sentinela) tinha deixado `src/screens/PreferenciaAvisoScreen.tsx`
  pronta mas sem rota; registrei-a na stack e adicionei um atalho
  "Preferências" no cabeçalho da lista de clientes, ao lado de "Sair" (que
  antes vivia solto em `App.tsx`).
- `npx tsc --noEmit` e `npm test` passam sem erros.
