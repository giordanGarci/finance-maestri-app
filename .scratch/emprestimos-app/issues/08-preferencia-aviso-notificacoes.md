# Preferência de aviso e notificações locais

Status: claimed
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
