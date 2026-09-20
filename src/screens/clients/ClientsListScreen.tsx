import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { Client, Loan } from '../../domain/types';
import { listClients } from '../../data/clientsRepository';
import { listLoansByClient } from '../../data/loansRepository';
import { signOutUser } from '../../data/auth';
import { AvailableCapitalSummary } from '../components/AvailableCapitalSummary';
import { AppButton } from '../../ui/AppButton';
import { Card } from '../../ui/Card';
import { ScreenContainer } from '../../ui/ScreenContainer';
import { useBottomListPadding } from '../../ui/useBottomListPadding';
import { colors, radius, spacing, typography } from '../../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientsList'>;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function ClientRow({ client, onPress }: { client: Client; onPress: () => void }) {
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => listLoansByClient(client.id, setLoans), [client.id]);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.rowPressed]}>
      <Card style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(client.name)}</Text>
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.name}>{client.name}</Text>
          <Text style={styles.indicator}>
            {loans.length} {loans.length === 1 ? 'empréstimo' : 'empréstimos'}
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </Card>
    </Pressable>
  );
}

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
            <Text style={styles.headerAction}>Sair</Text>
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
            <Pressable style={styles.contributionsLink} onPress={() => navigation.navigate('Contributions')}>
              <Text style={styles.contributionsLinkText}>Ver aportes e retiradas ›</Text>
            </Pressable>
            <Pressable style={styles.contributionsLink} onPress={() => navigation.navigate('UpcomingPayments')}>
              <Text style={styles.contributionsLinkText}>Ver próximos pagamentos ›</Text>
            </Pressable>
            <AppButton
              title="+ Novo cliente"
              onPress={() => navigation.navigate('ClientForm')}
              style={styles.newButton}
            />
            <Text style={styles.sectionTitle}>Clientes</Text>
          </>
        }
        renderItem={({ item }) => (
          <ClientRow client={item} onPress={() => navigation.navigate('ClientDetail', { client: item })} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum cliente cadastrado ainda.</Text>}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  newButton: { marginTop: spacing.lg },
  headerActions: { flexDirection: 'row', gap: spacing.lg },
  headerAction: { color: colors.primary, fontWeight: '600' },
  contributionsLink: { marginTop: spacing.md, marginBottom: spacing.md },
  contributionsLinkText: { color: colors.primary, fontWeight: '700' },
  sectionTitle: { ...typography.subtitle, marginBottom: spacing.sm },
  rowPressed: { opacity: 0.8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowInfo: { flex: 1, marginLeft: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primaryDark, fontWeight: '800', fontSize: 15 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  indicator: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  arrow: { fontSize: 22, color: colors.textFaint, fontWeight: '300' },
  empty: { textAlign: 'center', marginTop: spacing.xl, color: colors.textMuted },
});
