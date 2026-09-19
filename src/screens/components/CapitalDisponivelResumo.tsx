import { StyleSheet, Text, View } from 'react-native';
import { useCapitalDisponivel } from '../hooks/useCapitalDisponivel';

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function CapitalDisponivelResumo() {
  const capital = useCapitalDisponivel();

  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>Capital disponível</Text>
      <Text style={styles.valor}>{capital === null ? '...' : formatoMoeda.format(capital)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#E6F4FE',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
  },
  rotulo: {
    fontSize: 12,
    color: '#334',
  },
  valor: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 2,
  },
});
