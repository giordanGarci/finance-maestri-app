import { View, type ColorValue } from 'react-native';

interface Props {
  size?: number;
  color?: ColorValue;
}

/** Dependency-free stacked-coins glyph built from plain Views (no icon library in this project). */
export function CoinsIcon({ size = 20, color = '#3457D5' }: Props) {
  const coin = size * 0.62;

  return (
    <View style={{ width: size, height: size, justifyContent: 'flex-end' }}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: size - coin,
          width: coin,
          height: coin,
          borderRadius: coin / 2,
          borderWidth: 1.5,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: coin,
          height: coin,
          borderRadius: coin / 2,
          borderWidth: 1.5,
          borderColor: color,
        }}
      />
    </View>
  );
}
