import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius } from './theme';

type Variant = 'soft' | 'ghost';

interface Props {
  children: React.ReactNode;
  onPress: () => void;
  variant?: Variant;
  size?: number;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

/** Small circular pressable for icon-only actions (header actions, add buttons, etc). */
export function IconButton({ children, onPress, variant = 'soft', size = 36, accessibilityLabel, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        variant === 'soft' && styles.soft,
        pressed && styles.pressed,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  soft: { backgroundColor: colors.primarySoft },
  pressed: { opacity: 0.7 },
});
