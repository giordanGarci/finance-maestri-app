/**
 * Notificações locais (Expo Notifications) exigem um dispositivo real:
 * - Emulador Android padrão: não recebe notificações locais sem Google Play
 *   Services instalado.
 * - Expo Go no Android a partir do SDK 53: o suporte a push foi removido, e
 *   o próprio `import` estático de `expo-notifications` dispara
 *   `warnOfExpoGoPushUsage`/`addPushTokenListener` internamente e derruba o
 *   app inteiro com "[runtime not ready]" no startup — mesmo só usando
 *   agendamento local, sem nada de push. Por isso este módulo (e
 *   `agendamento.ts`) nunca importa `expo-notifications` no topo do
 *   arquivo, só via `import()` dinâmico, sempre depois de checar
 *   `estaNoExpoGo()`. Funciona normalmente num development build
 *   (`expo run:android` / `expo run:ios`, ou EAS Build de development, que
 *   continua gratuito) ou em dispositivo físico fora do Expo Go.
 */
import Constants from 'expo-constants';
import * as Device from 'expo-device';

export function estaNoExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/**
 * Solicita permissão de notificação ao usuário, se ainda não concedida.
 * Retorna `false` sem perguntar nada quando não há como entregar a
 * notificação: Expo Go no Android, ou emulador sem Google Play Services.
 */
export async function solicitarPermissaoNotificacoes(): Promise<boolean> {
  if (estaNoExpoGo() || !Device.isDevice) {
    return false;
  }

  const Notifications = await import('expo-notifications');

  const permissaoAtual = await Notifications.getPermissionsAsync();
  if (permissaoAtual.granted) {
    return true;
  }

  const permissaoSolicitada = await Notifications.requestPermissionsAsync();
  return permissaoSolicitada.granted;
}
