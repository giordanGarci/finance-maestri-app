import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { ClientsListScreen } from '../screens/clients/ClientsListScreen';
import { ClientFormScreen } from '../screens/clients/ClientFormScreen';
import { ClientDetailScreen } from '../screens/clients/ClientDetailScreen';
import { LoanFormScreen } from '../screens/loans/LoanFormScreen';
import { LoanDetailScreen } from '../screens/loans/LoanDetailScreen';
import { ContributionsScreen } from '../screens/contributions/ContributionsScreen';
import NotificationPreferenceScreen from '../screens/NotificationPreferenceScreen';
import { colors } from '../ui/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ClientsList"
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="ClientsList" component={ClientsListScreen} options={{ title: 'Clients' }} />
      <Stack.Screen name="ClientForm" component={ClientFormScreen} options={{ title: 'Client' }} />
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'Client details' }} />
      <Stack.Screen
        name="LoanForm"
        component={LoanFormScreen}
        options={({ route }) => ({ title: route.params.loan ? 'Edit loan' : 'New loan' })}
      />
      <Stack.Screen
        name="LoanDetail"
        component={LoanDetailScreen}
        options={{ title: 'Loan details' }}
      />
      <Stack.Screen name="Contributions" component={ContributionsScreen} options={{ title: 'Contributions' }} />
      <Stack.Screen
        name="NotificationPreference"
        component={NotificationPreferenceScreen}
        options={{ title: 'Notification preference' }}
      />
    </Stack.Navigator>
  );
}
