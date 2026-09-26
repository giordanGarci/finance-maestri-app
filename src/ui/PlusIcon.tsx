import { View, type ColorValue } from 'react-native';

interface Props {
  size?: number;
  color?: ColorValue;
}

/** Dependency-free plus glyph built from plain Views (no icon library in this project). */
export function PlusIcon({ size = 16, color = '#3457D5' }: Props) {
  const thickness = Math.max(1.5, size * 0.12);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size, height: thickness, borderRadius: thickness / 2, backgroundColor: color }} />
      <View style={{ position: 'absolute', width: thickness, height: size, borderRadius: thickness / 2, backgroundColor: color }} />
    </View>
  );
}
