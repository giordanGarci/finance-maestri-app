import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { Emprestimo } from '../../domain/types';
import { listarEmprestimosPorCliente } from '../../data/emprestimosRepository';

type Props = NativeStackScreenProps<RootStackParamList, 'ClienteDetalhe'>;

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function ClienteDetalheScreen({ route, navigation }: Props) {
  const { cliente } = route.params;
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);

  useEffect(() => listarEmprestimosPorCliente(cliente.id, setEmprestimos), [cliente.id]);

  return (
    <View style={styles.container}>
      <FlatList
        data={emprestimos}
        keyExtractor={(emprestimo) => emprestimo.id}
        ListHeaderComponent={
          <>
            <View style={styles.dados}>
              <Text style={styles.nome}>{cliente.nome}</Text>
              {cliente.telefone ? <Text style={styles.detalheTexto}>{cliente.telefone}</Text> : null}
              {cliente.observacoes ? <Text style={styles.detalheTexto}>{cliente.observacoes}</Text> : null}
              <Pressable
                style={styles.botaoSecundario}
                onPress={() => navigation.navigate('ClienteForm', { cliente })}
              >
                <Text style={styles.botaoSecundarioTexto}>Editar cliente</Text>
              </Pressable>
            </View>
            <Text style={styles.secaoTitulo}>Empréstimos</Text>
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.linha}
            onPress={() => navigation.navigate('EmprestimoDetalhe', { emprestimo: item })}
          >
            <Text style={styles.linhaTitulo}>{formatoMoeda.format(item.valorTotal)}</Text>
            <Text style={styles.linhaSubtitulo}>
              Principal: {formatoMoeda.format(item.principal)} · Juros: {(item.taxaJuros * 100).toFixed(0)}%
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum empréstimo ainda.</Text>}
        contentContainerStyle={styles.lista}
      />
      <Pressable
        style={styles.novoEmprestimo}
        onPress={() => navigation.navigate('EmprestimoForm', { clienteId: cliente.id })}
      >
        <Text style={styles.novoEmprestimoTexto}>+ Novo empréstimo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  lista: { paddingBottom: 96 },
  dados: { padding: 16 },
  nome: { fontSize: 20, fontWeight: '700' },
  detalheTexto: { fontSize: 14, color: '#444', marginTop: 4 },
  botaoSecundario: { marginTop: 12, alignSelf: 'flex-start' },
  botaoSecundarioTexto: { color: '#1565C0', fontWeight: '600' },
  secaoTitulo: { fontSize: 15, fontWeight: '700', marginHorizontal: 16, marginTop: 8, marginBottom: 4 },
  linha: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  linhaTitulo: { fontSize: 16, fontWeight: '600' },
  linhaSubtitulo: { fontSize: 13, color: '#555', marginTop: 2 },
  vazio: { textAlign: 'center', marginTop: 16, color: '#666' },
  novoEmprestimo: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: '#1565C0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  novoEmprestimoTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
