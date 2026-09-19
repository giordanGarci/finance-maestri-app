import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { Emprestimo } from '../../domain/types';
import { listarEmprestimosPorCliente } from '../../data/emprestimosRepository';
import { AppButton } from '../../ui/AppButton';
import { Card } from '../../ui/Card';
import { ScreenContainer } from '../../ui/ScreenContainer';
import { colors, spacing, typography } from '../../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ClienteDetalhe'>;

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function ClienteDetalheScreen({ route, navigation }: Props) {
  const { cliente } = route.params;
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);

  useEffect(() => listarEmprestimosPorCliente(cliente.id, setEmprestimos), [cliente.id]);

  return (
    <ScreenContainer>
      <FlatList
        data={emprestimos}
        keyExtractor={(emprestimo) => emprestimo.id}
        ListHeaderComponent={
          <>
            <Card style={styles.dados}>
              <Text style={styles.nome}>{cliente.nome}</Text>
              {cliente.telefone ? <Text style={styles.detalheTexto}>{cliente.telefone}</Text> : null}
              {cliente.observacoes ? <Text style={styles.detalheTexto}>{cliente.observacoes}</Text> : null}
              <Pressable
                style={styles.botaoSecundario}
                onPress={() => navigation.navigate('ClienteForm', { cliente })}
              >
                <Text style={styles.botaoSecundarioTexto}>Editar cliente</Text>
              </Pressable>
            </Card>
            <Text style={styles.secaoTitulo}>Empréstimos</Text>
          </>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('EmprestimoDetalhe', { emprestimo: item })}>
            <Card style={styles.linha}>
              <View>
                <Text style={styles.linhaTitulo}>{formatoMoeda.format(item.valorTotal)}</Text>
                <Text style={styles.linhaSubtitulo}>
                  Principal: {formatoMoeda.format(item.principal)} · Juros: {(item.taxaJuros * 100).toFixed(0)}%
                </Text>
              </View>
              <Text style={styles.seta}>›</Text>
            </Card>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum empréstimo ainda.</Text>}
        contentContainerStyle={styles.lista}
      />
      <View style={styles.rodape}>
        <AppButton
          title="+ Novo empréstimo"
          onPress={() => navigation.navigate('EmprestimoForm', { clienteId: cliente.id })}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lista: { padding: spacing.lg, paddingBottom: 100 },
  dados: { marginBottom: spacing.lg },
  nome: { fontSize: 22, fontWeight: '800', color: colors.text },
  detalheTexto: { fontSize: 14, color: colors.textMuted, marginTop: spacing.xs },
  botaoSecundario: { marginTop: spacing.md, alignSelf: 'flex-start' },
  botaoSecundarioTexto: { color: colors.primary, fontWeight: '700' },
  secaoTitulo: { ...typography.subtitle, marginBottom: spacing.sm },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linhaTitulo: { fontSize: 17, fontWeight: '700', color: colors.text },
  linhaSubtitulo: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
  seta: { fontSize: 22, color: colors.textFaint, fontWeight: '300' },
  vazio: { textAlign: 'center', marginTop: spacing.lg, color: colors.textMuted },
  rodape: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
  },
});
