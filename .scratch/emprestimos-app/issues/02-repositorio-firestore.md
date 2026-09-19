# Repositório de dados (CRUD Firestore)

Status: open
Depende de: 01 (precisa do uid autenticado para preencher `donoId`)

## Contexto

`src/data/collections.ts` já modela as coleções (`clientesRef`,
`emprestimosRef`, `parcelasRef(emprestimoId)`, `aportesRef`,
`preferenciaAvisoDoc`) com converters Timestamp↔Date. Falta a camada de
funções de leitura/escrita que as telas vão chamar, para elas não
manipularem `addDoc`/`getDocs`/`onSnapshot` diretamente.

## Escopo

Criar em `src/data/` um arquivo de repositório por coleção
(`clientesRepository.ts`, `emprestimosRepository.ts`,
`aportesRepository.ts`, `preferenciasRepository.ts`) com funções como:

- `listarClientes()`, `criarCliente(dados)`, `atualizarCliente(id, dados)`
- `listarEmprestimosPorCliente(clienteId)`, `criarEmprestimo(dados)` (recebe
  o resultado já calculado do ticket 03 — este ticket não calcula juros,
  só persiste)
- `listarParcelas(emprestimoId)`, `marcarParcelaPaga(emprestimoId, parcelaId)`
- `listarAportes()`, `criarAporte(dados)`
- `obterPreferenciaAviso()`, `salvarPreferenciaAviso(dados)`

Todas as funções de criação devem preencher `donoId` a partir do usuário
autenticado (ver ticket 01).

Preferir `onSnapshot` (listener em tempo real) em vez de `getDocs` para as
listagens que aparecem em tela, já que o app é single-user mas multi-tela
(evita ter que atualizar manualmente a lista após cada escrita).

## Fora de escopo

- Paginação (volume de dados é baixo para um usuário único).
- Cache offline customizado (o SDK do Firestore já faz cache local por
  padrão).

## Critérios de aceite

- Nenhuma tela em `src/screens/` importa `firebase/firestore` diretamente;
  toda leitura/escrita passa por essas funções de repositório.
- Criar um Cliente/Empréstimo/Aporte de teste e ver o documento aparecer no
  console do Firebase com os campos e tipos esperados (Timestamp nas datas).
