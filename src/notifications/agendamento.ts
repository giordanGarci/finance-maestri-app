import * as Notifications from 'expo-notifications';
import type { Parcela, PreferenciaAviso } from '../domain/types';

const MILISSEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

function dataDoAviso(dataVencimento: Date, diasAntes: number): Date {
  return new Date(dataVencimento.getTime() - diasAntes * MILISSEGUNDOS_POR_DIA);
}

/**
 * Cancela todos os agendamentos locais existentes e recria um por Parcela
 * ainda não paga e não atrasada, disparando `diasAntes` dias antes do
 * vencimento. Chamar sempre que Parcelas ou a Preferência de aviso mudarem
 * (ver ADR-0002: os agendamentos são locais, então precisam ser corrigidos a
 * cada mudança em vez de dependerem de um backend).
 */
export async function sincronizarNotificacoes(
  parcelas: Parcela[],
  preferencia: PreferenciaAviso
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!preferencia.ativado) {
    return;
  }

  const agora = new Date();

  for (const parcela of parcelas) {
    if (parcela.paga) continue;
    if (parcela.dataVencimento.getTime() <= agora.getTime()) continue;

    const dataAviso = dataDoAviso(parcela.dataVencimento, preferencia.diasAntes);
    if (dataAviso.getTime() <= agora.getTime()) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: parcela.id,
      content: {
        title: 'Parcela vencendo',
        body: `Parcela nº ${parcela.numero} (R$ ${parcela.valor.toFixed(2)}) vence em ${preferencia.diasAntes} dia(s).`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: dataAviso,
      },
    });
  }
}
