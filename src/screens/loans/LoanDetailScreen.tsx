import { useEffect, useLayoutEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { Installment } from '../../domain/types';
import { installmentStatus } from '../../domain/installment';
import { listInstallments, markInstallmentPaid, watchLoan } from '../../data/loansRepository';
import { Card } from '../../ui/Card';
import { ScreenContainer } from '../../ui/ScreenContainer';
import { colors, radius, spacing, typography } from '../../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'LoanDetail'>;

const currencyFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function LoanDetailScreen({ route, navigation }: Props) {
  const { loan: initialLoan } = route.params;
  const [loan, setLoan] = useState(initialLoan);
  const [installments, setInstallments] = useState<Installment[]>([]);

  useEffect(
    () => watchLoan(initialLoan.id, (updated) => updated && setLoan(updated)),
    [initialLoan.id]
  );

  useEffect(() => listInstallments(loan.id, setInstallments), [loan.id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('LoanForm', { clientId: loan.clientId, loan })}
          hitSlop={8}
        >
          <Text style={styles.headerAction}>Edit</Text>
        </Pressable>
      ),
    });
  }, [navigation, loan]);

  const paymentType = installments.length === 1 ? 'Single payment' : `Split into ${installments.length}x`;

  async function markPaid(installmentId: string) {
    try {
      await markInstallmentPaid(loan.id, installmentId);
    } catch (error) {
      Alert.alert('Error marking installment', String(error));
    }
  }

  return (
    <ScreenContainer>
      <FlatList
        data={installments}
        keyExtractor={(installment) => installment.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <Card style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Principal</Text>
                <Text style={styles.summaryValue}>{currencyFormat.format(loan.principal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Interest</Text>
                <Text style={styles.summaryValue}>{(loan.interestRate * 100).toFixed(0)}%</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotal}>{currencyFormat.format(loan.totalAmount)}</Text>
              </View>
              {installments.length > 0 ? (
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{paymentType}</Text>
                </View>
              ) : null}
            </Card>
            <Text style={styles.sectionTitle}>Installments</Text>
          </>
        }
        renderItem={({ item }) => {
          const status = installmentStatus(item, new Date());
          const label = item.paid ? 'Paid' : status === 'overdue' ? 'Overdue' : 'On time';
          const statusColor = item.paid ? colors.success : status === 'overdue' ? colors.danger : colors.primary;
          const statusBg = item.paid ? colors.successSoft : status === 'overdue' ? colors.dangerSoft : colors.primarySoft;
          return (
            <Card style={styles.installmentCard}>
              <View>
                <Text style={styles.installmentNumber}>Installment {item.number}</Text>
                <Text style={styles.installmentDate}>Due {item.dueDate.toLocaleDateString('pt-BR')}</Text>
                <Text style={styles.installmentAmount}>{currencyFormat.format(item.amount)}</Text>
              </View>
              <View style={styles.installmentActions}>
                <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                  <Text style={[styles.status, { color: statusColor }]}>{label}</Text>
                </View>
                {!item.paid ? (
                  <Pressable style={styles.payButton} onPress={() => markPaid(item.id)}>
                    <Text style={styles.payButtonText}>Mark as paid</Text>
                  </Pressable>
                ) : null}
              </View>
            </Card>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<Text style={styles.empty}>No installments.</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerAction: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  summary: { marginBottom: spacing.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { ...typography.caption },
  summaryValue: { fontSize: 15, fontWeight: '600', color: colors.text },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.sm },
  summaryTotalLabel: { ...typography.subtitle },
  summaryTotal: { fontSize: 22, fontWeight: '800', color: colors.text },
  typeBadge: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  typeBadgeText: { color: colors.primaryDark, fontWeight: '700', fontSize: 13 },
  sectionTitle: { ...typography.subtitle, marginBottom: spacing.sm },
  installmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  installmentNumber: { fontWeight: '700', color: colors.text, fontSize: 15 },
  installmentDate: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  installmentAmount: { fontWeight: '700', marginTop: 4, fontSize: 16, color: colors.text },
  installmentActions: { alignItems: 'flex-end', gap: spacing.sm },
  statusBadge: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  status: { fontWeight: '700', fontSize: 12 },
  payButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  payButtonText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  empty: { textAlign: 'center', marginTop: spacing.lg, color: colors.textMuted },
});
