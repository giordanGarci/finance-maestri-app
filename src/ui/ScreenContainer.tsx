import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from './theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

export function ScreenContainer({ children, scroll, style, keyboardShouldPersistTaps }: Props) {
  const insets = useSafeAreaInsets();

  if (scroll) {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }, style]}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps ?? 'handled'}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.root, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16 },
});
