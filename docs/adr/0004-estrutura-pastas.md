# Estrutura de pastas: app Expo na raiz do repo

O projeto Expo (TypeScript) foi inicializado diretamente na raiz de
`C:\maestri`, não num subdiretório `app/`, porque o repo já segue o layout de
"single-context" descrito em `docs/agents/domain.md` (`CONTEXT.md` e
`docs/adr/` na raiz, código em `src/`). Criar um subdiretório `app/`
duplicaria essa raiz sem necessidade, já que não há múltiplos contextos ou
múltiplos apps neste repositório.

Dentro de `src/`, o código é organizado por camada, não por feature:

- `src/domain/`: tipos e regras de negócio (Cliente, Empréstimo, Parcela,
  Aporte, cálculo de juros/capital disponível). Não conhece Firestore nem
  React.
- `src/data/`: integração com Firebase (`firebaseConfig.ts`) e modelagem das
  coleções do Firestore (`collections.ts`), incluindo os converters que
  traduzem entre `Timestamp` do Firestore e `Date` do domínio.
- `src/screens/`: telas do app, agrupadas por área (`clientes/`,
  `emprestimos/`, `aportes/`).
- `src/navigation/`: configuração de navegação entre telas.
- `src/notifications/`: agendamento de notificações locais (Expo
  Notifications, ver ADR-0002).

Alternativa considerada: organizar por feature (`src/clientes/`,
`src/emprestimos/` cada um com seus próprios tipos, dados e telas). Descartada
para o MVP porque o domínio é pequeno e compartilha bastante entre Cliente,
Empréstimo, Parcela e Aporte (ex.: capital disponível cruza Empréstimos e
Aportes); separar por camada evita duplicar esse acoplamento em múltiplas
pastas de feature.
