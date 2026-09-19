import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radius, spacing, typography } from './theme';

interface Props extends TextInputProps {
  label: string;
}

export function TextField({ label, style, ...campoProps }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>{label}</Text>
      <TextInput placeholderTextColor={colors.textFaint} style={[styles.input, style]} {...campoProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: spacing.md },
  rotulo: { ...typography.label, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
});
