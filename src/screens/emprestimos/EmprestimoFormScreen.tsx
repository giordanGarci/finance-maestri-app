import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { calcularValorTotal, sugerirParcelas, type ParcelaSugerida } from '../../domain/emprestimo';
import { criarEmprestimo } from '../../data/emprestimosRepository';

type Props = NativeStackScreenProps<RootStackParamList, 'EmprestimoForm'>;

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function paraNumero(texto: string): number {
  const valor = Number(texto.replace(',', '.'));
  return Number.isFinite(valor) ? valor : 0;
}

function formatarData(data: Date): string {
  return data.toLocaleDateString('pt-BR');
}

/** Aceita "dd/mm/aaaa"; retorna null se o texto não formar uma data válida. */
function interpretarData(texto: string): Date | null {
  const partes = texto.split('/');
  if (partes.length !== 3) return null;
  const [dia, mes, ano] = partes.map((parte) => Number(parte));
  if (!dia || !mes || !ano) return null;
  const data = new Date(ano, mes - 1, dia);
  return Number.isNaN(data.getTime()) ? null : data;
}

export function EmprestimoFormScreen({ route, navigation }: Props) {
  const { clienteId } = route.params;

  const [principalTexto, setPrincipalTexto] = useState('');
  const [taxaJurosTexto, setTaxaJurosTexto] = useState('');
  const [quantidadeTexto, setQuantidadeTexto] = useState('1');
  const [intervaloDiasTexto, setIntervaloDiasTexto] = useState('30');
  const [dataTexto, setDataTexto] = useState(() => formatarData(new Date()));
  const [edicaoManual, setEdicaoManual] = useState(false);
  const [parcelasManuais, setParcelasManuais] = useState<ParcelaSugerida[] | null>(null);
  const [salvando, setSalvando] = useState(false);

  const principal = paraNumero(principalTexto);
  const taxaJuros = paraNumero(taxaJurosTexto) / 100;
  const quantidade = Math.max(1, Math.round(paraNumero(quantidadeTexto)) || 1);
  const intervaloDias = Math.round(paraNumero(intervaloDiasTexto)) || 0;
  const primeiraDataVencimento = interpretarData(dataTexto) ?? new Date();

  const valorTotal = useMemo(() => calcularValorTotal(principal, taxaJuros), [principal, taxaJuros]);

  const parcelasSugeridas = useMemo(
    () => sugerirParcelas(valorTotal, quantidade, primeiraDataVencimento, intervaloDias),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [valorTotal, quantidade, dataTexto, intervaloDias]
  );

  const parcelas = edicaoManual && parcelasManuais ? parcelasManuais : parcelasSugeridas;
  const somaParcelas = parcelas.reduce((soma, parcela) => soma + parcela.valor, 0);

  function alternarEdicaoManual(ativo: boolean) {
    setEdicaoManual(ativo);
    setParcelasManuais(ativo ? parcelasSugeridas.map((parcela) => ({ ...parcela })) : null);
  }

  function editarValorParcela(numero: number, texto: string) {
    const valor = paraNumero(texto);
    setParcelasManuais((atual) => {
      const base = atual ?? parcelasSugeridas.map((parcela) => ({ ...parcela }));
      return base.map((parcela) => (parcela.numero === numero ? { ...parcela, valor } : parcela));
    });
  }

  async function salvar() {
    if (principal <= 0) {
      Alert.alert('Principal inválido', 'Informe um valor de Principal maior que zero.');
      return;
    }
    setSalvando(true);
    try {
      await criarEmprestimo({
        clienteId,
        principal,
        taxaJuros,
        valorTotal,
        parcelas: parcelas.map(({ numero, valor, dataVencimento }) => ({ numero, valor, dataVencimento })),
      });
      navigation.goBack();
    } catch (erro) {
      Alert.alert('Erro ao salvar', String(erro));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.rotulo}>Principal (R$) *</Text>
      <TextInput
        style={styles.input}
        value={principalTexto}
        onChangeText={setPrincipalTexto}
        keyboardType="decimal-pad"
        placeholder="500,00"
      />

      <Text style={styles.rotulo}>Juros (%) *</Text>
      <TextInput
        style={styles.input}
        value={taxaJurosTexto}
        onChangeText={setTaxaJurosTexto}
        keyboardType="decimal-pad"
        placeholder="10"
      />

      <Text style={styles.rotulo}>Quantidade de parcelas *</Text>
      <TextInput
        style={styles.input}
        value={quantidadeTexto}
        onChangeText={setQuantidadeTexto}
        keyboardType="number-pad"
        placeholder="1"
      />

      <Text style={styles.rotulo}>Intervalo entre parcelas (dias)</Text>
      <TextInput
        style={styles.input}
        value={intervaloDiasTexto}
        onChangeText={setIntervaloDiasTexto}
        keyboardType="number-pad"
        placeholder="30"
      />

      <Text style={styles.rotulo}>Primeira parcela vence em (dd/mm/aaaa)</Text>
      <TextInput style={styles.input} value={dataTexto} onChangeText={setDataTexto} placeholder="dd/mm/aaaa" />

      <Text style={styles.total}>Valor total: {formatoMoeda.format(valorTotal)}</Text>
      <Text style={styles.rotuloTipo}>{quantidade === 1 ? 'Pagamento único' : `Parcelado em ${quantidade}x`}</Text>

      <View style={styles.linhaEdicao}>
        <Text style={styles.rotulo}>Editar parcelas manualmente</Text>
        <Switch value={edicaoManual} onValueChange={alternarEdicaoManual} />
      </View>

      {parcelas.map((parcela) => (
        <View key={parcela.numero} style={styles.parcelaLinha}>
          <Text style={styles.parcelaNumero}>#{parcela.numero}</Text>
          <Text style={styles.parcelaData}>{formatarData(parcela.dataVencimento)}</Text>
          {edicaoManual ? (
            <TextInput
              style={styles.parcelaValorInput}
              keyboardType="decimal-pad"
              defaultValue={parcela.valor.toFixed(2)}
              onChangeText={(texto) => editarValorParcela(parcela.numero, texto)}
            />
          ) : (
            <Text style={styles.parcelaValor}>{formatoMoeda.format(parcela.valor)}</Text>
          )}
        </View>
      ))}

      {edicaoManual && Math.abs(somaParcelas - valorTotal) > 0.01 ? (
        <Text style={styles.aviso}>
          Soma das parcelas ({formatoMoeda.format(somaParcelas)}) diferente do valor total (
          {formatoMoeda.format(valorTotal)}).
        </Text>
      ) : null}

      <Pressable style={styles.botao} onPress={salvar} disabled={salvando}>
        <Text style={styles.botaoTexto}>{salvando ? 'Salvando...' : 'Salvar empréstimo'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 4 },
  rotulo: { fontSize: 13, color: '#333', marginTop: 12, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginTop: 4,
  },
  total: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  rotuloTipo: { fontSize: 13, color: '#1565C0', fontWeight: '600', marginTop: 2 },
  linhaEdicao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  parcelaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  parcelaNumero: { width: 32, fontWeight: '600' },
  parcelaData: { flex: 1, color: '#444' },
  parcelaValor: { fontWeight: '600' },
  parcelaValorInput: {
    width: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    textAlign: 'right',
  },
  aviso: { color: '#C62828', marginTop: 8, fontSize: 13 },
  botao: {
    marginTop: 24,
    backgroundColor: '#1565C0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botaoTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
