/**
 * Notificações locais (Expo Notifications) exigem um dispositivo real:
 * - Emulador Android padrão: não recebe notificações locais sem Google Play
 *   Services instalado.
 * - Expo Go a partir do SDK 53: suporte a notificações push foi removido e o
 *   suporte a notificações locais é limitado. Testar em build de
 *   desenvolvimento (`expo run:android` / `expo run:ios`) ou em um
 *   dispositivo físico.
 */
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

export function estaNoExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/**
 * Solicita permissão de notificação ao usuário, se ainda não concedida.
 * Retorna `false` em emulador (sem Google Play Services) sem nem chegar a
 * perguntar, já que a notificação não seria entregue de qualquer forma.
 */
export async function solicitarPermissaoNotificacoes(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  const permissaoAtual = await Notifications.getPermissionsAsync();
  if (permissaoAtual.granted) {
    return true;
  }

  const permissaoSolicitada = await Notifications.requestPermissionsAsync();
  return permissaoSolicitada.granted;
}
