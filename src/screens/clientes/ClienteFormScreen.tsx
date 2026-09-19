import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { atualizarCliente, criarCliente } from '../../data/clientesRepository';

type Props = NativeStackScreenProps<RootStackParamList, 'ClienteForm'>;

export function ClienteFormScreen({ route, navigation }: Props) {
  const clienteExistente = route.params?.cliente;
  const [nome, setNome] = useState(clienteExistente?.nome ?? '');
  const [telefone, setTelefone] = useState(clienteExistente?.telefone ?? '');
  const [observacoes, setObservacoes] = useState(clienteExistente?.observacoes ?? '');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    const nomeAparado = nome.trim();
    if (!nomeAparado) {
      Alert.alert('Nome obrigatório', 'Informe o nome do cliente.');
      return;
    }

    setSalvando(true);
    try {
      const dados = {
        nome: nomeAparado,
        telefone: telefone.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
      };
      if (clienteExistente) {
        await atualizarCliente(clienteExistente.id, dados);
      } else {
        await criarCliente(dados);
      }
      navigation.goBack();
    } catch (erro) {
      Alert.alert('Erro ao salvar', String(erro));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.rotulo}>Nome *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome do cliente" />

      <Text style={styles.rotulo}>Telefone</Text>
      <TextInput
        style={styles.input}
        value={telefone}
        onChangeText={setTelefone}
        placeholder="(opcional)"
        keyboardType="phone-pad"
      />

      <Text style={styles.rotulo}>Observações</Text>
      <TextInput
        style={[styles.input, styles.multilinha]}
        value={observacoes}
        onChangeText={setObservacoes}
        placeholder="(opcional)"
        multiline
      />

      <Pressable style={styles.botao} onPress={salvar} disabled={salvando}>
        <Text style={styles.botaoTexto}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 4 },
  rotulo: { fontSize: 13, color: '#333', marginTop: 12, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginTop: 4,
  },
  multilinha: { minHeight: 80, textAlignVertical: 'top' },
  botao: {
    marginTop: 24,
    backgroundColor: '#1565C0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botaoTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
