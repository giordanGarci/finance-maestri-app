# Telas de Clientes

Status: claimed
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
