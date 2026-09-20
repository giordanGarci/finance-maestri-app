import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAvailableCapital } from '../hooks/useAvailableCapital';
import { Card } from '../../ui/Card';
import { EyeIcon } from '../../ui/EyeIcon';
import { colors, spacing, typography } from '../../ui/theme';

const currencyFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const MASKED_VALUE = 'R$ ••••••';

export function AvailableCapitalSummary() {
  const capital = useAvailableCapital();
  const [visible, setVisible] = useState(true);

  const displayValue = capital === null ? '...' : visible ? currencyFormat.format(capital) : MASKED_VALUE;

  return (
    <Card style={styles.container}>
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Capital disponível</Text>
          <Text style={styles.value}>{displayValue}</Text>
        </View>
        <Pressable
          onPress={() => setVisible((current) => !current)}
          hitSlop={12}
          style={styles.eyeButton}
          accessibilityLabel={visible ? 'Ocultar saldo' : 'Mostrar saldo'}
        >
          <EyeIcon open={visible} />
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  eyeButton: {
    padding: spacing.xs,
    marginTop: 2,
  },
});
