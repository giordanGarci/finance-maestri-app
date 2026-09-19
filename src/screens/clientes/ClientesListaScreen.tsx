import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { Cliente, Emprestimo } from '../../domain/types';
import { listarClientes } from '../../data/clientesRepository';
import { listarEmprestimosPorCliente } from '../../data/emprestimosRepository';
import { signOutUser } from '../../data/auth';
import { CapitalDisponivelResumo } from '../components/CapitalDisponivelResumo';
import { AppButton } from '../../ui/AppButton';
import { Card } from '../../ui/Card';
import { ScreenContainer } from '../../ui/ScreenContainer';
import { colors, radius, spacing, typography } from '../../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientesLista'>;

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

function ClienteLinha({ cliente, onPress }: { cliente: Cliente; onPress: () => void }) {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);

  useEffect(() => listarEmprestimosPorCliente(cliente.id, setEmprestimos), [cliente.id]);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.linhaPressionada]}>
      <Card style={styles.linha}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{iniciais(cliente.nome)}</Text>
        </View>
        <View style={styles.linhaInfo}>
          <Text style={styles.nome}>{cliente.nome}</Text>
          <Text style={styles.indicador}>
            {emprestimos.length} {emprestimos.length === 1 ? 'empréstimo' : 'empréstimos'}
          </Text>
        </View>
        <Text style={styles.seta}>›</Text>
      </Card>
    </Pressable>
  );
}

export function ClientesListaScreen({ navigation }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => listarClientes(setClientes), []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.acoesHeader}>
          <Pressable onPress={() => navigation.navigate('PreferenciaAviso')} hitSlop={8}>
            <Text style={styles.acaoHeader}>Preferências</Text>
          </Pressable>
          <Pressable onPress={() => signOutUser()} hitSlop={8}>
            <Text style={styles.acaoHeader}>Sair</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <ScreenContainer>
      <FlatList
        data={clientes}
        keyExtractor={(cliente) => cliente.id}
        ListHeaderComponent={
          <>
            <CapitalDisponivelResumo />
            <Pressable style={styles.linkAportes} onPress={() => navigation.navigate('Aportes')}>
              <Text style={styles.linkAportesTexto}>Ver aportes ›</Text>
            </Pressable>
            <Text style={styles.secaoTitulo}>Clientes</Text>
          </>
        }
        renderItem={({ item }) => (
          <ClienteLinha cliente={item} onPress={() => navigation.navigate('ClienteDetalhe', { cliente: item })} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum cliente cadastrado ainda.</Text>}
        contentContainerStyle={styles.lista}
      />
      <View style={styles.rodape}>
        <AppButton title="+ Novo cliente" onPress={() => navigation.navigate('ClienteForm')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lista: { padding: spacing.lg, paddingBottom: 100 },
  acoesHeader: { flexDirection: 'row', gap: spacing.lg },
  acaoHeader: { color: colors.primary, fontWeight: '600' },
  linkAportes: { marginTop: spacing.md, marginBottom: spacing.md },
  linkAportesTexto: { color: colors.primary, fontWeight: '700' },
  secaoTitulo: { ...typography.subtitle, marginBottom: spacing.sm },
  linhaPressionada: { opacity: 0.8 },
  linha: { flexDirection: 'row', alignItems: 'center' },
  linhaInfo: { flex: 1, marginLeft: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { color: colors.primaryDark, fontWeight: '800', fontSize: 15 },
  nome: { fontSize: 16, fontWeight: '700', color: colors.text },
  indicador: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  seta: { fontSize: 22, color: colors.textFaint, fontWeight: '300' },
  vazio: { textAlign: 'center', marginTop: spacing.xl, color: colors.textMuted },
  rodape: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
  },
});
