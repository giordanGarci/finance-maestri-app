import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { Contribution } from '../../domain/types';
import { createContribution, listContributions } from '../../data/contributionsRepository';
import { AvailableCapitalSummary } from '../components/AvailableCapitalSummary';
import { AppButton } from '../../ui/AppButton';
import { Card } from '../../ui/Card';
import { ScreenContainer } from '../../ui/ScreenContainer';
import { TextField } from '../../ui/TextField';
import { colors, spacing, typography } from '../../ui/theme';

const currencyFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function toNumber(text: string): number {
  const value = Number(text.replace(',', '.'));
  return Number.isFinite(value) ? value : 0;
}

export function ContributionsScreen() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [amountText, setAmountText] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => listContributions(setContributions), []);

  async function registerContribution() {
    const amount = toNumber(amountText);
    if (amount <= 0) {
      setError('Enter a contribution amount greater than zero.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createContribution({ amount, note: note.trim() || undefined });
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
        data={contributions}
        keyExtractor={(contribution) => contribution.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <AvailableCapitalSummary />
            <Card style={styles.form}>
              <TextField
                label="Contribution amount (R$)"
                keyboardType="decimal-pad"
                value={amountText}
                onChangeText={setAmountText}
                placeholder="0.00"
              />
              <TextField
                label="Note"
                value={note}
                onChangeText={setNote}
                placeholder="(optional)"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <AppButton
                title={saving ? 'Registering...' : 'Register contribution'}
                onPress={registerContribution}
                disabled={saving}
                loading={saving}
                style={styles.button}
              />
            </Card>
            <Text style={styles.sectionTitle}>History</Text>
          </>
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.topRow}>
              <Text style={styles.rowAmount}>{currencyFormat.format(item.amount)}</Text>
              <Text style={styles.rowDate}>{item.date.toLocaleDateString('pt-BR')}</Text>
            </View>
            {item.note ? <Text style={styles.rowNote}>{item.note}</Text> : null}
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<Text style={styles.empty}>No contributions registered yet.</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  form: { marginTop: spacing.lg },
  error: { color: colors.danger, marginTop: spacing.sm, fontSize: 13, fontWeight: '600' },
  button: { marginTop: spacing.md },
  sectionTitle: { ...typography.subtitle, marginTop: spacing.lg, marginBottom: spacing.sm },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowAmount: { fontSize: 16, fontWeight: '700', color: colors.text },
  rowDate: { fontSize: 13, color: colors.textMuted },
  rowNote: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
  empty: { textAlign: 'center', marginTop: spacing.lg, color: colors.textMuted },
});
