import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { Client } from '../../domain/types';
import { listClients } from '../../data/clientsRepository';
import { signOutUser } from '../../data/auth';
import { AvailableCapitalSummary } from '../components/AvailableCapitalSummary';
import { ActionCard } from '../../ui/ActionCard';
import { CalendarIcon } from '../../ui/CalendarIcon';
import { CoinsIcon } from '../../ui/CoinsIcon';
import { IconButton } from '../../ui/IconButton';
import { PlusIcon } from '../../ui/PlusIcon';
import { ScreenContainer } from '../../ui/ScreenContainer';
import { SearchIcon } from '../../ui/SearchIcon';
import { useBottomListPadding } from '../../ui/useBottomListPadding';
import { colors, spacing, typography } from '../../ui/theme';
import { ClientRow } from './ClientRow';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientsList'>;

export function ClientsListScreen({ navigation }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const bottomPadding = useBottomListPadding();

  useEffect(() => listClients(setClients), []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <Pressable onPress={() => navigation.navigate('NotificationPreference')} hitSlop={8}>
            <Text style={styles.headerAction}>Preferências</Text>
          </Pressable>
          <Pressable onPress={() => signOutUser()} hitSlop={8}>
            <Text style={[styles.headerAction, styles.headerActionMuted]}>Sair</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <ScreenContainer>
      <FlatList
        data={clients}
        keyExtractor={(client) => client.id}
        ListHeaderComponent={
          <>
            <AvailableCapitalSummary />
            <View style={styles.actionsRow}>
              <ActionCard
                icon={<CoinsIcon />}
                label="Aportes e retiradas"
                onPress={() => navigation.navigate('Contributions')}
              />
              <ActionCard
                icon={<CalendarIcon />}
                label="Próximos pagamentos"
                onPress={() => navigation.navigate('UpcomingPayments')}
              />
            </View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Clientes{clients.length > 0 ? ` · ${clients.length}` : ''}
              </Text>
              <View style={styles.sectionActions}>
                <IconButton
                  accessibilityLabel="Pesquisar clientes"
                  onPress={() => navigation.navigate('ClientsSearch')}
                >
                  <SearchIcon />
                </IconButton>
                <IconButton accessibilityLabel="Novo cliente" onPress={() => navigation.navigate('ClientForm')}>
                  <PlusIcon />
                </IconButton>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <ClientRow client={item} onPress={() => navigation.navigate('ClientDetail', { client: item })} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nenhum cliente ainda</Text>
            <Text style={styles.emptyText}>Cadastre o primeiro cliente para começar a registrar empréstimos.</Text>
          </View>
        }
        contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  headerActions: { flexDirection: 'row', gap: spacing.lg },
  headerAction: { color: colors.primary, fontWeight: '600' },
  headerActionMuted: { color: colors.textMuted },
  actionsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionTitle: { ...typography.subtitle },
  sectionActions: { flexDirection: 'row', gap: spacing.sm },
  empty: { alignItems: 'center', marginTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs, lineHeight: 20 },
});
