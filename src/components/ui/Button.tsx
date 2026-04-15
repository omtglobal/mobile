import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  ActivityIndicator,
  type PressableProps,
} from 'react-native';
import { useTheme } from '~/lib/contexts/ThemeContext';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
}

const HEIGHTS = { sm: 32, md: 44, lg: 52 } as const;
const PADDING_H = { sm: 12, md: 16, lg: 20 } as const;
const PADDING_V = { sm: 8, md: 12, lg: 14 } as const;

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const { colors, radius, typography } = useTheme();

  const variantStyles = {
    primary: {
      backgroundColor: colors.brandPrimary,
    },
    secondary: {
      backgroundColor: colors.bgSecondary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.borderDefault,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    destructive: {
      backgroundColor: colors.error,
    },
  };

  const textColors = {
    primary: '#FFFFFF',
    secondary: colors.textPrimary,
    outline: colors.textPrimary,
    ghost: colors.brandPrimary,
    destructive: '#FFFFFF',
  };

  const height = HEIGHTS[size];
  const paddingH = PADDING_H[size];
  const paddingV = PADDING_V[size];

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed, hovered }) => [
        styles.base,
        variantStyles[variant],
        {
          height,
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
          borderRadius: radius.md,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
        typeof style === 'function' ? style({ pressed, hovered }) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={textColors[variant]}
        />
      ) : (
        <Text
          style={[
            typography.button,
            { color: textColors[variant] },
          ]}
          numberOfLines={1}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});
