import { View, type ColorValue } from 'react-native';

interface Props {
  size?: number;
  color?: ColorValue;
}

/** Dependency-free magnifying glass built from plain Views (no icon library in this project). */
export function SearchIcon({ size = 16, color = '#3457D5' }: Props) {
  const thickness = Math.max(1.5, size * 0.12);
  const lens = size * 0.7;
  const handle = size * 0.45;

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: lens,
          height: lens,
          borderRadius: lens / 2,
          borderWidth: thickness,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: handle,
          height: thickness,
          borderRadius: thickness / 2,
          backgroundColor: color,
          top: size - handle / 2 - thickness,
          left: size - handle,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}
