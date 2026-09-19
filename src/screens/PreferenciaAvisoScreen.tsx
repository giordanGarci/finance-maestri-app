/**
 * Ainda não conectada a uma navegação (ticket 05 define as telas/rotas);
 * exportada para ser registrada quando a navegação existir.
 */
import { collectionGroup, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { parcelaConverter } from '../data/collections';
import { db } from '../data/firebaseConfig';
import { obterPreferenciaAviso, salvarPreferenciaAviso } from '../data/preferenciasRepository';
import type { PreferenciaAviso } from '../domain/types';
import { sincronizarNotificacoes } from '../notifications/agendamento';
import { solicitarPermissaoNotificacoes } from '../notifications/permissoes';

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
    <View style={styles.container}>
      <Text style={styles.label}>Avisar quantos dias antes do vencimento</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={diasAntes}
        onChangeText={setDiasAntes}
      />

      <View style={styles.linha}>
        <Text style={styles.label}>Notificações ativadas</Text>
        <Switch value={ativado} onValueChange={setAtivado} />
      </View>

      <Button title="Salvar" onPress={salvar} disabled={salvando} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, fontSize: 16 },
});
