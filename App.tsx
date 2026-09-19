import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthUser } from './src/data/auth';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useSincronizarNotificacoes } from './src/notifications/useSincronizarNotificacoes';
import { colors, navigationTheme } from './src/ui/theme';

export default function App() {
  const { user, carregando } = useAuthUser();
  useSincronizarNotificacoes(!!user);

  if (carregando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StatusBar style="dark" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <LoginScreen />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator />
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});
