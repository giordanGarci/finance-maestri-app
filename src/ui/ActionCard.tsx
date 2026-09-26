import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from './theme';
import { Card } from './Card';

interface Props {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Compact tappable card with an icon and label, meant to sit side by side in a quick-actions row. */
export function ActionCard({ icon, label, onPress, style }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrapper, pressed && styles.pressed, style]}>
      <Card style={styles.card}>
        <View style={styles.iconCircle}>{icon}</View>
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  pressed: { opacity: 0.8 },
  card: { alignItems: 'flex-start', gap: spacing.sm },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 13, fontWeight: '700', color: colors.text, lineHeight: 17 },
});
