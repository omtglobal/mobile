import React from 'react';
import { View, Pressable, StyleSheet, type ViewProps } from 'react-native';
import { useTheme } from '~/lib/contexts/ThemeContext';

interface CardProps extends ViewProps {
  onPress?: () => void;
  children: React.ReactNode;
}

export function Card({ onPress, children, style, ...props }: CardProps) {
  const { colors, radius, shadows } = useTheme();

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bgPrimary,
          borderRadius: radius.lg,
          ...shadows.md,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
