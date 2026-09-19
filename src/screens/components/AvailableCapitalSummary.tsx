import { StyleSheet, Text, View } from 'react-native';
import { useAvailableCapital } from '../hooks/useAvailableCapital';
import { Card } from '../../ui/Card';
import { colors, spacing, typography } from '../../ui/theme';

const currencyFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function AvailableCapitalSummary() {
  const capital = useAvailableCapital();

  return (
    <Card style={styles.container}>
      <View>
        <Text style={styles.label}>Available capital</Text>
        <Text style={styles.value}>{capital === null ? '...' : currencyFormat.format(capital)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
  },
  label: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
  },
  value: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.white,
    marginTop: spacing.xs,
  },
});
