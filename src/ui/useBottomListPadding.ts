import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from './theme';

/** Extra bottom padding for scrollable content so it clears the device's gesture/nav bar. */
export function useBottomListPadding(extra: number = spacing.xl): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + extra;
}
