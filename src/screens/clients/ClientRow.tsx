import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Client, Loan } from '../../domain/types';
import { listLoansByClient } from '../../data/loansRepository';
import { Card } from '../../ui/Card';
import { colors, radius, spacing } from '../../ui/theme';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function ClientRow({ client, onPress }: { client: Client; onPress: () => void }) {
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

const styles = StyleSheet.create({
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
});
