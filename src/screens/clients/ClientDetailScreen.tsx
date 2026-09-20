import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { Loan } from '../../domain/types';
import { listLoansByClient } from '../../data/loansRepository';
import { AppButton } from '../../ui/AppButton';
import { Card } from '../../ui/Card';
import { ScreenContainer } from '../../ui/ScreenContainer';
import { useBottomListPadding } from '../../ui/useBottomListPadding';
import { colors, spacing, typography } from '../../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientDetail'>;

const currencyFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function ClientDetailScreen({ route, navigation }: Props) {
  const { client } = route.params;
  const [loans, setLoans] = useState<Loan[]>([]);
  const bottomPadding = useBottomListPadding();

  useEffect(() => listLoansByClient(client.id, setLoans), [client.id]);

  return (
    <ScreenContainer>
      <FlatList
        data={loans}
        keyExtractor={(loan) => loan.id}
        ListHeaderComponent={
          <>
            <Card style={styles.data}>
              <Text style={styles.name}>{client.name}</Text>
              {client.phone ? <Text style={styles.detailText}>{client.phone}</Text> : null}
              {client.notes ? <Text style={styles.detailText}>{client.notes}</Text> : null}
              <Pressable
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('ClientForm', { client })}
              >
                <Text style={styles.secondaryButtonText}>Editar cliente</Text>
              </Pressable>
            </Card>
            <AppButton
              title="+ Novo empréstimo"
              onPress={() => navigation.navigate('LoanForm', { clientId: client.id })}
              style={styles.newButton}
            />
            <Text style={styles.sectionTitle}>Empréstimos</Text>
          </>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('LoanDetail', { loan: item })}>
            <Card style={styles.row}>
              <View>
                <Text style={styles.rowTitle}>{currencyFormat.format(item.totalAmount)}</Text>
                <Text style={styles.rowSubtitle}>
                  Principal: {currencyFormat.format(item.principal)} · Juros: {(item.interestRate * 100).toFixed(0)}%
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Card>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum empréstimo ainda.</Text>}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  newButton: { marginBottom: spacing.lg },
  data: { marginBottom: spacing.lg },
  name: { fontSize: 22, fontWeight: '800', color: colors.text },
  detailText: { fontSize: 14, color: colors.textMuted, marginTop: spacing.xs },
  secondaryButton: { marginTop: spacing.md, alignSelf: 'flex-start' },
  secondaryButtonText: { color: colors.primary, fontWeight: '700' },
  sectionTitle: { ...typography.subtitle, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  rowSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
  arrow: { fontSize: 22, color: colors.textFaint, fontWeight: '300' },
  empty: { textAlign: 'center', marginTop: spacing.lg, color: colors.textMuted },
});
