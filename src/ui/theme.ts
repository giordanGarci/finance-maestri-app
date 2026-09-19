/** Color palette and visual tokens shared across the whole UI. */

export const colors = {
  background: '#F4F6FB',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2FB',
  primary: '#3457D5',
  primaryDark: '#233E9E',
  primarySoft: '#E8ECFC',
  text: '#161B26',
  textMuted: '#68708A',
  textFaint: '#9AA1B5',
  border: '#E3E7F1',
  success: '#1B9C63',
  successSoft: '#E4F7EE',
  danger: '#D9483C',
  dangerSoft: '#FBEAE8',
  warning: '#B4740E',
  warningSoft: '#FBF1DE',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 24, fontWeight: '800' as const, color: colors.text },
  subtitle: { fontSize: 17, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  label: { fontSize: 13, fontWeight: '700' as const, color: colors.textMuted },
  caption: { fontSize: 13, fontWeight: '500' as const, color: colors.textMuted },
};

export const shadow = {
  card: {
    shadowColor: '#101426',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  floating: {
    shadowColor: '#101426',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

export const navigationTheme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.danger,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '600' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '800' as const },
  },
};
