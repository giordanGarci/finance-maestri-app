# App de Empréstimos Pessoais

Status: em andamento

## Contexto

Ver `CONTEXT.md` (glossário) e `docs/adr/0001-stack-expo-firebase.md`,
`docs/adr/0002-notificacoes-locais.md`, `docs/adr/0003-juros-fixos-sem-mora.md`,
`docs/adr/0004-estrutura-pastas.md` na raiz do repo.

App pessoal (usuário único) para acompanhar dinheiro emprestado a terceiros:
quem deve, quanto, os Juros e a situação de pagamento das Parcelas.

## Já feito (fundação)

- Projeto Expo (React Native + TypeScript) inicializado na raiz do repo.
- Estrutura de pastas: `src/domain`, `src/data`, `src/screens/{clientes,emprestimos,aportes}`,
  `src/navigation`, `src/notifications` (ver ADR-0004).
- `src/data/firebaseConfig.ts`: inicialização do Firebase a partir de
  variáveis de ambiente `EXPO_PUBLIC_FIREBASE_*` (sem chaves reais commitadas).
- `docs/agents/firebase-setup.md`: passo a passo manual no console do
  Firebase (criar projeto, Firestore, Auth com Google, obter chaves).
- `src/domain/types.ts`: tipos de domínio (`Cliente`, `Emprestimo`, `Parcela`,
  `Aporte`, `PreferenciaAviso`) espelhando `CONTEXT.md`.
- `src/data/collections.ts`: modelagem das coleções do Firestore
  (`clientes`, `emprestimos` com subcoleção `parcelas`, `aportes`,
  documento único `config/preferenciaAviso`) com converters
  Timestamp↔Date.

## Falta fazer

Ver tickets em `.scratch/emprestimos-app/issues/`. Ordem sugerida (cada
ticket lista suas dependências na seção "Depende de"):

1. `01-autenticacao-google.md`
2. `02-repositorio-firestore.md`
3. `03-calculo-juros-parcelas.md`
4. `04-status-parcela-capital-disponivel.md`
5. `05-telas-clientes.md`
6. `06-telas-emprestimos.md`
7. `07-tela-aportes-capital-disponivel.md`
8. `08-preferencia-aviso-notificacoes.md`
