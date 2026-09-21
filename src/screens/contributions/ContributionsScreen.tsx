import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Contribution, Withdrawal } from '../../domain/types';
import { createContribution, listContributions } from '../../data/contributionsRepository';
import { createWithdrawal, listWithdrawals } from '../../data/withdrawalsRepository';
import { AvailableCapitalSummary } from '../components/AvailableCapitalSummary';
import { useClientLoansData } from '../hooks/useClientLoansData';
import { AppButton } from '../../ui/AppButton';
import { Card } from '../../ui/Card';
import { ScreenContainer } from '../../ui/ScreenContainer';
import { TextField } from '../../ui/TextField';
import { useBottomListPadding } from '../../ui/useBottomListPadding';
import { colors, radius, spacing, typography } from '../../ui/theme';

const currencyFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** The register form only ever creates these two kinds; Loan/Payment are read-only history entries. */
type RegisterKind = 'contribution' | 'withdrawal';
type MovementKind = RegisterKind | 'loan' | 'payment';

const MOVEMENT_LABEL: Record<MovementKind, string> = {
  contribution: 'Aporte',
  withdrawal: 'Retirada',
  loan: 'Empréstimo concedido',
  payment: 'Pagamento recebido',
};

interface Movement {
  id: string;
  kind: MovementKind;
  amount: number;
  date: Date;
  note?: string;
}

function toNumber(text: string): number {
  const value = Number(text.replace(',', '.'));
  return Number.isFinite(value) ? value : 0;
}

export function ContributionsScreen() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const loansData = useClientLoansData();
  const bottomPadding = useBottomListPadding();
  const [kind, setKind] = useState<RegisterKind>('contribution');
  const [amountText, setAmountText] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => listContributions(setContributions), []);
  useEffect(() => listWithdrawals(setWithdrawals), []);

  const movements = useMemo<Movement[]>(() => {
    const loans = loansData?.loans ?? [];
    const installments = loansData?.installments ?? [];
    const clientById = loansData?.clientById ?? {};
    const loanById = new Map(loans.map((loan) => [loan.id, loan]));

    const all: Movement[] = [
      ...contributions.map((c) => ({ id: c.id, kind: 'contribution' as const, amount: c.amount, date: c.date, note: c.note })),
      ...withdrawals.map((w) => ({ id: w.id, kind: 'withdrawal' as const, amount: w.amount, date: w.date, note: w.note })),
      ...loans.map((loan) => ({
        id: `loan-${loan.id}`,
        kind: 'loan' as const,
        amount: loan.principal,
        date: loan.createdAt,
        note: clientById[loan.clientId]?.name,
      })),
      ...installments
        .filter((installment) => installment.paid)
        .map((installment) => {
          const clientName = clientById[loanById.get(installment.loanId)?.clientId ?? '']?.name;
          return {
            id: `payment-${installment.id}`,
            kind: 'payment' as const,
            amount: installment.amount,
            date: installment.paidAt ?? installment.dueDate,
            note: clientName ? `${clientName} · parcela ${installment.number}` : `Parcela ${installment.number}`,
          };
        }),
    ];
    return all.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [contributions, withdrawals, loansData]);

  async function registerMovement() {
    const amount = toNumber(amountText);
    if (amount <= 0) {
      setError(
        kind === 'contribution'
          ? 'Informe um valor de aporte maior que zero.'
          : 'Informe um valor de retirada maior que zero.'
      );
      return;
    }
    setError(null);
    setSaving(true);
    try {
      if (kind === 'contribution') {
        await createContribution({ amount, note: note.trim() || undefined });
      } else {
        await createWithdrawal({ amount, note: note.trim() || undefined });
      }
      setAmountText('');
      setNote('');
    } catch (caughtError) {
      setError(String(caughtError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer>
      <FlatList
        data={movements}
        keyExtractor={(movement) => movement.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
        ListHeaderComponent={
          <>
            <AvailableCapitalSummary />
            <Card style={styles.form}>
              <View style={styles.tabs}>
                <Pressable
                  style={[styles.tab, kind === 'contribution' && styles.tabActive]}
                  onPress={() => setKind('contribution')}
                >
                  <Text style={[styles.tabText, kind === 'contribution' && styles.tabTextActive]}>Aporte</Text>
                </Pressable>
                <Pressable
                  style={[styles.tab, kind === 'withdrawal' && styles.tabActive]}
                  onPress={() => setKind('withdrawal')}
                >
                  <Text style={[styles.tabText, kind === 'withdrawal' && styles.tabTextActive]}>Retirada</Text>
                </Pressable>
              </View>
              <TextField
                label={kind === 'contribution' ? 'Valor do aporte (R$)' : 'Valor da retirada (R$)'}
                keyboardType="decimal-pad"
                value={amountText}
                onChangeText={setAmountText}
                placeholder="0,00"
              />
              <TextField
                label="Observação"
                value={note}
                onChangeText={setNote}
                placeholder="(opcional)"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <AppButton
                title={
                  saving
                    ? 'Registrando...'
                    : kind === 'contribution'
                      ? 'Registrar aporte'
                      : 'Registrar retirada'
                }
                onPress={registerMovement}
                disabled={saving}
                loading={saving}
                style={styles.button}
              />
            </Card>
            <Text style={styles.sectionTitle}>Histórico</Text>
          </>
        }
        renderItem={({ item }) => {
          const negative = item.kind === 'withdrawal' || item.kind === 'loan';
          return (
            <Card>
              <View style={styles.topRow}>
                <Text style={[styles.rowAmount, negative && styles.rowAmountNegative]}>
                  {negative ? '- ' : '+ '}
                  {currencyFormat.format(item.amount)}
                </Text>
                <Text style={styles.rowDate}>{item.date.toLocaleDateString('pt-BR')}</Text>
              </View>
              <Text style={styles.rowKind}>{MOVEMENT_LABEL[item.kind]}</Text>
              {item.note ? <Text style={styles.rowNote}>{item.note}</Text> : null}
            </Card>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma movimentação registrada ainda.</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  form: { marginTop: spacing.lg },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
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
  tabText: { fontWeight: '700', fontSize: 13, color: colors.textMuted },
  tabTextActive: { color: colors.primaryDark },
  error: { color: colors.danger, marginTop: spacing.sm, fontSize: 13, fontWeight: '600' },
  button: { marginTop: spacing.md },
  sectionTitle: { ...typography.subtitle, marginTop: spacing.lg, marginBottom: spacing.sm },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowAmount: { fontSize: 16, fontWeight: '700', color: colors.success },
  rowAmountNegative: { color: colors.danger },
  rowDate: { fontSize: 13, color: colors.textMuted },
  rowKind: { fontSize: 12, color: colors.textMuted, marginTop: 2, fontWeight: '600' },
  rowNote: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
  empty: { textAlign: 'center', marginTop: spacing.lg, color: colors.textMuted },
});
