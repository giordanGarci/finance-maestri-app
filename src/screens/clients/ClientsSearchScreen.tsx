import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { Client } from '../../domain/types';
import { filterClientsByName } from '../../domain/clientSearch';
import { listClients } from '../../data/clientsRepository';
import { ScreenContainer } from '../../ui/ScreenContainer';
import { SearchIcon } from '../../ui/SearchIcon';
import { useBottomListPadding } from '../../ui/useBottomListPadding';
import { colors, radius, spacing } from '../../ui/theme';
import { ClientRow } from './ClientRow';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientsSearch'>;

export function ClientsSearchScreen({ navigation }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [term, setTerm] = useState('');
  const bottomPadding = useBottomListPadding();

  useEffect(() => listClients(setClients), []);

  const results = useMemo(() => filterClientsByName(clients, term), [clients, term]);

  return (
    <ScreenContainer>
      <View style={styles.searchBox}>
        <SearchIcon size={16} color={colors.textFaint} />
        <TextInput
          value={term}
          onChangeText={setTerm}
          placeholder="Pesquisar pelo nome"
          placeholderTextColor={colors.textFaint}
          style={styles.searchInput}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        data={results}
        keyExtractor={(client) => client.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <ClientRow client={item} onPress={() => navigation.navigate('ClientDetail', { client: item })} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {clients.length === 0 ? 'Nenhum cliente cadastrado ainda.' : `Nenhum cliente encontrado para "${term.trim()}".`}
          </Text>
        }
        contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: colors.text },
  list: { padding: spacing.lg },
  empty: { textAlign: 'center', marginTop: spacing.lg, color: colors.textMuted },
});
