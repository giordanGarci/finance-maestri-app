import { StyleSheet, Text, View } from 'react-native';
import { useCapitalDisponivel } from '../hooks/useCapitalDisponivel';
import { Card } from '../../ui/Card';
import { colors, spacing, typography } from '../../ui/theme';

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function CapitalDisponivelResumo() {
  const capital = useCapitalDisponivel();

  return (
    <Card style={styles.container}>
      <View>
        <Text style={styles.rotulo}>Capital disponível</Text>
        <Text style={styles.valor}>{capital === null ? '...' : formatoMoeda.format(capital)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
  },
  rotulo: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
  },
  valor: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.white,
    marginTop: spacing.xs,
  },
});
