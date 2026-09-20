import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthUser } from './src/data/auth';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useSyncNotifications } from './src/notifications/useSyncNotifications';
import { colors, navigationTheme } from './src/ui/theme';

export default function App() {
  const { user, loading } = useAuthUser();
  useSyncNotifications(!!user);

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
          <StatusBar style="dark" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <LoginScreen />
          <StatusBar style="dark" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
        <StatusBar style="dark" />
      </NavigationContainer>
    </SafeAreaProvider>
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
