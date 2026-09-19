import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { Aporte } from '../../domain/types';
import { criarAporte, listarAportes } from '../../data/aportesRepository';
import { CapitalDisponivelResumo } from '../components/CapitalDisponivelResumo';
import { AppButton } from '../../ui/AppButton';
import { Card } from '../../ui/Card';
import { ScreenContainer } from '../../ui/ScreenContainer';
import { TextField } from '../../ui/TextField';
import { colors, spacing, typography } from '../../ui/theme';

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function paraNumero(texto: string): number {
  const valor = Number(texto.replace(',', '.'));
  return Number.isFinite(valor) ? valor : 0;
}

export function AportesScreen() {
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [valorTexto, setValorTexto] = useState('');
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => listarAportes(setAportes), []);

  async function registrarAporte() {
    const valor = paraNumero(valorTexto);
    if (valor <= 0) {
      setErro('Informe um valor de aporte maior que zero.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await criarAporte({ valor, observacao: observacao.trim() || undefined });
      setValorTexto('');
      setObservacao('');
    } catch (erroCapturado) {
      setErro(String(erroCapturado));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScreenContainer>
      <FlatList
        data={aportes}
        keyExtractor={(aporte) => aporte.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <>
            <CapitalDisponivelResumo />
            <Card style={styles.form}>
              <TextField
                label="Valor do aporte (R$)"
                keyboardType="decimal-pad"
                value={valorTexto}
                onChangeText={setValorTexto}
                placeholder="0,00"
              />
              <TextField
                label="Observação"
                value={observacao}
                onChangeText={setObservacao}
                placeholder="(opcional)"
              />
              {erro ? <Text style={styles.erro}>{erro}</Text> : null}
              <AppButton
                title={salvando ? 'Registrando...' : 'Registrar aporte'}
                onPress={registrarAporte}
                disabled={salvando}
                loading={salvando}
                style={styles.botao}
              />
            </Card>
            <Text style={styles.secaoTitulo}>Histórico</Text>
          </>
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.linhaTopo}>
              <Text style={styles.linhaValor}>{formatoMoeda.format(item.valor)}</Text>
              <Text style={styles.linhaData}>{item.data.toLocaleDateString('pt-BR')}</Text>
            </View>
            {item.observacao ? <Text style={styles.linhaObs}>{item.observacao}</Text> : null}
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum aporte registrado ainda.</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lista: { padding: spacing.lg, paddingBottom: spacing.xxl },
  form: { marginTop: spacing.lg },
  erro: { color: colors.danger, marginTop: spacing.sm, fontSize: 13, fontWeight: '600' },
  botao: { marginTop: spacing.md },
  secaoTitulo: { ...typography.subtitle, marginTop: spacing.lg, marginBottom: spacing.sm },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linhaValor: { fontSize: 16, fontWeight: '700', color: colors.text },
  linhaData: { fontSize: 13, color: colors.textMuted },
  linhaObs: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
  vazio: { textAlign: 'center', marginTop: spacing.lg, color: colors.textMuted },
});
