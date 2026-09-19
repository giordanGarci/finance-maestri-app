import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthUser } from './src/data/auth';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useSincronizarNotificacoes } from './src/notifications/useSincronizarNotificacoes';

export default function App() {
  const { user, carregando } = useAuthUser();
  useSincronizarNotificacoes(!!user);

  if (carregando) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <LoginScreen />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootNavigator />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});
