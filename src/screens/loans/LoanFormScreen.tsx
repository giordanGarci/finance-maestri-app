import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { calculateTotalAmount, suggestInstallments, type SuggestedInstallment } from '../../domain/loan';
import { updateLoan, createLoan, listInstallments } from '../../data/loansRepository';
import { AppButton } from '../../ui/AppButton';
import { Card } from '../../ui/Card';
import { ScreenContainer } from '../../ui/ScreenContainer';
import { TextField } from '../../ui/TextField';
import { colors, radius, spacing, typography } from '../../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'LoanForm'>;

const currencyFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function toNumber(text: string): number {
  const value = Number(text.replace(',', '.'));
  return Number.isFinite(value) ? value : 0;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

/** Accepts "dd/mm/yyyy"; returns null if the text doesn't form a valid date. */
function parseDate(text: string): Date | null {
  const parts = text.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map((part) => Number(part));
  if (!day || !month || !year) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function LoanFormScreen({ route, navigation }: Props) {
  const { clientId, loan } = route.params;
  const editMode = !!loan;

  const [principalText, setPrincipalText] = useState(loan ? String(loan.principal) : '');
  const [interestRateText, setInterestRateText] = useState(
    loan ? String(Math.round(loan.interestRate * 100 * 100) / 100) : ''
  );
  const [quantityText, setQuantityText] = useState('1');
  const [intervalDaysText, setIntervalDaysText] = useState('30');
  const [dateText, setDateText] = useState(() => formatDate(new Date()));
  const [manualEdit, setManualEdit] = useState(false);
  const [manualInstallments, setManualInstallments] = useState<SuggestedInstallment[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedExistingInstallments = useRef(false);

  useEffect(() => {
    if (!editMode || !loan) return;
    return listInstallments(loan.id, (installments) => {
      if (loadedExistingInstallments.current || installments.length === 0) return;
      loadedExistingInstallments.current = true;

      setQuantityText(String(installments.length));
      setDateText(formatDate(installments[0].dueDate));
      if (installments.length > 1) {
        const days = Math.round(
          (installments[1].dueDate.getTime() - installments[0].dueDate.getTime()) / MS_PER_DAY
        );
        setIntervalDaysText(String(Math.max(0, days)));
      }
      setManualEdit(true);
      setManualInstallments(installments.map(({ number, amount, dueDate }) => ({ number, amount, dueDate })));
    });
  }, [editMode, loan]);

  const principal = toNumber(principalText);
  const interestRate = toNumber(interestRateText) / 100;
  const quantity = Math.max(1, Math.round(toNumber(quantityText)) || 1);
  const intervalDays = Math.round(toNumber(intervalDaysText)) || 0;
  const firstDueDate = parseDate(dateText) ?? new Date();

  const totalAmount = useMemo(() => calculateTotalAmount(principal, interestRate), [principal, interestRate]);

  const suggestedInstallments = useMemo(
    () => suggestInstallments(totalAmount, quantity, firstDueDate, intervalDays),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalAmount, quantity, dateText, intervalDays]
  );

  const installments = manualEdit && manualInstallments ? manualInstallments : suggestedInstallments;
  const installmentsSum = installments.reduce((sum, installment) => sum + installment.amount, 0);

  function toggleManualEdit(active: boolean) {
    setManualEdit(active);
    setManualInstallments(active ? suggestedInstallments.map((installment) => ({ ...installment })) : null);
  }

  function editInstallmentAmount(number: number, text: string) {
    const amount = toNumber(text);
    setManualInstallments((current) => {
      const base = current ?? suggestedInstallments.map((installment) => ({ ...installment }));
      return base.map((installment) => (installment.number === number ? { ...installment, amount } : installment));
    });
  }

  async function save() {
    if (principal <= 0) {
      setError('Informe um valor de Principal maior que zero.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const data = {
        clientId,
        principal,
        interestRate,
        totalAmount,
        installments: installments.map(({ number, amount, dueDate }) => ({ number, amount, dueDate })),
      };
      if (editMode && loan) {
        await updateLoan(loan.id, data);
      } else {
        await createLoan(data);
      }
      navigation.goBack();
    } catch (caughtError) {
      setError(String(caughtError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <Card style={styles.card}>
        <TextField
          label="Principal (R$) *"
          value={principalText}
          onChangeText={setPrincipalText}
          keyboardType="decimal-pad"
          placeholder="500,00"
        />
        <TextField
          label="Juros (%) *"
          value={interestRateText}
          onChangeText={setInterestRateText}
          keyboardType="decimal-pad"
          placeholder="10"
        />
        <TextField
          label="Quantidade de parcelas *"
          value={quantityText}
          onChangeText={setQuantityText}
          keyboardType="number-pad"
          placeholder="1"
        />
        <TextField
          label="Intervalo entre parcelas (dias)"
          value={intervalDaysText}
          onChangeText={setIntervalDaysText}
          keyboardType="number-pad"
          placeholder="30"
        />
        <TextField
          label="Primeira parcela vence em (dd/mm/aaaa)"
          value={dateText}
          onChangeText={setDateText}
          placeholder="dd/mm/aaaa"
        />
      </Card>

      <Card style={styles.cardTotal}>
        <Text style={styles.totalLabel}>Valor total</Text>
        <Text style={styles.total}>{currencyFormat.format(totalAmount)}</Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {quantity === 1 ? 'Pagamento único' : `Parcelado em ${quantity}x`}
          </Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.editRow}>
          <Text style={styles.switchLabel}>Editar parcelas manualmente</Text>
          <Switch
            value={manualEdit}
            onValueChange={toggleManualEdit}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>

        {installments.map((installment, index) => (
          <View
            key={installment.number}
            style={[styles.installmentRow, index === installments.length - 1 && styles.installmentRowLast]}
          >
            <View style={styles.installmentNumberBadge}>
              <Text style={styles.installmentNumberText}>{installment.number}</Text>
            </View>
            <Text style={styles.installmentDate}>{formatDate(installment.dueDate)}</Text>
            {manualEdit ? (
              <TextInput
                style={styles.installmentAmountInput}
                keyboardType="decimal-pad"
                defaultValue={installment.amount.toFixed(2)}
                onChangeText={(text) => editInstallmentAmount(installment.number, text)}
              />
            ) : (
              <Text style={styles.installmentAmount}>{currencyFormat.format(installment.amount)}</Text>
            )}
          </View>
        ))}

        {manualEdit && Math.abs(installmentsSum - totalAmount) > 0.01 ? (
          <Text style={styles.warning}>
            Soma das parcelas ({currencyFormat.format(installmentsSum)}) diferente do valor total (
            {currencyFormat.format(totalAmount)}).
          </Text>
        ) : null}
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AppButton
        title={saving ? 'Salvando...' : editMode ? 'Salvar alterações' : 'Salvar empréstimo'}
        onPress={save}
        disabled={saving}
        loading={saving}
        style={styles.saveButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  cardTotal: { marginBottom: spacing.md, alignItems: 'center' },
  totalLabel: { ...typography.label },
  total: { fontSize: 30, fontWeight: '800', color: colors.text, marginTop: spacing.xs },
  typeBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  typeBadgeText: { color: colors.primaryDark, fontWeight: '700', fontSize: 13 },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  switchLabel: { ...typography.subtitle, fontSize: 15 },
  installmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  installmentRowLast: { borderBottomWidth: 0 },
  installmentNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  installmentNumberText: { fontWeight: '700', fontSize: 12, color: colors.primaryDark },
  installmentDate: { flex: 1, color: colors.textMuted, fontSize: 14 },
  installmentAmount: { fontWeight: '700', color: colors.text },
  installmentAmountInput: {
    width: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    textAlign: 'right',
    color: colors.text,
  },
  warning: { color: colors.danger, marginTop: spacing.sm, fontSize: 13, fontWeight: '600' },
  error: { color: colors.danger, marginBottom: spacing.sm, fontSize: 14, fontWeight: '600' },
  saveButton: { marginTop: spacing.xs },
});
