# Repositório de dados (CRUD Firestore)

Status: resolved
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

## Comments

Implementado `src/data/uidAtual.ts` (helper compartilhado: lê
`auth.currentUser.uid`, lança erro se ninguém estiver logado — usado por
todos os repositórios abaixo em vez de exigir que cada tela passe o uid).

- `clientesRepository.ts`: `listarClientes`, `criarCliente`, `atualizarCliente`.
- `emprestimosRepository.ts`: `listarEmprestimosPorCliente`, `criarEmprestimo`
  (grava o Empréstimo e todas as Parcelas num único `writeBatch`, atômico),
  `listarParcelas`, `marcarParcelaPaga`.
- `aportesRepository.ts`: `listarAportes`, `criarAporte`.
- `preferenciasRepository.ts`: já implementado por quem pegou o ticket 08
  (`obterPreferenciaAviso`/`salvarPreferenciaAviso`); não duplicado aqui.

Decisão importante não óbvia: os escritores usam `addDoc`/`setDoc`/`writeBatch`
sobre `collection(db, ...)` **sem** o `withConverter` de `collections.ts`,
porque o campo `donoId` (usado pelas regras de segurança) não faz parte dos
tipos de domínio (`Cliente`/`Emprestimo`/`Parcela`/`Aporte` em
`src/domain/types.ts` não têm `donoId` de propósito — é um detalhe do
Firestore, não do domínio). As leituras continuam usando os converters
tipados de `collections.ts` (`clientesRef()`, `emprestimosRef()`, etc.) via
`onSnapshot`, que ignoram o campo extra `donoId` ao desserializar.

Todas as listagens filtram por `donoId == uidAtual()` nas queries (exigido
pelas regras do Firestore documentadas em `docs/agents/firebase-setup.md` —
uma query sem esse filtro é rejeitada pelo Firestore, não apenas filtrada).
Ordenação (por nome/data/número) é feita no cliente, não via `orderBy` do
Firestore, para não exigir criação manual de índice composto no console.

`DadosNovoEmprestimo.parcelas` usa o mesmo formato `{ numero, valor,
dataVencimento }` que `sugerirParcelas` (ticket 03, `src/domain/emprestimo.ts`)
já retorna — o ticket 06 pode passar o resultado direto.

Não testado contra um projeto Firebase real (sem credenciais neste
ambiente); validado só com `npx tsc --noEmit` (projeto inteiro, incluindo
os arquivos dos tickets 03/04/08 já presentes em paralelo). Teste manual
fica pendente de quem tiver o `.env` real configurado.
