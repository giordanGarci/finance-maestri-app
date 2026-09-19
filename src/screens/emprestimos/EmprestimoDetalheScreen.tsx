import { useEffect, useLayoutEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { Parcela } from '../../domain/types';
import { statusParcela } from '../../domain/parcela';
import { listarParcelas, marcarParcelaPaga } from '../../data/emprestimosRepository';
import { Card } from '../../ui/Card';
import { ScreenContainer } from '../../ui/ScreenContainer';
import { colors, radius, spacing, typography } from '../../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EmprestimoDetalhe'>;

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function EmprestimoDetalheScreen({ route, navigation }: Props) {
  const { emprestimo } = route.params;
  const [parcelas, setParcelas] = useState<Parcela[]>([]);

  useEffect(() => listarParcelas(emprestimo.id, setParcelas), [emprestimo.id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('EmprestimoForm', { clienteId: emprestimo.clienteId, emprestimo })}
          hitSlop={8}
        >
          <Text style={styles.acaoHeader}>Editar</Text>
        </Pressable>
      ),
    });
  }, [navigation, emprestimo]);

  const tipoPagamento = parcelas.length === 1 ? 'Pagamento único' : `Parcelado em ${parcelas.length}x`;

  async function marcarPaga(parcelaId: string) {
    try {
      await marcarParcelaPaga(emprestimo.id, parcelaId);
    } catch (erro) {
      Alert.alert('Erro ao marcar parcela', String(erro));
    }
  }

  return (
    <ScreenContainer>
      <FlatList
        data={parcelas}
        keyExtractor={(parcela) => parcela.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <>
            <Card style={styles.resumo}>
              <View style={styles.resumoLinha}>
                <Text style={styles.resumoRotulo}>Principal</Text>
                <Text style={styles.resumoValor}>{formatoMoeda.format(emprestimo.principal)}</Text>
              </View>
              <View style={styles.resumoLinha}>
                <Text style={styles.resumoRotulo}>Juros</Text>
                <Text style={styles.resumoValor}>{(emprestimo.taxaJuros * 100).toFixed(0)}%</Text>
              </View>
              <View style={styles.separador} />
              <View style={styles.resumoLinha}>
                <Text style={styles.resumoTotalRotulo}>Total</Text>
                <Text style={styles.resumoTotal}>{formatoMoeda.format(emprestimo.valorTotal)}</Text>
              </View>
              {parcelas.length > 0 ? (
                <View style={styles.badgeTipo}>
                  <Text style={styles.badgeTipoTexto}>{tipoPagamento}</Text>
                </View>
              ) : null}
            </Card>
            <Text style={styles.secaoTitulo}>Parcelas</Text>
          </>
        }
        renderItem={({ item }) => {
          const status = statusParcela(item, new Date());
          const rotulo = item.paga ? 'Pago' : status === 'atrasado' ? 'Atrasado' : 'Em dia';
          const corStatus = item.paga ? colors.success : status === 'atrasado' ? colors.danger : colors.primary;
          const fundoStatus = item.paga ? colors.successSoft : status === 'atrasado' ? colors.dangerSoft : colors.primarySoft;
          return (
            <Card style={styles.parcelaCard}>
              <View>
                <Text style={styles.parcelaNumero}>Parcela {item.numero}</Text>
                <Text style={styles.parcelaData}>Vence em {item.dataVencimento.toLocaleDateString('pt-BR')}</Text>
                <Text style={styles.parcelaValor}>{formatoMoeda.format(item.valor)}</Text>
              </View>
              <View style={styles.parcelaAcoes}>
                <View style={[styles.statusBadge, { backgroundColor: fundoStatus }]}>
                  <Text style={[styles.status, { color: corStatus }]}>{rotulo}</Text>
                </View>
                {!item.paga ? (
                  <Pressable style={styles.botaoPagar} onPress={() => marcarPaga(item.id)}>
                    <Text style={styles.botaoPagarTexto}>Marcar como paga</Text>
                  </Pressable>
                ) : null}
              </View>
            </Card>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma parcela.</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lista: { padding: spacing.lg, paddingBottom: spacing.xxl },
  acaoHeader: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  resumo: { marginBottom: spacing.lg },
  resumoLinha: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  resumoRotulo: { ...typography.caption },
  resumoValor: { fontSize: 15, fontWeight: '600', color: colors.text },
  separador: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.sm },
  resumoTotalRotulo: { ...typography.subtitle },
  resumoTotal: { fontSize: 22, fontWeight: '800', color: colors.text },
  badgeTipo: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeTipoTexto: { color: colors.primaryDark, fontWeight: '700', fontSize: 13 },
  secaoTitulo: { ...typography.subtitle, marginBottom: spacing.sm },
  parcelaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parcelaNumero: { fontWeight: '700', color: colors.text, fontSize: 15 },
  parcelaData: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  parcelaValor: { fontWeight: '700', marginTop: 4, fontSize: 16, color: colors.text },
  parcelaAcoes: { alignItems: 'flex-end', gap: spacing.sm },
  statusBadge: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  status: { fontWeight: '700', fontSize: 12 },
  botaoPagar: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  botaoPagarTexto: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  vazio: { textAlign: 'center', marginTop: spacing.lg, color: colors.textMuted },
});
