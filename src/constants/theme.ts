/**
 * Design tokens per 04-design-system.md
 */

export const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export const lightColors = {
  brandPrimary: '#FF6B00',
  brandSecondary: '#1A1A2E',
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F5F5F7',
  bgTertiary: '#E8E8ED',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B80',
  textTertiary: '#AEAEB2',
  borderDefault: '#E5E5EA',
  borderStrong: '#C7C7CC',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  ratingStar: '#FFB800',
  badgeChoice: '#FF6B00',
  badgeSale: '#FF3B30',
  badgeBrand: '#007AFF',
  premiumPlus: '#9B59B6',
  discount: '#FF3B30',
} as const;

export const darkColors = {
  brandPrimary: '#FF8533',
  brandSecondary: '#E8E8F0',
  bgPrimary: '#0D0D0D',
  bgSecondary: '#1C1C1E',
  bgTertiary: '#2C2C2E',
  textPrimary: '#F5F5F7',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  borderDefault: '#38383A',
  borderStrong: '#48484A',
  success: '#30D158',
  warning: '#FFD60A',
  error: '#FF453A',
  info: '#0A84FF',
  ratingStar: '#FFB800',
  badgeChoice: '#FF8533',
  badgeSale: '#FF453A',
  badgeBrand: '#0A84FF',
  premiumPlus: '#9B59B6',
  discount: '#FF453A',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const typography = {
  headingXl: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  headingLg: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  headingMd: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  headingSm: { fontSize: 16, fontWeight: '500' as const, lineHeight: 22 },
  bodyLg: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodyMd: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySm: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  caption: { fontSize: 11, fontWeight: '400' as const, lineHeight: 14 },
  priceLg: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30 },
  priceMd: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 20 },
} as const;

export const screenPadding = 16;
export const sectionPaddingVertical = 24;

export type ThemeColors = typeof lightColors;

export const lightTheme = {
  colors: lightColors,
  spacing,
  radius,
  typography,
  shadows,
  isDark: false,
} as const;

export const darkTheme = {
  colors: darkColors,
  spacing,
  radius,
  typography,
  shadows: {
    ...shadows,
    sm: { ...shadows.sm, shadowOpacity: 0.15 },
    md: { ...shadows.md, shadowOpacity: 0.2 },
    lg: { ...shadows.lg, shadowOpacity: 0.25 },
  },
  isDark: true,
} as const;

export type AppTheme = typeof lightTheme | typeof darkTheme;
