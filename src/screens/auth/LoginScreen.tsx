import { Button, StyleSheet, Text, View } from 'react-native';
import { useGoogleSignIn } from '../../data/auth';

export function LoginScreen() {
  const { podeEntrar, entrarComGoogle } = useGoogleSignIn();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Empréstimos</Text>
      <Button title="Entrar com Google" onPress={entrarComGoogle} disabled={!podeEntrar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '600',
  },
});
