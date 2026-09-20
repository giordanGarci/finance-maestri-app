import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { ClientsListScreen } from '../screens/clients/ClientsListScreen';
import { ClientFormScreen } from '../screens/clients/ClientFormScreen';
import { ClientDetailScreen } from '../screens/clients/ClientDetailScreen';
import { LoanFormScreen } from '../screens/loans/LoanFormScreen';
import { LoanDetailScreen } from '../screens/loans/LoanDetailScreen';
import { ContributionsScreen } from '../screens/contributions/ContributionsScreen';
import { UpcomingPaymentsScreen } from '../screens/payments/UpcomingPaymentsScreen';
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
      <Stack.Screen name="ClientsList" component={ClientsListScreen} options={{ title: 'Clientes' }} />
      <Stack.Screen name="ClientForm" component={ClientFormScreen} options={{ title: 'Cliente' }} />
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'Detalhe do cliente' }} />
      <Stack.Screen
        name="LoanForm"
        component={LoanFormScreen}
        options={({ route }) => ({ title: route.params.loan ? 'Editar empréstimo' : 'Novo empréstimo' })}
      />
      <Stack.Screen
        name="LoanDetail"
        component={LoanDetailScreen}
        options={{ title: 'Detalhe do empréstimo' }}
      />
      <Stack.Screen name="Contributions" component={ContributionsScreen} options={{ title: 'Aportes e retiradas' }} />
      <Stack.Screen
        name="UpcomingPayments"
        component={UpcomingPaymentsScreen}
        options={{ title: 'Próximos pagamentos' }}
      />
      <Stack.Screen
        name="NotificationPreference"
        component={NotificationPreferenceScreen}
        options={{ title: 'Preferência de aviso' }}
      />
    </Stack.Navigator>
  );
}
