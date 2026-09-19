import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { Cliente, Emprestimo } from '../../domain/types';
import { listarClientes } from '../../data/clientesRepository';
import { listarEmprestimosPorCliente } from '../../data/emprestimosRepository';
import { signOutUser } from '../../data/auth';
import { CapitalDisponivelResumo } from '../components/CapitalDisponivelResumo';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientesLista'>;

function ClienteLinha({ cliente, onPress }: { cliente: Cliente; onPress: () => void }) {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);

  useEffect(() => listarEmprestimosPorCliente(cliente.id, setEmprestimos), [cliente.id]);

  return (
    <Pressable style={styles.linha} onPress={onPress}>
      <Text style={styles.nome}>{cliente.nome}</Text>
      <Text style={styles.indicador}>
        {emprestimos.length} {emprestimos.length === 1 ? 'empréstimo' : 'empréstimos'}
      </Text>
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
    <View style={styles.container}>
      <FlatList
        data={clientes}
        keyExtractor={(cliente) => cliente.id}
        ListHeaderComponent={
          <>
            <CapitalDisponivelResumo />
            <Pressable style={styles.linkAportes} onPress={() => navigation.navigate('Aportes')}>
              <Text style={styles.linkAportesTexto}>Ver aportes</Text>
            </Pressable>
          </>
        }
        renderItem={({ item }) => (
          <ClienteLinha cliente={item} onPress={() => navigation.navigate('ClienteDetalhe', { cliente: item })} />
        )}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum cliente cadastrado ainda.</Text>}
        contentContainerStyle={styles.lista}
      />
      <Pressable style={styles.novoCliente} onPress={() => navigation.navigate('ClienteForm')}>
        <Text style={styles.novoClienteTexto}>+ Novo cliente</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  lista: { paddingBottom: 96 },
  acoesHeader: { flexDirection: 'row', gap: 16 },
  acaoHeader: { color: '#1565C0', fontWeight: '600' },
  linkAportes: { marginHorizontal: 16, marginTop: 12, marginBottom: 4 },
  linkAportesTexto: { color: '#1565C0', fontWeight: '600' },
  linha: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  nome: { fontSize: 16, fontWeight: '600' },
  indicador: { fontSize: 13, color: '#555', marginTop: 2 },
  vazio: { textAlign: 'center', marginTop: 32, color: '#666' },
  novoCliente: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: '#1565C0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  novoClienteTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
