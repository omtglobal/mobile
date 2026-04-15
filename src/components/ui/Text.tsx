import React from 'react';
import { StyleSheet, Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { usePreferencesStore } from '~/lib/stores/preferences';
import { resolveFontFamily } from '~/constants/fonts';

type TextVariant = keyof typeof import('~/constants/theme').typography;

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'tertiary' | 'brand';
}

const colorKeys = {
  primary: 'textPrimary' as const,
  secondary: 'textSecondary' as const,
  tertiary: 'textTertiary' as const,
  brand: 'brandPrimary' as const,
};

export function Text({
  variant = 'bodyMd',
  color = 'primary',
  style,
  ...props
}: AppTextProps) {
  const { colors, typography } = useTheme();
  const fontId = usePreferencesStore((s) => s.fontId);

  const variantStyle = typography[variant];

  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const effectiveWeight = flat?.fontWeight ?? variantStyle.fontWeight ?? '400';
  const resolved = resolveFontFamily(fontId, String(effectiveWeight));

  return (
    <RNText
      style={[
        variantStyle,
        { color: colors[colorKeys[color]] },
        style,
        resolved ? { fontFamily: resolved, fontWeight: undefined } : undefined,
      ]}
      {...props}
    />
  );
}
