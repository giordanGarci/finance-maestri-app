import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { criarConta, entrarComEmailSenha } from '../../data/auth';

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
      <Text style={styles.titulo}>Empréstimos</Text>
      <TextInput
        style={styles.campo}
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.campo}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
      <Button
        title={modo === 'criar-conta' ? 'Criar conta' : 'Entrar'}
        onPress={confirmar}
        disabled={enviando || !email || !senha}
      />
      <Button
        title={modo === 'criar-conta' ? 'Já tenho conta, entrar' : 'Criar minha conta'}
        onPress={() => setModo(modo === 'criar-conta' ? 'entrar' : 'criar-conta')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  campo: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  erro: {
    color: '#b00020',
  },
});
