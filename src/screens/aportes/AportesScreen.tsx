import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Aporte } from '../../domain/types';
import { criarAporte, listarAportes } from '../../data/aportesRepository';
import { CapitalDisponivelResumo } from '../components/CapitalDisponivelResumo';

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function paraNumero(texto: string): number {
  const valor = Number(texto.replace(',', '.'));
  return Number.isFinite(valor) ? valor : 0;
}

export function AportesScreen() {
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [valorTexto, setValorTexto] = useState('');
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => listarAportes(setAportes), []);

  async function registrarAporte() {
    const valor = paraNumero(valorTexto);
    if (valor <= 0) {
      Alert.alert('Valor inválido', 'Informe um valor de aporte maior que zero.');
      return;
    }
    setSalvando(true);
    try {
      await criarAporte({ valor, observacao: observacao.trim() || undefined });
      setValorTexto('');
      setObservacao('');
    } catch (erro) {
      Alert.alert('Erro ao registrar aporte', String(erro));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={aportes}
        keyExtractor={(aporte) => aporte.id}
        ListHeaderComponent={
          <>
            <CapitalDisponivelResumo />
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Valor do aporte (R$)"
                keyboardType="decimal-pad"
                value={valorTexto}
                onChangeText={setValorTexto}
              />
              <TextInput
                style={styles.input}
                placeholder="Observação (opcional)"
                value={observacao}
                onChangeText={setObservacao}
              />
              <Pressable style={styles.botao} onPress={registrarAporte} disabled={salvando}>
                <Text style={styles.botaoTexto}>{salvando ? 'Registrando...' : 'Registrar aporte'}</Text>
              </Pressable>
            </View>
            <Text style={styles.secaoTitulo}>Histórico</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.linha}>
            <Text style={styles.linhaValor}>{formatoMoeda.format(item.valor)}</Text>
            <Text style={styles.linhaData}>{item.data.toLocaleDateString('pt-BR')}</Text>
            {item.observacao ? <Text style={styles.linhaObs}>{item.observacao}</Text> : null}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum aporte registrado ainda.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  form: { paddingHorizontal: 16, marginTop: 16, gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  botao: { backgroundColor: '#1565C0', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  botaoTexto: { color: '#fff', fontWeight: '700' },
  secaoTitulo: { fontSize: 15, fontWeight: '700', marginHorizontal: 16, marginTop: 20, marginBottom: 4 },
  linha: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  linhaValor: { fontSize: 16, fontWeight: '600' },
  linhaData: { fontSize: 13, color: '#555', marginTop: 2 },
  linhaObs: { fontSize: 13, color: '#777', marginTop: 2 },
  vazio: { textAlign: 'center', marginTop: 16, color: '#666' },
});
