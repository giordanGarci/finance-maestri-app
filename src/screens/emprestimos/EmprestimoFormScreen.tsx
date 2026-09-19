import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { calcularValorTotal, sugerirParcelas, type ParcelaSugerida } from '../../domain/emprestimo';
import { atualizarEmprestimo, criarEmprestimo, listarParcelas } from '../../data/emprestimosRepository';
import { AppButton } from '../../ui/AppButton';
import { Card } from '../../ui/Card';
import { ScreenContainer } from '../../ui/ScreenContainer';
import { TextField } from '../../ui/TextField';
import { colors, radius, spacing, typography } from '../../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EmprestimoForm'>;

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const MS_POR_DIA = 1000 * 60 * 60 * 24;

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
  const { clienteId, emprestimo } = route.params;
  const modoEdicao = !!emprestimo;

  const [principalTexto, setPrincipalTexto] = useState(emprestimo ? String(emprestimo.principal) : '');
  const [taxaJurosTexto, setTaxaJurosTexto] = useState(
    emprestimo ? String(Math.round(emprestimo.taxaJuros * 100 * 100) / 100) : ''
  );
  const [quantidadeTexto, setQuantidadeTexto] = useState('1');
  const [intervaloDiasTexto, setIntervaloDiasTexto] = useState('30');
  const [dataTexto, setDataTexto] = useState(() => formatarData(new Date()));
  const [edicaoManual, setEdicaoManual] = useState(false);
  const [parcelasManuais, setParcelasManuais] = useState<ParcelaSugerida[] | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const carregouParcelasExistentes = useRef(false);

  useEffect(() => {
    if (!modoEdicao || !emprestimo) return;
    return listarParcelas(emprestimo.id, (parcelas) => {
      if (carregouParcelasExistentes.current || parcelas.length === 0) return;
      carregouParcelasExistentes.current = true;

      setQuantidadeTexto(String(parcelas.length));
      setDataTexto(formatarData(parcelas[0].dataVencimento));
      if (parcelas.length > 1) {
        const dias = Math.round(
          (parcelas[1].dataVencimento.getTime() - parcelas[0].dataVencimento.getTime()) / MS_POR_DIA
        );
        setIntervaloDiasTexto(String(Math.max(0, dias)));
      }
      setEdicaoManual(true);
      setParcelasManuais(parcelas.map(({ numero, valor, dataVencimento }) => ({ numero, valor, dataVencimento })));
    });
  }, [modoEdicao, emprestimo]);

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
      setErro('Informe um valor de Principal maior que zero.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      const dados = {
        clienteId,
        principal,
        taxaJuros,
        valorTotal,
        parcelas: parcelas.map(({ numero, valor, dataVencimento }) => ({ numero, valor, dataVencimento })),
      };
      if (modoEdicao && emprestimo) {
        await atualizarEmprestimo(emprestimo.id, dados);
      } else {
        await criarEmprestimo(dados);
      }
      navigation.goBack();
    } catch (erroCapturado) {
      setErro(String(erroCapturado));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <Card style={styles.card}>
        <TextField
          label="Principal (R$) *"
          value={principalTexto}
          onChangeText={setPrincipalTexto}
          keyboardType="decimal-pad"
          placeholder="500,00"
        />
        <TextField
          label="Juros (%) *"
          value={taxaJurosTexto}
          onChangeText={setTaxaJurosTexto}
          keyboardType="decimal-pad"
          placeholder="10"
        />
        <TextField
          label="Quantidade de parcelas *"
          value={quantidadeTexto}
          onChangeText={setQuantidadeTexto}
          keyboardType="number-pad"
          placeholder="1"
        />
        <TextField
          label="Intervalo entre parcelas (dias)"
          value={intervaloDiasTexto}
          onChangeText={setIntervaloDiasTexto}
          keyboardType="number-pad"
          placeholder="30"
        />
        <TextField
          label="Primeira parcela vence em (dd/mm/aaaa)"
          value={dataTexto}
          onChangeText={setDataTexto}
          placeholder="dd/mm/aaaa"
        />
      </Card>

      <Card style={styles.cardTotal}>
        <Text style={styles.rotuloTotal}>Valor total</Text>
        <Text style={styles.total}>{formatoMoeda.format(valorTotal)}</Text>
        <View style={styles.badgeTipo}>
          <Text style={styles.badgeTipoTexto}>
            {quantidade === 1 ? 'Pagamento único' : `Parcelado em ${quantidade}x`}
          </Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.linhaEdicao}>
          <Text style={styles.rotuloSwitch}>Editar parcelas manualmente</Text>
          <Switch
            value={edicaoManual}
            onValueChange={alternarEdicaoManual}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>

        {parcelas.map((parcela, indice) => (
          <View
            key={parcela.numero}
            style={[styles.parcelaLinha, indice === parcelas.length - 1 && styles.parcelaLinhaUltima]}
          >
            <View style={styles.parcelaNumeroBadge}>
              <Text style={styles.parcelaNumeroTexto}>{parcela.numero}</Text>
            </View>
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
      </Card>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <AppButton
        title={salvando ? 'Salvando...' : modoEdicao ? 'Salvar alterações' : 'Salvar empréstimo'}
        onPress={salvar}
        disabled={salvando}
        loading={salvando}
        style={styles.botaoSalvar}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  cardTotal: { marginBottom: spacing.md, alignItems: 'center' },
  rotuloTotal: { ...typography.label },
  total: { fontSize: 30, fontWeight: '800', color: colors.text, marginTop: spacing.xs },
  badgeTipo: {
    marginTop: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeTipoTexto: { color: colors.primaryDark, fontWeight: '700', fontSize: 13 },
  linhaEdicao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  rotuloSwitch: { ...typography.subtitle, fontSize: 15 },
  parcelaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  parcelaLinhaUltima: { borderBottomWidth: 0 },
  parcelaNumeroBadge: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parcelaNumeroTexto: { fontWeight: '700', fontSize: 12, color: colors.primaryDark },
  parcelaData: { flex: 1, color: colors.textMuted, fontSize: 14 },
  parcelaValor: { fontWeight: '700', color: colors.text },
  parcelaValorInput: {
    width: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    textAlign: 'right',
    color: colors.text,
  },
  aviso: { color: colors.danger, marginTop: spacing.sm, fontSize: 13, fontWeight: '600' },
  erro: { color: colors.danger, marginBottom: spacing.sm, fontSize: 14, fontWeight: '600' },
  botaoSalvar: { marginTop: spacing.xs },
});
