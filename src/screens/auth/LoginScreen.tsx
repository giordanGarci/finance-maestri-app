import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { criarConta, entrarComEmailSenha } from '../../data/auth';
import { AppButton } from '../../ui/AppButton';
import { Card } from '../../ui/Card';
import { TextField } from '../../ui/TextField';
import { colors, spacing, typography } from '../../ui/theme';

export function LoginScreen() {
  const [modo, setModo] = useState<'entrar' | 'criar-conta'>('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function confirmar() {
    setErro(null);
    setEnviando(true);
    try {
      if (modo === 'criar-conta') {
        await criarConta(email, senha);
      } else {
        await entrarComEmailSenha(email, senha);
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao autenticar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.marca}>💰</Text>
      <Text style={styles.titulo}>Empréstimos</Text>
      <Text style={styles.subtitulo}>Organize clientes, empréstimos e parcelas em um só lugar</Text>

      <Card>
        <TextField
          label="E-mail"
          placeholder="voce@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextField
          label="Senha"
          placeholder="••••••••"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <AppButton
          title={modo === 'criar-conta' ? 'Criar conta' : 'Entrar'}
          onPress={confirmar}
          disabled={enviando || !email || !senha}
          loading={enviando}
          style={styles.botaoPrincipal}
        />
        <AppButton
          title={modo === 'criar-conta' ? 'Já tenho conta, entrar' : 'Criar minha conta'}
          onPress={() => setModo(modo === 'criar-conta' ? 'entrar' : 'criar-conta')}
          variant="secondary"
          style={styles.botaoSecundario}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  marca: { fontSize: 44, textAlign: 'center', marginBottom: spacing.sm },
  titulo: { ...typography.title, fontSize: 26, textAlign: 'center' },
  subtitulo: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  erro: { color: colors.danger, marginTop: spacing.md, fontSize: 13, fontWeight: '600' },
  botaoPrincipal: { marginTop: spacing.lg },
  botaoSecundario: { marginTop: spacing.sm },
});
