import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from './theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

export function ScreenContainer({ children, scroll, style, keyboardShouldPersistTaps }: Props) {
  if (scroll) {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.scrollContent, style]}
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
  scrollContent: { padding: 16, paddingBottom: 40 },
});
