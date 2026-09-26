import { View, type ColorValue } from 'react-native';

interface Props {
  size?: number;
  color?: ColorValue;
}

/** Dependency-free calendar glyph built from plain Views (no icon library in this project). */
export function CalendarIcon({ size = 20, color = '#3457D5' }: Props) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          top: 2,
          width: size,
          height: size - 2,
          borderRadius: size * 0.16,
          borderWidth: 1.5,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.38,
          width: size,
          height: 1.5,
          backgroundColor: color,
        }}
      />
      <View
        style={{ position: 'absolute', top: 0, left: size * 0.22, width: 1.5, height: 5, backgroundColor: color }}
      />
      <View
        style={{ position: 'absolute', top: 0, right: size * 0.22, width: 1.5, height: 5, backgroundColor: color }}
      />
    </View>
  );
}
