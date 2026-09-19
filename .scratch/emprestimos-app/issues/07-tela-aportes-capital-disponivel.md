# Tela de Aportes e Capital disponível

Status: resolved
Depende de: 02 (repositório Firestore), 04 (cálculo de capital disponível), 05 (navegação)

## Contexto

Ver `CONTEXT.md`, termos **Aporte** e **Capital disponível**. Aporte é
dinheiro que o usuário adiciona ao Capital disponível fora do ciclo de
Empréstimos/Parcelas. Capital disponível é sempre derivado, nunca editado
diretamente.

## Escopo

- Tela "Aportes": lista de Aportes (valor, data, observação) + botão para
  registrar novo Aporte (valor obrigatório, data default hoje, observação
  opcional). Usa `listarAportes`/`criarAporte` do ticket 02.
- Um indicador de Capital disponível visível nessa tela (e idealmente
  também na tela inicial/lista de clientes do ticket 05, como um resumo no
  topo). Usa `calcularCapitalDisponivel` do ticket 04, alimentado pelos
  dados carregados de `aportes`, `emprestimos` e todas as `parcelas` de
  todos os empréstimos.

## Fora de escopo

- Editar/excluir Aporte lançado por erro (não pedido; se necessário depois,
  tratar como um Aporte negativo é mais simples que permitir edição
  retroativa).

## Critérios de aceite

- Registrar um Aporte de R$ 200 aumenta o Capital disponível exibido em
  R$ 200 imediatamente.
- O Capital disponível exibido nunca tem um campo de edição direta — é
  sempre texto/label calculado.

## Notas de resolução

- `src/screens/aportes/AportesScreen.tsx`: lista de Aportes (valor, data,
  observação) + formulário (valor obrigatório, data sempre hoje via
  `criarAporte` do repositório, observação opcional). Sem edição/exclusão,
  conforme "fora de escopo".
- Capital disponível: `src/screens/hooks/useCapitalDisponivel.ts` +
  `src/screens/components/CapitalDisponivelResumo.tsx`, reaproveitado na
  tela de Aportes e no topo da lista de Clientes (ticket 05), sempre como
  texto calculado, nunca editável.
- Gap encontrado: o repositório (ticket 02) só expõe
  `listarEmprestimosPorCliente(clienteId)` e `listarParcelas(emprestimoId)`,
  sem uma leitura global. Em vez de pedir uma mudança no Firestore/regras de
  segurança para o Alicerce, `useCapitalDisponivel` agrega client-side:
  todos os Clientes -> Empréstimos de cada um -> Parcelas de cada Empréstimo
  -> `calcularCapitalDisponivel` (Contador). Aceitável para o volume de um
  usuário único (mesmo racional do "fora de escopo: paginação" dos tickets
  02/04). Combinado com a coordenação do time (ver comentário abaixo).
- `npx tsc --noEmit` e `npm test` passam sem erros. Validação end-to-end do
  critério de aceite (aporte de R$ 200 refletido imediatamente) depende de
  rodar o app com Firestore real — não executada nesta sessão.

## Comments

- Vitrine: sinalizei ao time (via `Claude Code`) que faltava leitura global
  de Empréstimos/Parcelas para o Capital disponível, e optei por resolver
  agregando client-side em vez de pedir mudança no repositório/regras de
  segurança agora. Se o volume de dados crescer o suficiente para isso pesar,
  vale reconsiderar um `listarTodasParcelas` via `collectionGroup` (o padrão
  já existe em `src/notifications/useSincronizarNotificacoes.ts`, que faz
  exatamente isso para outro fim).
