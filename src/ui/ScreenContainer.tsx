import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from './theme';
import { useKeyboardHeight } from './useKeyboardHeight';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

export function ScreenContainer({ children, scroll, style, keyboardShouldPersistTaps }: Props) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();

  if (scroll) {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + spacing.xl, keyboardHeight + spacing.xl) },
          style,
        ]}
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
