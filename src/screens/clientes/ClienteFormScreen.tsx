import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { atualizarCliente, criarCliente } from '../../data/clientesRepository';
import { AppButton } from '../../ui/AppButton';
import { Card } from '../../ui/Card';
import { ScreenContainer } from '../../ui/ScreenContainer';
import { TextField } from '../../ui/TextField';
import { colors, spacing } from '../../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ClienteForm'>;

export function ClienteFormScreen({ route, navigation }: Props) {
  const clienteExistente = route.params?.cliente;
  const [nome, setNome] = useState(clienteExistente?.nome ?? '');
  const [telefone, setTelefone] = useState(clienteExistente?.telefone ?? '');
  const [observacoes, setObservacoes] = useState(clienteExistente?.observacoes ?? '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    const nomeAparado = nome.trim();
    if (!nomeAparado) {
      setErro('Informe o nome do cliente.');
      return;
    }

    setErro(null);
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
    } catch (erroCapturado) {
      setErro(String(erroCapturado));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <Card>
        <TextField label="Nome *" value={nome} onChangeText={setNome} placeholder="Nome do cliente" />
        <TextField
          label="Telefone"
          value={telefone}
          onChangeText={setTelefone}
          placeholder="(opcional)"
          keyboardType="phone-pad"
        />
        <TextField
          label="Observações"
          value={observacoes}
          onChangeText={setObservacoes}
          placeholder="(opcional)"
          style={styles.multilinha}
          multiline
        />
      </Card>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

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
  multilinha: { minHeight: 90, textAlignVertical: 'top' },
  erro: { color: colors.danger, marginTop: spacing.md, fontSize: 14, fontWeight: '600' },
  botao: { marginTop: spacing.lg },
});
