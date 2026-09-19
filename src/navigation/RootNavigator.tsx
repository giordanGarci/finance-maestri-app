import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { ClientesListaScreen } from '../screens/clientes/ClientesListaScreen';
import { ClienteFormScreen } from '../screens/clientes/ClienteFormScreen';
import { ClienteDetalheScreen } from '../screens/clientes/ClienteDetalheScreen';
import { EmprestimoFormScreen } from '../screens/emprestimos/EmprestimoFormScreen';
import { EmprestimoDetalheScreen } from '../screens/emprestimos/EmprestimoDetalheScreen';
import { AportesScreen } from '../screens/aportes/AportesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="ClientesLista">
      <Stack.Screen name="ClientesLista" component={ClientesListaScreen} options={{ title: 'Clientes' }} />
      <Stack.Screen name="ClienteForm" component={ClienteFormScreen} options={{ title: 'Cliente' }} />
      <Stack.Screen name="ClienteDetalhe" component={ClienteDetalheScreen} options={{ title: 'Detalhe do cliente' }} />
      <Stack.Screen name="EmprestimoForm" component={EmprestimoFormScreen} options={{ title: 'Novo empréstimo' }} />
      <Stack.Screen
        name="EmprestimoDetalhe"
        component={EmprestimoDetalheScreen}
        options={{ title: 'Detalhe do empréstimo' }}
      />
      <Stack.Screen name="Aportes" component={AportesScreen} options={{ title: 'Aportes' }} />
    </Stack.Navigator>
  );
}
