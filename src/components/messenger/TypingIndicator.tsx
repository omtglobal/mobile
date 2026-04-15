import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '~/lib/contexts/ThemeContext';

interface TypingIndicatorProps {
  names: string[];
}

function BouncingDot({ delay }: { delay: number }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -4,
          duration: 300,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [delay, translateY]);

  const { colors } = useTheme();

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: colors.textTertiary,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

export function TypingIndicator({ names }: TypingIndicatorProps) {
  const { colors, spacing, radius } = useTheme();

  if (names.length === 0) return null;

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs }]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: colors.bgSecondary,
            borderRadius: radius.lg,
            borderBottomLeftRadius: radius.sm,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
          },
        ]}
      >
        <View style={styles.dots}>
          <BouncingDot delay={0} />
          <BouncingDot delay={150} />
          <BouncingDot delay={300} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
