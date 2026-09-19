/**
 * Ainda não conectada a uma navegação (ticket 05 define as telas/rotas);
 * exportada para ser registrada quando a navegação existir.
 */
import { collectionGroup, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { parcelaConverter } from '../data/collections';
import { db } from '../data/firebaseConfig';
import { obterPreferenciaAviso, salvarPreferenciaAviso } from '../data/preferenciasRepository';
import type { PreferenciaAviso } from '../domain/types';
import { sincronizarNotificacoes } from '../notifications/agendamento';
import { estaNoExpoGo, solicitarPermissaoNotificacoes } from '../notifications/permissoes';
import { AppButton } from '../ui/AppButton';
import { Card } from '../ui/Card';
import { ScreenContainer } from '../ui/ScreenContainer';
import { TextField } from '../ui/TextField';
import { colors, spacing, typography } from '../ui/theme';

export default function PreferenciaAvisoScreen() {
  const [diasAntes, setDiasAntes] = useState('3');
  const [ativado, setAtivado] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    return obterPreferenciaAviso((preferencia) => {
      setDiasAntes(String(preferencia.diasAntes));
      setAtivado(preferencia.ativado);
    });
  }, []);

  async function salvar() {
    const preferencia: PreferenciaAviso = {
      diasAntes: Math.max(0, Number.parseInt(diasAntes, 10) || 0),
      ativado,
    };

    setSalvando(true);
    try {
      await salvarPreferenciaAviso(preferencia);

      if (preferencia.ativado && !(await solicitarPermissaoNotificacoes())) {
        return;
      }

      const parcelas = await getDocs(
        collectionGroup(db, 'parcelas').withConverter(parcelaConverter)
      );
      await sincronizarNotificacoes(
        parcelas.docs.map((doc) => doc.data()),
        preferencia
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScreenContainer scroll>
      {estaNoExpoGo() && (
        <Card style={styles.avisoCard}>
          <Text style={styles.aviso}>
            Notificações exigem um development build, não funcionam no Expo Go (Android, a partir do SDK 53). A
            preferência é salva normalmente, mas os agendamentos só passam a funcionar rodando `expo run:android` /
            `expo run:ios` ou um build de desenvolvimento do EAS.
          </Text>
        </Card>
      )}

      <Card>
        <TextField
          label="Avisar quantos dias antes do vencimento"
          keyboardType="number-pad"
          value={diasAntes}
          onChangeText={setDiasAntes}
        />

        <View style={styles.linha}>
          <Text style={styles.label}>Notificações ativadas</Text>
          <Switch
            value={ativado}
            onValueChange={setAtivado}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
      </Card>

      <AppButton
        title={salvando ? 'Salvando...' : 'Salvar'}
        onPress={salvar}
        disabled={salvando}
        loading={salvando}
        style={styles.botao}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  avisoCard: { backgroundColor: colors.warningSoft, marginBottom: spacing.md },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  label: { ...typography.body, fontWeight: '600' },
  aviso: { fontSize: 13, color: colors.warning, lineHeight: 18 },
  botao: { marginTop: spacing.lg },
});
