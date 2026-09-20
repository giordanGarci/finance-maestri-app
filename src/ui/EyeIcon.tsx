import { View, type ColorValue } from 'react-native';

interface Props {
  open: boolean;
  size?: number;
  color?: ColorValue;
}

/** Dependency-free eye / eye-slash glyph built from plain Views (no icon library in this project). */
export function EyeIcon({ open, size = 20, color = '#FFFFFF' }: Props) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size,
          height: size * 0.6,
          borderRadius: size * 0.3,
          borderWidth: 1.5,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {open ? (
          <View
            style={{
              width: size * 0.28,
              height: size * 0.28,
              borderRadius: size * 0.14,
              backgroundColor: color,
            }}
          />
        ) : null}
      </View>
      {!open ? (
        <View
          style={{
            position: 'absolute',
            width: size * 1.15,
            height: 1.5,
            backgroundColor: color,
            transform: [{ rotate: '45deg' }],
          }}
        />
      ) : null}
    </View>
  );
}
