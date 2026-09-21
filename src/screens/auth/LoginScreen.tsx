import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { createAccount, signInWithEmailPassword } from '../../data/auth';
import { AppButton } from '../../ui/AppButton';
import { Card } from '../../ui/Card';
import { TextField } from '../../ui/TextField';
import { colors, spacing, typography } from '../../ui/theme';
import { useKeyboardHeight } from '../../ui/useKeyboardHeight';

export function LoginScreen() {
  const [mode, setMode] = useState<'sign-in' | 'create-account'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const keyboardHeight = useKeyboardHeight();

  async function confirm() {
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'create-account') {
        await createAccount(email, password);
      } else {
        await signInWithEmailPassword(email, password);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao autenticar.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: spacing.xl + keyboardHeight }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.brand}>💰</Text>
      <Text style={styles.title}>Empréstimos</Text>
      <Text style={styles.subtitle}>Organize clientes, empréstimos e parcelas em um só lugar</Text>

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
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppButton
          title={mode === 'create-account' ? 'Criar conta' : 'Entrar'}
          onPress={confirm}
          disabled={submitting || !email || !password}
          loading={submitting}
          style={styles.primaryButton}
        />
        <AppButton
          title={mode === 'create-account' ? 'Já tenho conta, entrar' : 'Criar minha conta'}
          onPress={() => setMode(mode === 'create-account' ? 'sign-in' : 'create-account')}
          variant="secondary"
          style={styles.secondaryButton}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: colors.background,
  },
  brand: { fontSize: 44, textAlign: 'center', marginBottom: spacing.sm },
  title: { ...typography.title, fontSize: 26, textAlign: 'center' },
  subtitle: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  error: { color: colors.danger, marginTop: spacing.md, fontSize: 13, fontWeight: '600' },
  primaryButton: { marginTop: spacing.lg },
  secondaryButton: { marginTop: spacing.sm },
});
