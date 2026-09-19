# Preferência de aviso e notificações locais

Status: resolved
Depende de: 02 (repositório Firestore, para `preferenciasRepository`), 06 (precisa que Parcelas já existam para ter algo a notificar)

## Contexto

Ver `CONTEXT.md`, termo **Preferência de aviso**, e
`docs/adr/0002-notificacoes-locais.md`: as notificações são agendadas
localmente no aparelho via Expo Notifications, não por push de um backend.
Isso significa que os agendamentos precisam ser recriados/corrigidos
sempre que o app abre e sempre que uma Parcela muda de data (a ADR aceita
esse custo deliberadamente).

`expo-notifications`, `expo-device` e `expo-constants` já estão instalados
(`package.json`).

## Escopo

- `src/notifications/`: 
  - `permissoes.ts`: solicitar permissão de notificação (via
    `expo-notifications`; lembrar que notificações locais não funcionam no
    emulador Android padrão sem Google Play Services / e têm suporte
    limitado no Expo Go a partir do SDK 53 — testar em build de
    desenvolvimento ou dispositivo físico, documentar isso no arquivo).
  - `agendamento.ts`: função `sincronizarNotificacoes(parcelas: Parcela[], preferencia: PreferenciaAviso)`
    que cancela todos os agendamentos locais existentes
    (`cancelAllScheduledNotificationsAsync`) e recria um agendamento por
    Parcela não paga e não atrasada, disparando `diasAntes` dias antes da
    `dataVencimento`, só se `preferencia.ativado`.
- Tela "Preferência de aviso": campo numérico `diasAntes` e switch
  `ativado`, salvando via `preferenciasRepository` (ticket 02) e chamando
  `sincronizarNotificacoes` depois de salvar.
- Chamar `sincronizarNotificacoes` também ao abrir o app (depois do login)
  e depois de qualquer mudança em Parcelas (criar Empréstimo, marcar
  Parcela como paga), para manter os agendamentos coerentes com o estado
  atual, conforme a ADR-0002.

## Fora de escopo

- Push remoto/notificações quando o app está desinstalado ou o telefone
  desligado (explicitamente descartado pela ADR-0002).
- Notificação para Parcelas já atrasadas (o aviso é preventivo, antes do
  vencimento; uma Parcela atrasada já é visível na tela do Empréstimo via
  ticket 06/04).

## Critérios de aceite

- Com a preferência em "3 dias antes" e uma Parcela vencendo em 5 dias,
  existe uma notificação local agendada para dentro de 2 dias.
- Marcar essa Parcela como paga remove a notificação agendada para ela.
- Desativar a preferência (`ativado = false`) cancela todos os
  agendamentos.

## Notas de resolução

Tickets 02 e 06 ainda estavam `open` (sem `preferenciasRepository` nem
telas de Empréstimos/navegação) no momento da implementação, então:

- `src/notifications/permissoes.ts`: `solicitarPermissaoNotificacoes()` +
  aviso documentado sobre emulador/Expo Go.
- `src/notifications/agendamento.ts`: `sincronizarNotificacoes(parcelas, preferencia)`
  exatamente como especificado.
- `src/notifications/useSincronizarNotificacoes.ts`: hook que escuta todas
  as Parcelas (via `collectionGroup(db, 'parcelas')`, já que é subcoleção)
  e a Preferência de aviso via `onSnapshot`, e chama `sincronizarNotificacoes`
  a cada mudança em qualquer uma delas. Isso cobre "abrir o app" e "qualquer
  mudança em Parcelas" (criar Empréstimo, marcar paga) sem precisar de call
  sites espalhados pelas telas dos tickets 01/06. Ticket 01 terminou durante
  esta sessão e já criou `App.tsx`, então conectei
  `useSincronizarNotificacoes(!!user)` lá (recebe um `ativo` para não tentar
  ler `parcelas`/`config` antes do login, já que as regras do Firestore
  exigem `request.auth != null`). Quando a navegação principal do ticket 05
  substituir essa tela raiz provisória, o hook precisa continuar montado
  acima da navegação (ou em algum componente que sempre renderiza logado).
- `src/data/preferenciasRepository.ts`: implementei só a fatia
  `obterPreferenciaAviso`/`salvarPreferenciaAviso` (nomes conforme o
  ticket 02), usando `onSnapshot`/`setDoc` sobre `preferenciaAvisoDoc()`.
  Os repositórios de clientes/empréstimos/aportes continuam em aberto para
  o ticket 02.
- `src/screens/PreferenciaAvisoScreen.tsx`: campo `diasAntes` + switch
  `ativado`; ao salvar, persiste a preferência, pede permissão de
  notificação se `ativado`, busca as Parcelas atuais (`getDocs` sobre o
  mesmo `collectionGroup`) e chama `sincronizarNotificacoes` diretamente
  (redundante com o hook quando ele estiver montado, mas mantém a tela
  funcional sozinha antes disso). **Falta**: não está registrada em
  nenhuma navegação ainda — ticket 05 (navegação) está `claimed` mas não
  resolvido no momento desta implementação; quem terminá-lo precisa
  adicionar uma rota para `PreferenciaAvisoScreen` (ex.: numa tela de
  configurações).
- `npx tsc --noEmit` passa sem erros. Não há suíte de testes no projeto
  ainda; validação manual dos critérios de aceite depende de build de
  desenvolvimento em dispositivo físico (ver `permissoes.ts`) e de haver
  Empréstimos/Parcelas reais no Firestore (tickets 02/03/06), então não
  pude validar os critérios de aceite end-to-end nesta sessão.

## Correção: crash no startup no Expo Go (Android)

Bug reportado pelo usuário testando em Android via Expo Go: o app quebrava
no boot com `[runtime not ready]: Android Push notifications... removed
from Expo Go`. Causa: `agendamento.ts` importava `expo-notifications`
estaticamente no topo do arquivo; esse import por si só dispara
`warnOfExpoGoPushUsage`/`addPushTokenListener` internamente na lib e
derruba o app no Expo Go a partir do SDK 53 — mesmo o código só usando
agendamento local, nunca push. `useSincronizarNotificacoes.ts` importava
`agendamento.ts` incondicionalmente, e `App.tsx` chama
`useSincronizarNotificacoes` sem guarda nenhuma, então o crash acontecia
sempre, mesmo deslogado. `estaNoExpoGo()` já existia em `permissoes.ts` mas
não era usada em lugar nenhum para evitar isso.

Correção aplicada:

- `permissoes.ts` e `agendamento.ts` não importam mais
  `expo-notifications` no topo do arquivo — só via `import('expo-notifications')`
  dinâmico, e só depois de checar `estaNoExpoGo()`. Assim o módulo nem
  chega a ser avaliado no Expo Go.
- `sincronizarNotificacoes` e `solicitarPermissaoNotificacoes` viram no-op
  (retornam sem fazer nada / `false`) quando `estaNoExpoGo()`, em vez de
  quebrar.
- `useSincronizarNotificacoes` também checa `estaNoExpoGo()` antes de
  montar os listeners do Firestore (evita escutar `parcelas`/`config` só
  para chamar uma sincronização que ia ignorar tudo mesmo).
- `PreferenciaAvisoScreen` mostra um aviso quando `estaNoExpoGo()`
  explicando que a preferência é salva normalmente, mas os agendamentos só
  funcionam num development build.
- `docs/agents/firebase-setup.md` ganhou uma seção "Notificações locais
  exigem development build, não Expo Go" com o comando (`expo run:android`
  / `expo run:ios` ou `eas build --profile development`, que continua
  gratuito).

O restante do app (clientes, empréstimos, capital disponível) não é afetado
por esse import — nenhum outro módulo importa `expo-notifications`.
`npx tsc --noEmit` e `npm test` (vitest, 12 testes) passam.
