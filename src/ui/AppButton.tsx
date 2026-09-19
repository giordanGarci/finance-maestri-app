import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from './theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger';
type Size = 'default' | 'small';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppButton({ title, onPress, variant = 'primary', size = 'default', disabled, loading, style }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'small' ? styles.small : styles.default,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
      ) : (
        <Text style={[styles.text, textVariantStyles[variant], size === 'small' && styles.textSmall]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  default: { paddingVertical: 14, paddingHorizontal: spacing.lg },
  small: { paddingVertical: 9, paddingHorizontal: spacing.md },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  text: { fontWeight: '700', fontSize: 16 },
  textSmall: { fontSize: 13 },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary, ...shadow.floating, shadowOpacity: 0.12 },
  secondary: { backgroundColor: colors.primarySoft },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  danger: { backgroundColor: colors.danger },
});

const textVariantStyles = StyleSheet.create({
  primary: { color: colors.white },
  secondary: { color: colors.primaryDark },
  outline: { color: colors.primary },
  danger: { color: colors.white },
});
