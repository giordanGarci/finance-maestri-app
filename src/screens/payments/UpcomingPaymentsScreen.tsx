import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { installmentStatus } from '../../domain/installment';
import { useUpcomingInstallments, type UpcomingInstallment } from '../hooks/useUpcomingInstallments';
import { Card } from '../../ui/Card';
import { ScreenContainer } from '../../ui/ScreenContainer';
import { useBottomListPadding } from '../../ui/useBottomListPadding';
import { colors, radius, spacing, typography } from '../../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'UpcomingPayments'>;

type SortMode = 'date' | 'amount';

const currencyFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function sortUpcoming(items: UpcomingInstallment[], sortMode: SortMode): UpcomingInstallment[] {
  const sorted = [...items];
  if (sortMode === 'date') {
    sorted.sort((a, b) => a.installment.dueDate.getTime() - b.installment.dueDate.getTime());
  } else {
    sorted.sort((a, b) => b.installment.amount - a.installment.amount);
  }
  return sorted;
}

export function UpcomingPaymentsScreen({ navigation }: Props) {
  const upcoming = useUpcomingInstallments();
  const [sortMode, setSortMode] = useState<SortMode>('date');
  const bottomPadding = useBottomListPadding();

  const sorted = useMemo(() => sortUpcoming(upcoming ?? [], sortMode), [upcoming, sortMode]);

  return (
    <ScreenContainer>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.installment.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
        ListHeaderComponent={
          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, sortMode === 'date' && styles.tabActive]}
              onPress={() => setSortMode('date')}
            >
              <Text style={[styles.tabText, sortMode === 'date' && styles.tabTextActive]}>
                Vencimento mais próximo
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, sortMode === 'amount' && styles.tabActive]}
              onPress={() => setSortMode('amount')}
            >
              <Text style={[styles.tabText, sortMode === 'amount' && styles.tabTextActive]}>Maior valor</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const status = installmentStatus(item.installment, new Date());
          const overdue = status === 'overdue';
          const statusColor = overdue ? colors.danger : colors.primary;
          const statusBg = overdue ? colors.dangerSoft : colors.primarySoft;
          return (
            <Pressable onPress={() => navigation.navigate('LoanDetail', { loan: item.loan })}>
              <Card style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.clientName}>{item.clientName}</Text>
                  <Text style={styles.installmentInfo}>
                    Parcela {item.installment.number} · Vence em{' '}
                    {item.installment.dueDate.toLocaleDateString('pt-BR')}
                  </Text>
                  <Text style={styles.amount}>{currencyFormat.format(item.installment.amount)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {overdue ? 'Atrasado' : 'Em dia'}
                  </Text>
                </View>
              </Card>
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          upcoming === null ? null : <Text style={styles.empty}>Nenhum pagamento pendente.</Text>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.surface,
  },
  tabText: { fontWeight: '700', fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  tabTextActive: { color: colors.primaryDark },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowInfo: { flex: 1, marginRight: spacing.sm },
  clientName: { ...typography.subtitle, fontSize: 16 },
  installmentInfo: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
  amount: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: 4 },
  statusBadge: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  statusText: { fontWeight: '700', fontSize: 12 },
  empty: { textAlign: 'center', marginTop: spacing.xl, color: colors.textMuted },
});
