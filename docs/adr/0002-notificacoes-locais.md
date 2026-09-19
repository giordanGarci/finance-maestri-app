# Notificações locais no aparelho, sem push via nuvem

As notificações de vencimento de Parcela são agendadas localmente no dispositivo (via Expo Notifications) em vez de push disparado por um backend na nuvem. Isso evita manter uma função agendada rodando 24/7 só pra um usuário, ao custo de depender de o app ser aberto de vez em quando para manter os agendamentos atualizados corretamente (reagendar quando datas mudam).
