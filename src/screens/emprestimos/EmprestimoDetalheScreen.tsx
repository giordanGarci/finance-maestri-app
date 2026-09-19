import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { Parcela } from '../../domain/types';
import { statusParcela } from '../../domain/parcela';
import { listarParcelas, marcarParcelaPaga } from '../../data/emprestimosRepository';

type Props = NativeStackScreenProps<RootStackParamList, 'EmprestimoDetalhe'>;

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function EmprestimoDetalheScreen({ route }: Props) {
  const { emprestimo } = route.params;
  const [parcelas, setParcelas] = useState<Parcela[]>([]);

  useEffect(() => listarParcelas(emprestimo.id, setParcelas), [emprestimo.id]);

  const tipoPagamento = parcelas.length === 1 ? 'Pagamento único' : `Parcelado em ${parcelas.length}x`;

  async function marcarPaga(parcelaId: string) {
    try {
      await marcarParcelaPaga(emprestimo.id, parcelaId);
    } catch (erro) {
      Alert.alert('Erro ao marcar parcela', String(erro));
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={parcelas}
        keyExtractor={(parcela) => parcela.id}
        ListHeaderComponent={
          <View style={styles.resumo}>
            <Text style={styles.resumoLinha}>Principal: {formatoMoeda.format(emprestimo.principal)}</Text>
            <Text style={styles.resumoLinha}>Juros: {(emprestimo.taxaJuros * 100).toFixed(0)}%</Text>
            <Text style={styles.resumoTotal}>Total: {formatoMoeda.format(emprestimo.valorTotal)}</Text>
            {parcelas.length > 0 ? <Text style={styles.tipo}>{tipoPagamento}</Text> : null}
            <Text style={styles.secaoTitulo}>Parcelas</Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = statusParcela(item, new Date());
          const rotulo = item.paga ? 'Pago' : status === 'atrasado' ? 'Atrasado' : 'Em dia';
          const corStatus = item.paga ? '#2E7D32' : status === 'atrasado' ? '#C62828' : '#1565C0';
          return (
            <View style={styles.parcelaLinha}>
              <View>
                <Text style={styles.parcelaNumero}>Parcela {item.numero}</Text>
                <Text style={styles.parcelaData}>Vence em {item.dataVencimento.toLocaleDateString('pt-BR')}</Text>
                <Text style={styles.parcelaValor}>{formatoMoeda.format(item.valor)}</Text>
              </View>
              <View style={styles.parcelaAcoes}>
                <Text style={[styles.status, { color: corStatus }]}>{rotulo}</Text>
                {!item.paga ? (
                  <Pressable style={styles.botaoPagar} onPress={() => marcarPaga(item.id)}>
                    <Text style={styles.botaoPagarTexto}>Marcar como paga</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma parcela.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  resumo: { padding: 16 },
  resumoLinha: { fontSize: 14, color: '#444' },
  resumoTotal: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  tipo: { fontSize: 13, color: '#1565C0', fontWeight: '600', marginTop: 4 },
  secaoTitulo: { fontSize: 15, fontWeight: '700', marginTop: 16 },
  parcelaLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  parcelaNumero: { fontWeight: '600' },
  parcelaData: { color: '#555', fontSize: 13, marginTop: 2 },
  parcelaValor: { fontWeight: '600', marginTop: 2 },
  parcelaAcoes: { alignItems: 'flex-end', gap: 6 },
  status: { fontWeight: '700', fontSize: 13 },
  botaoPagar: {
    borderWidth: 1,
    borderColor: '#1565C0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  botaoPagarTexto: { color: '#1565C0', fontWeight: '600', fontSize: 12 },
  vazio: { textAlign: 'center', marginTop: 16, color: '#666' },
});
